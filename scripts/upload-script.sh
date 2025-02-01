#!/bin/bash

# Exit on any error
set -e

# Configuration
readonly SERVER_URL="${SERVER_URL:-__SERVER_URL__}"
readonly MIN_SIZE_MB=500
readonly MAX_SIZE_MB=3072
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
  -l, --link URL            Upload file from direct link instead of local file

Examples:
  $(basename "$0") file1.zip file2.zip               # Upload multiple local files
  $(basename "$0") -l https://example.com/file.zip   # Upload from direct link
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
    local -r required_tools=("curl" "jq" "bc")
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

# Upload file using curl
upload_file() {
    local -r file="$1"

    [[ -f "$file" ]] || error "File not found: $file"
    [[ -r "$file" ]] || error "Cannot read file: $file"

    check_file "$file"
    local size_mb
    size_mb=$(get_file_size "$file")

    echo "Uploading: $file (${size_mb}MB)"

    local response
    response=$(curl -s -X POST \
        -H "Content-Type: multipart/form-data" \
        -F "files=@$file" \
        "$SERVER_URL/api/upload")

    handle_response "$response" "$file"
}

# Upload from direct link
upload_from_link() {
    local -r link="$1"

    echo "Uploading from link: $link"

    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"directLink\":\"$link\"}" \
        "$SERVER_URL/api/upload")

    handle_response "$response" "$link"
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
            --) shift; files+=("$@"); break ;;
            -*) error "Unknown option: $1" ;;
            *) files+=("$1"); shift ;;
        esac
    done

    [[ -n "$direct_link" && ${#files[@]} -gt 0 ]] && error "Cannot specify both direct link and files"
    [[ -z "$direct_link" && ${#files[@]} -eq 0 ]] && show_usage

    if [[ -n "$direct_link" ]]; then
        upload_from_link "$direct_link"
    else
        for file in "${files[@]}"; do
            upload_file "$file"
        done
    fi
}

main "$@"
