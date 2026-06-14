---
name: opentui-screenshot-verify
description: Visual verification tool for OpenTUI applications. Captures macOS screenshots of terminal output, analyzes TUI rendering, and provides feedback for development workflows. Use when developing or debugging terminal user interfaces to validate visual output.
version: 0.1.0
license: MIT
---

# OpenTUI Screenshot Verification

## Overview

This skill enables rapid visual verification of OpenTUI and terminal-based applications by:
- Capturing macOS screenshots of terminal windows
- Analyzing screenshot content using vision models
- Providing structured feedback on UI rendering
- Supporting iterative TUI development workflows

## Prerequisites

- **Platform**: macOS (uses `screencapture` utility)
- **Terminal**: Kitty, iTerm2, Terminal.app, or any macOS terminal
- **Multiplexer**: Works with Zellij, tmux, screen
- **Dependencies**: `screencapture` (built-in), `jq` (for JSON processing)

## Quick Start

### 1. Basic Screenshot Capture

```bash
./bin/screenshot-capture.sh output.png
```

### 2. Capture with Delay

```bash
# Wait 2 seconds before capture (useful for animations)
./bin/screenshot-capture.sh output.png 2
```

### 3. Capture and Analyze

```bash
./bin/screenshot-verify.sh \
  --app "bun dev" \
  --wait 1 \
  --output verification-report.json \
  --prompt "Verify the dashboard renders correctly with no flickering"
```

## Architecture

### Components

1. **screenshot-capture.sh** - Core screenshot capture logic
2. **screenshot-verify.sh** - Full verification workflow orchestrator
3. **analyze-screenshot.sh** - Vision model analysis integration
4. **report-generator.sh** - Structured report generation

### Workflow

```
┌─────────────────┐
│  Start TUI App  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Wait Period    │ (configurable delay)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Capture Screen  │ (screencapture)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Analyze Image   │ (vision model)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Report │ (JSON/markdown)
└─────────────────┘
```

## Usage Patterns

### Pattern 1: Quick Visual Check

Capture current terminal state:

```bash
./bin/screenshot-capture.sh ~/Desktop/tui-state.png
open ~/Desktop/tui-state.png
```

### Pattern 2: Automated Development Loop

Verify TUI after each change:

```bash
# In watch mode
while true; do
  clear
  bun dev &
  APP_PID=$!
  sleep 2
  ./bin/screenshot-capture.sh /tmp/tui-current.png
  kill $APP_PID
  ./bin/analyze-screenshot.sh /tmp/tui-current.png \
    "Check for rendering issues, alignment problems, or visual bugs"
  sleep 5
done
```

### Pattern 3: Regression Testing

Compare screenshots before/after changes:

```bash
# Capture baseline
./bin/screenshot-capture.sh baseline.png

# Make changes...

# Capture after changes
./bin/screenshot-capture.sh current.png

# Visual diff (requires imagemagick)
compare baseline.png current.png diff.png
```

### Pattern 4: Multi-State Verification

Verify multiple UI states:

```bash
#!/usr/bin/env bash
# verify-all-states.sh

states=("empty" "populated" "error" "loading")

for state in "${states[@]}"; do
  echo "Testing $state state..."

  # Setup state
  case $state in
    empty)   rm -f ~/.rom-manager/library.db ;;
    populated) ./seed-data.sh ;;
    error)   ./trigger-error.sh ;;
    loading) export SLOW_INIT=true ;;
  esac

  # Capture
  bun dev &
  PID=$!
  sleep 2
  ./bin/screenshot-capture.sh "screenshots/$state.png"
  kill $PID

  # Verify
  ./bin/analyze-screenshot.sh \
    "screenshots/$state.png" \
    "Verify $state state renders correctly" \
    > "reports/$state.json"
done
```

## Screenshot Capture Options

### Interactive Mode

```bash
# User selects window
screencapture -i output.png
```

### Window-Only Mode

```bash
# Capture specific window (no shadow)
screencapture -o -w output.png
```

### Timed Capture

```bash
# 5-second delay
screencapture -T 5 output.png
```

### Clipboard Mode

```bash
# Save to clipboard instead of file
screencapture -c
```

## Analysis Prompts

### UI Rendering Verification

```
"Analyze this terminal UI screenshot and verify:
1. No visual glitches or rendering artifacts
2. Text is aligned correctly in columns
3. Box-drawing characters render properly
4. Colors are consistent and readable
5. No text overflow or truncation"
```

### Empty State Check

```
"Verify this empty state screen shows:
1. Clear onboarding instructions
2. Next steps for the user
3. Proper formatting and alignment
4. Helpful context about what to do"
```

### Performance Indicators

```
"Check for performance issues:
1. Any visible flickering or double-renders
2. Screen tearing or artifacts
3. Incomplete renders or partial updates
4. Loading states displaying correctly"
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: TUI Visual Regression

on: [push, pull_request]

jobs:
  visual-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run TUI and capture
        run: |
          bun dev &
          APP_PID=$!
          sleep 2
          screencapture -x /tmp/tui.png
          kill $APP_PID

      - name: Analyze screenshot
        run: ./bin/analyze-screenshot.sh /tmp/tui.png

      - name: Upload screenshot
        uses: actions/upload-artifact@v3
        with:
          name: tui-screenshot
          path: /tmp/tui.png
```

## Troubleshooting

### Issue: "screencapture: no file specified"

**Solution**: Ensure output path is provided:
```bash
screencapture output.png
```

### Issue: Permission denied

**Solution**: Grant Terminal.app or Kitty.app screen recording permissions:
```
System Settings → Privacy & Security → Screen Recording → Enable Kitty
```

### Issue: Wrong window captured

**Solution**: Use `-i` flag for interactive selection:
```bash
screencapture -i output.png
```

### Issue: Screenshots are black

**Solution**: Terminal may need accessibility permissions:
```
System Settings → Privacy & Security → Accessibility → Enable Kitty
```

## Best Practices

1. **Consistent Timing**: Use fixed delays for reproducible captures
2. **Clean State**: Reset terminal state before captures
3. **Baseline Comparisons**: Keep reference screenshots for regression testing
4. **Automated Verification**: Integrate into development workflow
5. **Prompt Engineering**: Use specific, detailed analysis prompts
6. **Version Control**: Track baseline screenshots in git with LFS

## Advanced Features

### Window-Specific Capture (Requires AppleScript)

```bash
#!/usr/bin/env bash
# capture-kitty-window.sh

window_id=$(osascript -e 'tell application "Kitty" to get id of front window')
screencapture -l "$window_id" -o output.png
```

### Animated GIF Creation

```bash
# Capture sequence
for i in {1..10}; do
  screencapture -x "frame-$i.png"
  sleep 0.5
done

# Create GIF (requires imagemagick)
convert -delay 50 frame-*.png output.gif
```

### Diff Highlighting

```bash
# Requires imagemagick
compare -highlight-color red baseline.png current.png \
  -compose src diff-highlighted.png
```

## References

- [macOS screencapture man page](https://ss64.com/osx/screencapture.html)
- [ImageMagick compare tool](https://imagemagick.org/script/compare.php)
- [Terminal screenshot best practices](https://github.com/caksoylar/vim-mysticaltutor)

## Version History

- **0.1.0** (2026-02-01): Initial release with core screenshot and analysis features
