# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenTUI-based TUI (Terminal User Interface) application built with React and Bun. The project implements a TODO app with terminal-based rendering.

**Project Goal**: Build a terminal TODO app with a welcome screen, list view, creation mode, and filtering capabilities.

## Development Commands

```bash
# Install dependencies
bun install

# Run the application
bun run src/index.tsx

# Run with auto-reload during development
bun run dev
```

## Technical Stack

- **Runtime**: Bun (used for package management and execution)
- **UI Framework**: OpenTUI React (`@opentui/react` v0.1.36)
- **Core Library**: `@opentui/core` v0.1.36
- **React Version**: 19.1.1
- **Language**: TypeScript with strict mode enabled

## Architecture

### OpenTUI JSX Elements

This project uses OpenTUI's custom JSX elements (not DOM elements). Key elements include:

- `<box>` - Container element with styling support (borders, padding, colors)
- `<text>` - Text rendering with color support (`fg` prop)
- `<input>` - Interactive input with `onInput`, `onSubmit`, `focused`, and `placeholder` props

### Entry Point Pattern

The application uses a standard OpenTUI initialization pattern:

```tsx
const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
```

This must be at the top level of `src/index.tsx`.

### TypeScript Configuration

- **JSX Import Source**: Set to `@opentui/react` (not standard React)
- **Module System**: Uses `Preserve` mode with bundler resolution
- **JSX Transform**: Uses `react-jsx` (automatic runtime)
- Strict type checking is enabled with additional safety flags

## TODO App Requirements

The app should implement these screens/modes:

1. **Welcome Screen**
   - Title and slug display
   - Three action buttons: List (l), Create (c), Exit (q/esc)

2. **TODO List Mode**
   - Header: App title (left), Exit button (right, q/esc)
   - Input section: Text input + Create button
   - Filter section: Active, Completed, All tabs
   - List section: Display of TODO items

3. **Navigation**
   - Exit via `q` or `esc` key from any screen

## Important Implementation Notes

- OpenTUI uses a React reconciler for terminal rendering, not traditional DOM
- The `jsxImportSource` must remain `@opentui/react` in tsconfig.json
- Style properties use OpenTUI-specific naming (e.g., `backgroundColor`, `borderStyle`, `textColor`)
- Keyboard event handling is managed through OpenTUI's input system

## References

- [OpenTUI Repository](https://github.com/sst/opentui/tree/main)
- [OpenTUI Getting Started](https://github.com/sst/opentui/blob/main/packages/core/docs/getting-started.md)
- [OpenTUI Examples](https://github.com/sst/opentui/tree/main/packages/core/src/examples)
- [OpenTUI React Documentation](https://github.com/sst/opentui/blob/main/packages/react/README.md)
