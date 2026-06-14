# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains **OpenTUIMaker** - a project template and workflow documentation for building Terminal User Interface (TUI) applications using **OpenTUI** with **SolidJS** reactivity. OpenTUI is a TypeScript library for building TUIs, currently in development by SST.

The `OpenTUI/opentui/` directory contains a clone of the OpenTUI library monorepo.

## Key Technologies

- **Runtime**: Bun (NOT Node.js)
- **TUI Framework**: OpenTUI (`@opentui/core`, `@opentui/solid`)
- **Reactivity**: SolidJS for declarative UI
- **CLI Parsing**: Commander.js
- **Build System**: Zig (for native modules)

## Development Commands

```bash
# Install dependencies (from repo root or package directories)
bun install

# Run TypeScript examples (from packages/core)
cd OpenTUI/opentui/packages/core
bun run src/examples/index.ts

# Build all packages (from repo root)
cd OpenTUI/opentui
bun run build

# Run tests
bun test                           # TypeScript tests
bun run test:native                # Native Zig tests (from packages/core)
bun run test:native -Dtest-filter="test name"  # Filter native tests

# Run native benchmarks
bun run bench:native               # From packages/core

# Format code
bun run prettier:write
```

## Architecture

### Package Structure (OpenTUI/opentui/)

```
packages/
├── core/       # Core library - standalone imperative API
│   ├── src/zig/    # Native Zig code (requires rebuild)
│   └── src/        # TypeScript renderables, layout, animation
├── solid/      # SolidJS reconciler (primary integration)
├── react/      # React reconciler
├── vue/        # Vue reconciler (unmaintained)
└── go/         # Go bindings (unmaintained)
```

### Core Concepts

1. **CliRenderer** - Main rendering engine managing terminal output and input events
2. **Renderables** - UI building blocks using Yoga flexbox layout (TextRenderable, BoxRenderable, InputRenderable, SelectRenderable, etc.)
3. **Constructs** - Component-like wrappers for creating renderables declaratively
4. **FrameBuffer** - Low-level 2D rendering surface with alpha blending support

### OpenTUI + SolidJS Application Structure

```
src/
├── runtime/cli-setup.ts     # Entry point: CLI parsing, TUI launch
├── core/types.ts            # Type definitions
└── cli/tui/
    ├── launcher.ts          # CRITICAL: SolidJS preload registration
    ├── app.tsx              # Root app with render() setup
    ├── component/           # Reusable UI components
    ├── context/             # SolidJS contexts (theme, state)
    └── routes/              # Main views
```

## Critical Build Patterns

### SolidJS Preload (MANDATORY)

The preload MUST be imported before any TSX files:

```typescript
// launcher.ts
await import('@opentui/solid/preload');

export async function startTUI(options: CLIOptions): Promise<void> {
  const { startTUI: start } = await import('./app.js');
  await start(options);
}
```

### JSX Pragma (MANDATORY for every .tsx file)

```typescript
/** @jsxImportSource @opentui/solid */
import { render } from '@opentui/solid';
```

### Building OpenTUI/SolidJS Applications

**Never use bare `bun build`** - it defaults to React JSX transform. Use a build script with the solid plugin:

```javascript
// scripts/build.mjs
import { resolve } from 'node:path';
const solidPlugin = (await import('@opentui/solid/bun-plugin')).default;

await Bun.build({
  conditions: ['browser'],
  plugins: [solidPlugin],  // Required for SolidJS JSX transform
  target: 'bun',
  entrypoints: ['./src/runtime/cli-setup.ts'],
});
```

### Running from Source

```bash
bun --conditions=browser src/runtime/cli-setup.ts
```

## Code Style

- **Formatting**: Prettier with `semi: false`, `printWidth: 120`
- **Types**: Strict TypeScript, explicit return types for public APIs
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Comments**: Minimal, NO JSDoc
- **Testing**: Bun test framework with `import { test, expect } from "bun:test"`

## Bun API Preferences

- `Bun.serve()` instead of Express
- `bun:sqlite` instead of better-sqlite3
- `Bun.file()` instead of node:fs readFile/writeFile
- `Bun.$\`command\`` instead of execa
- Built-in WebSocket instead of ws

## Important Notes

1. **TypeScript-only changes do NOT require rebuild** - only Zig native code changes need `bun run build`
2. **Console logging is captured** by OpenTUI - toggle built-in console with backtick key
3. **OpenTUI's render() does NOT have waitUntilExit()** - use Promise wrapper pattern with `onExit` callback
4. **Debugging** - Create reproducible test cases; do not guess. Use debug logs.

## Workflow Documentation

The `OpenTUI/` directory contains comprehensive workflow guides:
- `TUI_Workflow.md` - Complete guide for building TUI apps with OpenTUI + SolidJS
- `TUI_Prompt.md` - Prompt templates for creating new TUI applications
- `TUI_Troubleshooting.md` - Build issues and solutions (especially JSX transform problems)
