#!/usr/bin/env bash
#
# screenshot-verify.sh - Full verification workflow orchestrator
# Launches app, captures screenshot, analyzes with vision model
#
# Usage:
#   ./screenshot-verify.sh --app "bun dev" --wait 2 --prompt "Verify UI" [--output report.json]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION="0.1.0"

# Default values
APP_CMD=""
WAIT_TIME=1
PROMPT="Analyze this terminal UI screenshot for visual issues, rendering problems, or alignment errors."
OUTPUT_FILE=""
SCREENSHOT_PATH="/tmp/tui-screenshot-$(date +%s).png"
CLEANUP=true
VERBOSE=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

usage() {
  cat <<EOF
Screenshot Verification Workflow v${VERSION}

Usage: $(basename "$0") [options]

Required:
  -a, --app CMD       Command to launch TUI app (e.g., "bun dev")

Options:
  -w, --wait SECONDS  Seconds to wait before screenshot (default: 1)
  -p, --prompt TEXT   Analysis prompt for vision model
  -o, --output FILE   Save analysis report to file (JSON)
  -s, --screenshot    Path for screenshot (default: /tmp/tui-screenshot-*.png)
  -k, --keep          Keep screenshot after analysis
  -v, --verbose       Verbose output
  -h, --help          Show this help

Examples:
  # Basic verification
  $(basename "$0") --app "bun dev" --wait 2

  # Custom analysis
  $(basename "$0") \\
    --app "python app.py" \\
    --wait 3 \\
    --prompt "Check for empty state onboarding" \\
    --output report.json

  # Keep screenshot for manual inspection
  $(basename "$0") --app "bun dev" --keep --screenshot ~/Desktop/tui.png
EOF
}

check_dependencies() {
  if ! command -v screencapture &>/dev/null; then
    error "screencapture not found (macOS required)"
    exit 1
  fi
}

launch_app() {
  local cmd="$1"
  log "Launching app: $cmd"

  # Launch app in background
  if [[ "$VERBOSE" == true ]]; then
    eval "$cmd" &
  else
    eval "$cmd" >/dev/null 2>&1 &
  fi

  local pid=$!
  echo "$pid"
}

wait_and_capture() {
  local wait_time="$1"
  local output="$2"

  log "Waiting ${wait_time}s for app to initialize..."
  sleep "$wait_time"

  log "Capturing screenshot..."
  "$SCRIPT_DIR/screenshot-capture.sh" "$output"

  if [[ ! -f "$output" ]]; then
    error "Screenshot capture failed"
    return 1
  fi

  success "Screenshot captured: $output"
  return 0
}

analyze_screenshot() {
  local screenshot="$1"
  local prompt="$2"

  log "Analyzing screenshot with vision model..."

  # Check if screenshot exists and is valid
  if [[ ! -f "$screenshot" ]]; then
    error "Screenshot file not found: $screenshot"
    return 1
  fi

  local file_size=$(stat -f%z "$screenshot" 2>/dev/null || echo "0")
  if [[ "$file_size" -lt 1000 ]]; then
    error "Screenshot file is too small (${file_size} bytes) - likely invalid"
    return 1
  fi

  # For now, output a placeholder. This would integrate with Claude API
  # or use the Read tool in Claude Code to analyze the image
  cat <<EOF
{
  "screenshot": "$screenshot",
  "prompt": "$prompt",
  "file_size": "$file_size",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "ready_for_analysis",
  "note": "Use Claude Code's Read tool to analyze this image with the prompt above"
}
EOF
}

cleanup() {
  if [[ "$CLEANUP" == true ]] && [[ -f "$SCREENSHOT_PATH" ]]; then
    log "Cleaning up screenshot: $SCREENSHOT_PATH"
    rm -f "$SCREENSHOT_PATH"
  fi
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      usage
      exit 0
      ;;
    -a|--app)
      APP_CMD="$2"
      shift 2
      ;;
    -w|--wait)
      WAIT_TIME="$2"
      shift 2
      ;;
    -p|--prompt)
      PROMPT="$2"
      shift 2
      ;;
    -o|--output)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    -s|--screenshot)
      SCREENSHOT_PATH="$2"
      shift 2
      ;;
    -k|--keep)
      CLEANUP=false
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      error "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

# Validation
if [[ -z "$APP_CMD" ]]; then
  error "App command required (--app)"
  usage
  exit 1
fi

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Main workflow
check_dependencies

# Launch app
APP_PID=$(launch_app "$APP_CMD")
log "App PID: $APP_PID"

# Wait and capture
if ! wait_and_capture "$WAIT_TIME" "$SCREENSHOT_PATH"; then
  kill "$APP_PID" 2>/dev/null || true
  error "Capture failed"
  exit 1
fi

# Kill app
kill "$APP_PID" 2>/dev/null || true
log "App stopped"

# Analyze
ANALYSIS=$(analyze_screenshot "$SCREENSHOT_PATH" "$PROMPT")

# Output results
if [[ -n "$OUTPUT_FILE" ]]; then
  echo "$ANALYSIS" > "$OUTPUT_FILE"
  success "Analysis saved to: $OUTPUT_FILE"
else
  echo "$ANALYSIS"
fi

success "Verification complete"
