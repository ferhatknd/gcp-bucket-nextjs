#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Show usage information
show_usage() {
    echo -e "Usage: $0 [OPTIONS] FILE1 [FILE2 ...]"
    echo
    echo "Options:"
    echo "  -h, --help                 Show this help message"
    echo "  -l, --link URL            Upload file from direct link instead of local file"
    echo
    echo "Examples:"
    echo "  $0 file1.zip file2.zip               # Upload multiple local files"
    echo "  $0 -l https://example.com/file.zip   # Upload from direct link"
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
    command -v curl >/dev/null 2>&1 || error "curl is required but not installed"
    command -v jq >/dev/null 2>&1 || error "jq is required but not installed"
}

# Check file type and size
check_file() {
    local file="$1"
    local ext="${file##*.}"

    # Check file extension
    if [[ ! "$ext" =~ ^(zip)$ ]]; then
        error "Invalid file type. Only zip files are allowed"
    fi

    # Get file size in MB
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local size_mb=$(echo "scale=2; $size/1048576" | bc)

    # Check file size (500MB - 3072MB)
    if (( $(echo "$size_mb < 500" | bc -l) )) || (( $(echo "$size_mb > 3072" | bc -l) )); then
        error "File size must be between 500MB and 3072MB. Current size: ${size_mb}MB"
    fi
}

# Upload file using curl
upload_file() {
    local file="$1"

    # Check if file exists and is readable
    [[ -f "$file" ]] || error "File not found: $file"
    [[ -r "$file" ]] || error "Cannot read file: $file"

    # Check file type and size
    check_file "$file"

    # Get file size in bytes
    local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)

    # Convert size to MB for display
    local size_mb=$(echo "scale=2; $size/1048576" | bc)

    echo "Uploading: $file (${size_mb}MB)"

    # Perform the upload
    local response=$(curl -s -X POST \
        -H "Content-Type: multipart/form-data" \
        -F "files=@$file" \
        "$SERVER_URL/api/upload")

    # Check if the upload was successful
    if echo "$response" | jq -e '.error' >/dev/null; then
        error "Upload failed: $(echo "$response" | jq -r '.error')"
    else
        success "Successfully uploaded: $file"
        echo "Download URL: $(echo "$response" | jq -r '.files[0].url')"
    fi
}

# Upload from direct link
upload_from_link() {
    local link="$1"

    echo "Uploading from link: $link"

    # Perform the upload
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"directLink\":\"$link\"}" \
        "$SERVER_URL/api/upload")

    # Check if the upload was successful
    if echo "$response" | jq -e '.error' >/dev/null; then
        error "Upload failed: $(echo "$response" | jq -r '.error')"
    else
        success "Successfully uploaded from link"
        echo "Download URL: $(echo "$response" | jq -r '.file.url')"
    fi
}

# Main script
main() {
    check_requirements

    local direct_link=""
    local files=()

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                ;;
            -l|--link)
                direct_link="$2"
                shift 2
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                files+=("$1")
                shift
                ;;
        esac
    done

    # Validate arguments
    if [[ -n "$direct_link" && ${#files[@]} -gt 0 ]]; then
        error "Cannot specify both direct link and files"
    fi

    if [[ -z "$direct_link" && ${#files[@]} -eq 0 ]]; then
        show_usage
    fi

    # Perform upload
    if [[ -n "$direct_link" ]]; then
        upload_from_link "$direct_link"
    else
        for file in "${files[@]}"; do
            upload_file "$file"
        done
    fi
}

# Set server URL
SERVER_URL="__SERVER_URL__"

# Run main function
main "$@"
