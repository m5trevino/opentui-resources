#!/bin/bash

# Capture screenshots for all OpenTUI examples using VHS
# Usage: ./capture-all-screenshots.sh [--parallel] [example-name]
#
# Examples:
#   ./capture-all-screenshots.sh                              # Capture all examples
#   ./capture-all-screenshots.sh 01-hello-world               # Capture single example
#   ./capture-all-screenshots.sh --parallel                   # Capture all in parallel
#   ./capture-all-screenshots.sh --parallel 01-hello-world    # Single example (parallel ignored)
#   ./capture-all-screenshots.sh launcher                     # Capture launcher

set -e

# Configuration
WIDTH=1000
HEIGHT=1000
THEME="Dracula"
SLEEP_TIME="1s"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCREENSHOT_DIR="$SCRIPT_DIR/docs/screenshots"

# Check if vhs is installed
if ! command -v vhs &> /dev/null; then
    echo "Error: vhs is not installed. Install it from https://github.com/charmbracelet/vhs"
    exit 1
fi

cd "$SCRIPT_DIR"

# Ensure screenshot directory exists
mkdir -p "$SCREENSHOT_DIR"

# Cleanup temp files on exit
cleanup() {
    rm -f /tmp/opentui-capture-*.tape /tmp/opentui-capture-one.sh 2>/dev/null || true
}
trap cleanup EXIT

# Generate a tape file for an example
generate_tape() {
    local screenshot_path="$1"
    local run_cmd="$2"
    local tape_file="$3"

    cat > "$tape_file" << EOF
Set FontSize 14
Set Width $WIDTH
Set Height $HEIGHT
Set Theme "$THEME"
Set Shell "bash"

Type "$run_cmd"
Enter
Sleep $SLEEP_TIME
Screenshot "$screenshot_path"
Sleep 1s
Type "q"
Sleep 500ms
EOF
}

# Capture a single example
capture_example() {
    local dir="$1"
    local name=$(basename "$dir")
    local tape_file="/tmp/opentui-capture-${name}.tape"

    if [ "$name" = "launcher" ]; then
        generate_tape "$SCREENSHOT_DIR/launcher.png" "bun run launcher" "$tape_file"
    else
        generate_tape "$SCREENSHOT_DIR/${name}.png" "bun run ${dir}index.ts" "$tape_file"
    fi

    vhs "$tape_file"
    rm -f "$tape_file"
}

# Build list of directories to capture
build_dir_list() {
    local dirs=()

    # Add launcher first
    dirs+=("launcher/")

    # Add all examples (glob returns alphabetical order)
    for dir in examples/*/; do
        if [ -f "${dir}index.ts" ]; then
            dirs+=("$dir")
        fi
    done

    printf '%s\n' "${dirs[@]}"
}

# Parse arguments
PARALLEL_MODE=false
EXAMPLE_NAME=""

while [ $# -gt 0 ]; do
    case "$1" in
        --parallel)
            PARALLEL_MODE=true
            shift
            ;;
        *)
            EXAMPLE_NAME="$1"
            shift
            ;;
    esac
done

# Handle single example argument
if [ -n "$EXAMPLE_NAME" ]; then

    # Handle launcher special case
    if [ "$EXAMPLE_NAME" = "launcher" ]; then
        echo "[1/1] Capturing: launcher"
        capture_example "launcher/"
    # Check examples directory
    elif [ -d "examples/$EXAMPLE_NAME" ]; then
        echo "[1/1] Capturing: $EXAMPLE_NAME"
        capture_example "examples/$EXAMPLE_NAME/"
    else
        echo "Error: Example '$EXAMPLE_NAME' not found"
        echo "Available examples:"
        echo "  launcher"
        for dir in examples/*/; do
            echo "  $(basename "$dir")"
        done
        exit 1
    fi

    echo ""
    echo "Screenshot capture complete!"
    exit 0
fi

# Build directory list
mapfile -t DIRS < <(build_dir_list)
TOTAL=${#DIRS[@]}

echo "Found $TOTAL examples to capture"

if [ "$PARALLEL_MODE" = true ]; then
    # Parallel execution (requires GNU parallel)
    if ! command -v parallel &> /dev/null; then
        echo "Error: GNU parallel is not installed. Run without --parallel for sequential execution."
        exit 1
    fi

    echo "Running in parallel mode (4 jobs)..."

    # Create a temporary script for parallel execution
    PARALLEL_SCRIPT="/tmp/opentui-capture-one.sh"
    cat > "$PARALLEL_SCRIPT" << SCRIPT
#!/bin/bash
WIDTH=1000
HEIGHT=1000
THEME="Dracula"
SLEEP_TIME="$SLEEP_TIME"
SCRIPT_DIR="$SCRIPT_DIR"
SCREENSHOT_DIR="$SCREENSHOT_DIR"

dir="\$1"
name=\$(basename "\$dir")
temp_tape="/tmp/opentui-capture-\$\$-\$name.tape"

if [ "\$name" = "launcher" ]; then
    screenshot_path="\$SCREENSHOT_DIR/launcher.png"
    run_cmd="bun run launcher"
else
    screenshot_path="\$SCREENSHOT_DIR/\${name}.png"
    run_cmd="bun run \${dir}index.ts"
fi

cat > "\$temp_tape" << EOF
Set FontSize 14
Set Width \$WIDTH
Set Height \$HEIGHT
Set Theme "\$THEME"
Set Shell "bash"

Type "\$run_cmd"
Enter
Sleep \$SLEEP_TIME
Screenshot "\$screenshot_path"
Sleep 1s
Type "q"
Sleep 500ms
EOF

vhs "\$temp_tape"
rm -f "\$temp_tape"
SCRIPT
    chmod +x "$PARALLEL_SCRIPT"

    printf '%s\n' "${DIRS[@]}" | parallel -j 4 --progress "$PARALLEL_SCRIPT" {}

    rm -f "$PARALLEL_SCRIPT"
else
    # Sequential execution
    echo "Running in sequential mode..."
    CURRENT=0
    for dir in "${DIRS[@]}"; do
        CURRENT=$((CURRENT + 1))
        NAME=$(basename "$dir")
        echo "[$CURRENT/$TOTAL] Capturing: $NAME"
        capture_example "$dir"
    done
fi

echo ""
echo "Screenshot capture complete!"

# Verify screenshots were created
SCREENSHOT_COUNT=$(find "$SCREENSHOT_DIR" -name "*.png" -type f 2>/dev/null | wc -l)
echo "Created $SCREENSHOT_COUNT screenshots in $SCREENSHOT_DIR"
