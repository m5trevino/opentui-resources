# OpenTUI Screenshot Verify

> 📸 Visual verification toolkit for OpenTUI and terminal-based applications

Rapid screenshot capture and AI-powered analysis for terminal user interface development on macOS.

## Features

- **Zero-configuration screenshot capture** using macOS `screencapture`
- **Automated TUI verification workflows** - launch, capture, analyze
- **Vision model integration** for AI-powered visual analysis
- **Works with any terminal** - Kitty, iTerm2, Terminal.app
- **Multiplexer-friendly** - Zellij, tmux, screen compatible
- **CI/CD ready** - GitHub Actions examples included

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/AIntelligentTech/opentui-screenshot-verify.git
cd opentui-screenshot-verify
chmod +x bin/*.sh
```

### 2. Capture a Screenshot

```bash
# Basic capture
./bin/screenshot-capture.sh screenshot.png

# With 2-second delay
./bin/screenshot-capture.sh screenshot.png -d 2

# Interactive window selection
./bin/screenshot-capture.sh screenshot.png -i
```

### 3. Full Verification Workflow

```bash
# Launch app, capture, and analyze
./bin/screenshot-verify.sh \
  --app "bun dev" \
  --wait 2 \
  --prompt "Verify dashboard renders without flickering" \
  --output report.json
```

## Usage

### Screenshot Capture

```bash
./bin/screenshot-capture.sh <output-file> [options]

Options:
  -d, --delay SECONDS    Wait before capturing
  -i, --interactive      User selects area/window
  -w, --window          Capture window only
  -s, --no-shadow       Omit window shadow
  -c, --clipboard       Copy to clipboard
```

### Verification Workflow

```bash
./bin/screenshot-verify.sh [options]

Required:
  -a, --app CMD         Command to launch TUI app

Options:
  -w, --wait SECONDS    Wait time before screenshot (default: 1)
  -p, --prompt TEXT     Analysis prompt
  -o, --output FILE     Save report to JSON
  -s, --screenshot PATH Screenshot save location
  -k, --keep           Keep screenshot after analysis
  -v, --verbose        Verbose output
```

## Use Cases

### Development Workflow

```bash
# Quick visual check during development
./bin/screenshot-capture.sh /tmp/current.png -d 1
open /tmp/current.png
```

### Automated Testing

```bash
# Verify empty state
./bin/screenshot-verify.sh \
  --app "npm start" \
  --wait 2 \
  --prompt "Verify empty state shows onboarding instructions" \
  --output tests/screenshots/empty-state.json
```

### Regression Testing

```bash
# Capture baseline
./bin/screenshot-capture.sh baseline.png

# Make changes...

# Compare (requires ImageMagick)
./bin/screenshot-capture.sh current.png
compare baseline.png current.png diff.png
```

### CI/CD Integration

```yaml
# .github/workflows/visual-test.yml
name: Visual Regression Test

on: [push, pull_request]

jobs:
  screenshot-test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup environment
        run: bun install

      - name: Run verification
        run: |
          ./bin/screenshot-verify.sh \
            --app "bun dev" \
            --wait 2 \
            --output verification-report.json

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: |
            **/*.png
            verification-report.json
```

## Requirements

- **macOS** - Uses built-in `screencapture` utility
- **Bash 4.0+** - Available on modern macOS
- **Screen Recording Permissions** - Grant to your terminal app:
  ```
  System Settings → Privacy & Security → Screen Recording → Enable Terminal/Kitty
  ```

## Architecture

```
opentui-screenshot-verify/
├── bin/
│   ├── screenshot-capture.sh    # Core capture utility
│   ├── screenshot-verify.sh     # Full workflow orchestrator
│   └── analyze-screenshot.sh    # Vision model integration (future)
├── docs/
│   ├── development.md           # Development guide
│   └── examples.md              # Usage examples
├── examples/
│   ├── basic-capture.sh
│   ├── automated-testing.sh
│   └── regression-suite.sh
└── SKILL.md                     # Claude Code skill definition
```

## Examples

See [`examples/`](./examples/) directory for complete examples:

- **Basic Capture** - Simple screenshot workflows
- **Automated Testing** - Full TUI testing setup
- **Regression Suite** - Before/after comparison
- **Multi-State Verification** - Test multiple UI states

## Integration with Claude Code

This tool is designed as a Claude Code skill. To use:

1. **Symlink to skills directory**:
   ```bash
   ln -s "$(pwd)" ~/.claude/skills/opentui-screenshot-verify
   ```

2. **Use in Claude Code**:
   ```
   Please use the opentui-screenshot-verify skill to capture
   and analyze the current TUI state
   ```

3. **Claude will**:
   - Run the verification workflow
   - Capture the screenshot
   - Use vision models to analyze
   - Provide structured feedback

## Troubleshooting

### Permission Errors

Grant screen recording permissions:
```
System Settings → Privacy & Security → Screen Recording
```

### Screenshots Are Black

Terminal needs accessibility permissions:
```
System Settings → Privacy & Security → Accessibility
```

### Wrong Window Captured

Use interactive mode:
```bash
./bin/screenshot-capture.sh output.png -i
```

## Development

### Running Tests

```bash
# Basic functionality test
./bin/screenshot-capture.sh /tmp/test.png
[[ -f /tmp/test.png ]] && echo "✓ Capture works"

# Workflow test
./bin/screenshot-verify.sh --app "echo test" --wait 1
```

### Adding New Features

1. Create feature script in `bin/`
2. Add tests in `tests/`
3. Update `SKILL.md` documentation
4. Add example to `examples/`

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details

## Credits

Created by [AIntelligent Technologies](https://github.com/AIntelligentTech)

Part of the [cofounder-core](https://github.com/AIntelligentTech/cofounder-core) ecosystem.

## Related Projects

- [OpenTUI](https://github.com/opentui/opentui) - Terminal UI framework
- [cofounder-core](https://github.com/AIntelligentTech/cofounder-core) - AI business operating system
- [rom-manager-tui](https://github.com/AIntelligentTech/rom-manager-tui) - Example TUI application

---

**Built with ❤️ for the terminal UI community**
