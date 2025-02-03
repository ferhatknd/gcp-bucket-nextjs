#!/bin/bash

# Exit on any error
set -e

# Configuration
readonly SERVER_URL="${SERVER_URL:-__SERVER_URL__}"
readonly MIN_SIZE_MB=512
readonly MAX_SIZE_MB=3072
readonly KERNEL_MIN_SIZE_MB=9
readonly KERNEL_MAX_SIZE_MB=51
readonly ALLOWED_EXTENSIONS=("zip")

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'

# Show usage information
show_usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] FILE1 [FILE2 ...]

Options:
  -h, --help                 Show this help message
  -l, --link URL            Upload file from direct link
  -k, --kernel              Upload a kernel file (ZIP only, 10MB-50MB)

Examples:
  $(basename "$0") file1.zip file2.zip               # Upload multiple files
  $(basename "$0") -l https://example.com/file.zip   # Upload from direct link
  $(basename "$0") -k kernel.zip                     # Upload kernel file
EOF
    exit 1
}

# Error handling function
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Success message function
success() {
    echo -e "${GREEN}$1${NC}"
}

# Warning message function
warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    local -r required_tools=("curl" "jq" "bc" "awk")
    for tool in "${required_tools[@]}"; do
        command -v "$tool" >/dev/null 2>&1 || error "$tool is required but not installed"
    done

    [[ -n "$SERVER_URL" && "$SERVER_URL" != "__SERVER_URL__" ]] || error "SERVER_URL must be set"
}

# Check file type and size
check_file() {
    local -r file="$1"
    local -r is_direct_link="${2:-false}"

    if [[ "$is_direct_link" != "true" ]]; then
        local ext
        ext="${file##*.}"
        ext="${ext,,}" # Convert to lowercase
        local valid_ext=false
        for allowed in "${ALLOWED_EXTENSIONS[@]}"; do
            [[ "$ext" == "$allowed" ]] && valid_ext=true
        done
        "$valid_ext" || error "Invalid file type. Allowed extensions: ${ALLOWED_EXTENSIONS[*]}"
    fi

    local size_mb
    size_mb=$(get_file_size "$file")

    if (( $(echo "$size_mb < $MIN_SIZE_MB" | bc -l) )) || (( $(echo "$size_mb > $MAX_SIZE_MB" | bc -l) )); then
        error "File size must be between ${MIN_SIZE_MB}MB and ${MAX_SIZE_MB}MB. Current size: ${size_mb}MB"
    fi
}

# Get file size in MB
get_file_size() {
    local -r file="$1"
    local size
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    echo "scale=2; $size/1048576" | bc
}

# Format size with units
format_size() {
    local bytes=$1
    if [[ $bytes -lt 1024 ]]; then
        echo "${bytes}B"
    elif [[ $bytes -lt 1048576 ]]; then
        echo "$(echo "scale=1; $bytes/1024" | bc)KB"
    else
        echo "$(echo "scale=1; $bytes/1048576" | bc)MB"
    fi
}

# Format speed
format_speed() {
    local bytes_per_sec=$1
    if [[ $bytes_per_sec -lt 1024 ]]; then
        echo "${bytes_per_sec}B/s"
    elif [[ $bytes_per_sec -lt 1048576 ]]; then
        echo "$(echo "scale=1; $bytes_per_sec/1024" | bc)KB/s"
    else
        echo "$(echo "scale=1; $bytes_per_sec/1048576" | bc)MB/s"
    fi
}

# Upload kernel
upload_kernel() {
    local -r file="$1"

    [[ -f "$file" ]] || error "Kernel file not found: $file"
    [[ -r "$file" ]] || error "Cannot read kernel file: $file"

    local ext="${file##*.}"
    [[ "${ext,,}" == "zip" ]] || error "Kernel file must be a ZIP file"

    local size_mb
    size_mb=$(get_file_size "$file")

    if (( $(echo "$size_mb < $KERNEL_MIN_SIZE_MB" | bc -l) )) || (( $(echo "$size_mb > $KERNEL_MAX_SIZE_MB" | bc -l) )); then
        error "Kernel file size must be between ${KERNEL_MIN_SIZE_MB}MB and ${KERNEL_MAX_SIZE_MB}MB. Current size: ${size_mb}MB"
    fi

    echo "Uploading kernel: $file (${size_mb}MB)"

    local start_time=$(date +%s.%N)
    local response
    response=$(curl -X POST \
        -H "Content-Type: multipart/form-data" \
        -F "files=@$file" \
        --progress-bar \
        "$SERVER_URL/api/upload-kernel")
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local avg_speed=$(echo "$file_size / $duration" | bc)

    if ! echo "$response" | jq -e '.' >/dev/null 2>&1; then
        error "Invalid JSON response from server: $response"
    fi

    if echo "$response" | jq -e '.message == "Kernel uploaded successfully"' >/dev/null 2>&1; then
        success "Successfully uploaded kernel: $file"
        echo "Time taken: $(printf "%.2f" $duration)s"
        echo "Average speed: $(format_speed $avg_speed)"
        echo "Download URL: $(echo "$response" | jq -r '.kernel.url')"
        echo "Checksum (SHA-256): $(echo "$response" | jq -r '.kernel.checksum')"
    else
        error "Upload failed: $(echo "$response" | jq -r '.message // "Unknown error"')"
    fi
}

# Upload file using curl
upload_file() {
    local -r file="$1"

    [[ -f "$file" ]] || error "File not found: $file"
    [[ -r "$file" ]] || error "Cannot read file: $file"

    check_file "$file"
    local size_mb
    size_mb=$(get_file_size "$file")

    echo "Uploading: $file (${size_mb}MB)"

    local start_time=$(date +%s.%N)
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: multipart/form-data" \
        -F "files=@$file" \
        --progress-bar \
        "$SERVER_URL/api/upload")
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local avg_speed=$(echo "$file_size / $duration" | bc)

    handle_response "$response" "$file"
    echo "Time taken: $(printf "%.2f" $duration)s"
    echo "Average speed: $(format_speed $avg_speed)"
}

# Upload from direct link
upload_from_link() {
    local -r link="$1"

    echo "Uploading from link: $link"

    local start_time=$(date +%s.%N)
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"directLink\":\"$link\"}" \
        --progress-bar \
        "$SERVER_URL/api/upload")
    local end_time=$(date +%s.%N)
    local duration=$(echo "$end_time - $start_time" | bc)

    handle_response "$response" "$link"
    echo "Time taken: $(printf "%.2f" $duration)s"
}

# Handle API response
handle_response() {
    local -r response="$1"
    local -r source="$2"

    if echo "$response" | jq -e '.error' >/dev/null; then
        error "Upload failed for $source: $(echo "$response" | jq -r '.error')"
    else
        success "Successfully uploaded: $source"
        echo "Download URL: $(echo "$response" | jq -r '.files[0].url // .file.url')"
    fi
}

# Main script
main() {
    check_requirements

    local direct_link=""
    local is_kernel=false
    local files=()

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help) show_usage ;;
            -l|--link)
                shift
                [[ $# -gt 0 ]] || error "Missing URL after --link"
                direct_link="$1"
                shift
                ;;
            -k|--kernel)
                is_kernel=true
                shift
                ;;
            --) shift; files+=("$@"); break ;;
            -*) error "Unknown option: $1" ;;
            *) files+=("$1"); shift ;;
        esac
    done

    # Update usage info
    [[ -n "$direct_link" && ${#files[@]} -gt 0 ]] && error "Cannot specify both direct link and files"
    [[ -z "$direct_link" && ${#files[@]} -eq 0 ]] && show_usage

    if [[ "$is_kernel" == "true" ]]; then
        [[ ${#files[@]} -eq 1 ]] || error "Kernel upload requires exactly one file"
        upload_kernel "${files[0]}"
    elif [[ -n "$direct_link" ]]; then
        upload_from_link "$direct_link"
    else
        for file in "${files[@]}"; do
            upload_file "$file"
        done
    fi
}

main "$@"
