#!/usr/bin/env bash
#
# screenshot-capture.sh - Core screenshot capture utility
# Captures macOS screenshots with configurable options
#
# Usage:
#   ./screenshot-capture.sh <output-file> [delay-seconds]
#
# Examples:
#   ./screenshot-capture.sh output.png
#   ./screenshot-capture.sh output.png 2
#   ./screenshot-capture.sh output.png 0 --interactive

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION="0.1.0"

# Default values
OUTPUT_FILE=""
DELAY=0
INTERACTIVE=false
WINDOW_ONLY=false
NO_SHADOW=false
CLIPBOARD=false

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
usage() {
  cat <<EOF
Screenshot Capture Utility v${VERSION}

Usage: $(basename "$0") <output-file> [options]

Arguments:
  output-file         Path where screenshot will be saved

Options:
  -d, --delay SECONDS Wait SECONDS before capturing (default: 0)
  -i, --interactive   Interactive mode - user selects area/window
  -w, --window        Capture window only (no desktop)
  -s, --no-shadow     Omit window shadow (only with -w)
  -c, --clipboard     Copy to clipboard instead of saving
  -h, --help          Show this help message

Examples:
  # Basic capture
  $(basename "$0") screenshot.png

  # Wait 2 seconds before capture
  $(basename "$0") screenshot.png -d 2

  # Interactive window selection
  $(basename "$0") screenshot.png -i

  # Capture window without shadow
  $(basename "$0") screenshot.png -w -s

  # Copy to clipboard
  $(basename "$0") temp.png -c
EOF
}

log() {
  echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"
}

error() {
  echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

check_dependencies() {
  if ! command -v screencapture &>/dev/null; then
    error "screencapture not found. This tool requires macOS."
    exit 1
  fi
}

capture_screenshot() {
  local output="$1"
  local args=()

  # Add delay if specified
  if [[ $DELAY -gt 0 ]]; then
    args+=("-T" "$DELAY")
  fi

  # Interactive mode
  if [[ "$INTERACTIVE" == true ]]; then
    args+=("-i")
  fi

  # Window only mode
  if [[ "$WINDOW_ONLY" == true ]]; then
    args+=("-w")
  fi

  # No shadow
  if [[ "$NO_SHADOW" == true ]]; then
    args+=("-o")
  fi

  # Clipboard mode
  if [[ "$CLIPBOARD" == true ]]; then
    args+=("-c")
  fi

  # Disable sound and don't show cursor
  args+=("-x")

  # Add output file (unless clipboard mode)
  if [[ "$CLIPBOARD" != true ]]; then
    args+=("$output")
  fi

  # Execute capture
  log "Capturing screenshot..."
  if [[ $DELAY -gt 0 ]]; then
    log "Waiting ${DELAY} seconds..."
  fi

  if screencapture "${args[@]}"; then
    if [[ "$CLIPBOARD" == true ]]; then
      success "Screenshot copied to clipboard"
    else
      success "Screenshot saved to: $output"
      # Get file size
      if [[ -f "$output" ]]; then
        local size=$(du -h "$output" | cut -f1)
        log "File size: $size"
      fi
    fi
    return 0
  else
    error "Screenshot capture failed"
    return 1
  fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      usage
      exit 0
      ;;
    -d|--delay)
      DELAY="$2"
      shift 2
      ;;
    -i|--interactive)
      INTERACTIVE=true
      shift
      ;;
    -w|--window)
      WINDOW_ONLY=true
      shift
      ;;
    -s|--no-shadow)
      NO_SHADOW=true
      shift
      ;;
    -c|--clipboard)
      CLIPBOARD=true
      shift
      ;;
    -*)
      error "Unknown option: $1"
      usage
      exit 1
      ;;
    *)
      if [[ -z "$OUTPUT_FILE" ]]; then
        OUTPUT_FILE="$1"
      else
        error "Multiple output files specified"
        usage
        exit 1
      fi
      shift
      ;;
  esac
done

# Validation
if [[ -z "$OUTPUT_FILE" ]] && [[ "$CLIPBOARD" != true ]]; then
  error "Output file required (or use --clipboard)"
  usage
  exit 1
fi

# Create output directory if needed
if [[ -n "$OUTPUT_FILE" ]] && [[ "$CLIPBOARD" != true ]]; then
  mkdir -p "$(dirname "$OUTPUT_FILE")"
fi

# Main execution
check_dependencies
capture_screenshot "$OUTPUT_FILE"
