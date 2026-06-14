# Capturing Terminal Screenshots

This project uses [vhs](https://github.com/charmbracelet/vhs) from Charm to capture terminal screenshots programmatically.

## Prerequisites

Install vhs and its dependency ttyd:

```bash
brew install vhs ttyd
```

## Usage

### 1. Create a tape file

Create a `.tape` file that defines the recording:

```tape
Set FontSize 14
Set Width 1200
Set Height 1200
Set Theme "Dracula"
Set Shell "bash"

Type "bun run launcher/index.ts"
Enter
Sleep 5s
Screenshot launcher-screenshot.png
Type "q"
Sleep 500ms
```

### 2. Run vhs

```bash
vhs launcher.tape
```

The screenshot will be saved to the specified filename in the current directory.

## Tape File Reference

### Settings

| Setting | Description | Example |
|---------|-------------|---------|
| `Set FontSize` | Terminal font size | `Set FontSize 14` |
| `Set Width` | Terminal width in pixels | `Set Width 1200` |
| `Set Height` | Terminal height in pixels | `Set Height 1200` |
| `Set Theme` | Color theme | `Set Theme "Dracula"` |
| `Set Shell` | Shell to use | `Set Shell "bash"` |

### Commands

| Command | Description | Example |
|---------|-------------|---------|
| `Type` | Type text into terminal | `Type "bun run app.ts"` |
| `Enter` | Press enter key | `Enter` |
| `Sleep` | Wait for duration | `Sleep 5s` |
| `Screenshot` | Capture screenshot | `Screenshot output.png` |

## Example Tape File

See `launcher.tape` in the project root for a working example.

## Tips

- Use `Sleep` to wait for TUI applications to fully render before capturing
- 5 seconds is usually sufficient for most applications
- vhs can also output GIFs and WebM videos (change the output filename extension)
