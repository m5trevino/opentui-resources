
> **References and Resources**
> A complete index of OpenTUI reference materials is available at `~/tui-ref/INDEX.md`. It catalogues demos, examples, learning projects, OpenTUI libraries and components, real-world apps, scaffolding tools, skills, testing and development helpers, and extras.

# OpenTUIMaker

A Claude Code skill workspace for building Terminal User Interface (TUI) applications using **OpenTUI** with **SolidJS** reactivity.

## What is This?

This repository contains:

1. **`opentui-maker` Skill** - A Claude Code skill that scaffolds complete TUI applications from templates
2. **OpenTUI Reference** - Documentation and workflow guides for the OpenTUI library
3. **Example Project** - A test project demonstrating skill output

## Quick Start

### Using the Skill

Simply ask Claude Code to create a TUI application:

```
Create a TUI for batch video conversion
```

Or be more specific:

```
Create an image optimizer TUI with emerald theme,
logo "IMGOPT", subtitle "Batch Image Optimization"
```

The skill will:
- Scaffold a complete project structure
- Apply your customizations (name, colors, branding)
- Ensure all critical OpenTUI + SolidJS patterns are correct
- Generate ready-to-run source code

### Running a Scaffolded Project

```bash
cd your-project
bun install
bun run dev
```

## Available Templates

| Template | Description | Best For |
|----------|-------------|----------|
| `batch-processor` | Progress tracking, stats panel, file list | Video/audio conversion, image optimization, file migration |

## Project Structure

```
OpenTUIMaker/
├── .claude/
│   └── skills/
│       └── opentui-maker/          # The Claude Code skill
│           ├── README.md           # Skill overview
│           ├── USAGE.md            # Detailed usage guide
│           ├── CHANGELOG.md        # Version history
│           ├── SKILL.md            # Skill definition
│           ├── WORKFLOW.md         # OpenTUI patterns
│           ├── TROUBLESHOOTING.md  # Common issues
│           └── templates/          # Project templates
│               └── batch-processor/
├── OpenTUI/                        # Reference documentation
│   ├── TUI_Documentation.md
│   ├── TUI_Workflow.md
│   ├── TUI_Prompt.md
│   └── TUI_Troubleshooting.md
├── test/                           # Example scaffolded projects
│   └── image-compressor/           # Demo project
├── CLAUDE.md                       # Claude Code project config
└── README.md                       # This file
```

## Skill Documentation

| Document | Description |
|----------|-------------|
| [USAGE.md](.claude/skills/opentui-maker/USAGE.md) | How to activate the skill, example prompts, customization options |
| [README.md](.claude/skills/opentui-maker/README.md) | Skill features and capabilities |
| [CHANGELOG.md](.claude/skills/opentui-maker/CHANGELOG.md) | Version history |
| [TROUBLESHOOTING.md](.claude/skills/opentui-maker/TROUBLESHOOTING.md) | Common issues and solutions |

## What is OpenTUI?

[OpenTUI](https://github.com/sst/opentui) is a TypeScript library for building Terminal User Interfaces, developed by SST. It features:

- **Yoga Flexbox Layout** - CSS-like layout system for the terminal
- **SolidJS Reactivity** - Declarative, reactive UI updates
- **Rich Components** - Text, boxes, inputs, selects, and more
- **Alpha Blending** - Smooth visual effects
- **Bun Runtime** - Fast execution with modern JavaScript

## Key Patterns

The skill enforces these **mandatory patterns** in every generated project:

### 1. SolidJS Preload
```typescript
// launcher.ts - MUST import before any TSX
await import('@opentui/solid/preload');
```

### 2. JSX Pragma
```typescript
// Every .tsx file MUST start with:
/** @jsxImportSource @opentui/solid */
```

### 3. Build Configuration
```javascript
// scripts/build.mjs - MUST use solidPlugin
const solidPlugin = (await import(solidPluginPath)).default;
await Bun.build({
  plugins: [solidPlugin],
  // ...
});
```

## Color Themes

| Theme | Hex | Recommended For |
|-------|-----|-----------------|
| Violet | `#A855F7` | Video/media tools |
| Emerald | `#10B981` | Image processing |
| Blue | `#3B82F6` | Data/analytics |
| Red | `#EF4444` | Security tools |
| Amber | `#F59E0B` | File/document tools |
| Cyan | `#06B6D4` | Network tools |

## Requirements

- **Runtime**: [Bun](https://bun.sh) v1.3.0+
- **Claude Code**: For using the skill
- **Dependencies**: Installed automatically
  - `@opentui/core` - Core TUI library
  - `@opentui/solid` - SolidJS integration
  - `solid-js` - Reactivity system
  - `commander` - CLI parsing

## Example Output

The `batch-processor` template generates this layout:

```
┌────────────────────────────────────────────────────────────────────┐
│            ██╗      ██████╗  ██████╗  ██████╗                      │
│            ██║     ██╔═══██╗██╔════╝ ██╔═══██╗                     │
│            ██║     ██║   ██║██║  ███╗██║   ██║                     │
│            ██║     ██║   ██║██║   ██║██║   ██║                     │
│            ███████╗╚██████╔╝╚██████╔╝╚██████╔╝                     │
│            ╚══════╝ ╚═════╝  ╚═════╝  ╚═════╝                      │
│                  >>> Your Subtitle Here >>>                        │
│                                                                    │
│  Press Ctrl+C to gracefully stop                                   │
│  │████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 25% (100/400)          │
│                                                                    │
│  ┌─ Statistics ─────────────────────────────────────────────────┐  │
│  │ Status: Processing │ Progress: 100/400 (25%)                 │  │
│  │ Active: 5 │ Completed: 100 │ Failed: 0                       │  │
│  │ Elapsed: 00:05:32 │ Output: 150.5 MB │ ETA: 00:16:36         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ✓ file1.mp4                              [completed] 1.5 MB       │
│  ● file2.mp4                              │████░░░░│ 94%           │
│  ○ file3.mp4                              [pending]                │
└────────────────────────────────────────────────────────────────────┘
```

## Contributing

To add a new template:

1. Create a directory under `.claude/skills/opentui-maker/templates/`
2. Add `template.md` (layout spec), `prompt.md` (customization options), `source/` (working code)
3. Update `templates/_index.md` with the new entry

## License

MIT

## Links

- [OpenTUI GitHub](https://github.com/sst/opentui)
- [SolidJS](https://www.solidjs.com/)
- [Bun](https://bun.sh)
- [Claude Code](https://claude.ai/code)
