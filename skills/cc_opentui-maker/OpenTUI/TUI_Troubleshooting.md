# OpenTUI + SolidJS Build Troubleshooting Guide

This document details critical build issues encountered when bundling OpenTUI/SolidJS TUI applications with Bun, and how to resolve them.

---

## The Core Problem: "React is not defined" Error

### Error Message

```
[ERROR] Error: React is not defined
     ReferenceError: React is not defined
         at <anonymous> (dist/cli-setup.js:103672:54)
         at untrack (dist/cli-setup.js:100603:14)
         at runComputation (dist/cli-setup.js:100796:24)
         at updateComputation (dist/cli-setup.js:100779:17)
         at devComponent (dist/cli-setup.js:100660:20)
         at <anonymous> (dist/cli-setup.js:101169:34)
         at runComputation (dist/cli-setup.js:100796:24)
         at updateComputation (dist/cli-setup.js:100779:17)
```

### Root Cause

OpenTUI uses **SolidJS** for its rendering, not React. However, when Bun bundles TSX/JSX files, it defaults to transforming JSX syntax into `React.createElement()` calls unless explicitly told otherwise.

The `/** @jsxImportSource @opentui/solid */` pragma at the top of each TSX file tells the TypeScript compiler to use SolidJS's JSX transform instead of React's. However, **Bun's bundler ignores this pragma** during the build process unless you explicitly provide the SolidJS transform plugin.

### Why It Works at Runtime but Fails When Bundled

When running from source with `bun --conditions=browser src/runtime/cli-setup.ts`:

1. The `@opentui/solid/preload` import registers SolidJS's JSX transform
2. Bun processes TSX files on-the-fly with the correct transform
3. The `/** @jsxImportSource @opentui/solid */` pragma is respected

When bundling with `bun build`:

1. Bun statically analyzes and bundles all imports
2. The preload mechanism doesn't work the same way during static bundling
3. Bun's bundler uses its default JSX transform (React)
4. The bundled output contains `React.createElement()` calls
5. At runtime, `React` is undefined because React was never imported

---

## The Wrong Way: Using `bun build` Directly

### ❌ This Will NOT Work

```json
{
  "scripts": {
    "build": "bun build src/runtime/cli-setup.ts --outdir dist --target bun --conditions=browser"
  }
}
```

Even with `--conditions=browser`, this command will:
- Bundle all TSX files
- Use Bun's default React JSX transform
- Produce a broken bundle that throws "React is not defined"

### ❌ The Preload Pattern Doesn't Help at Build Time

```typescript
// launcher.ts
await import('@opentui/solid/preload');

export async function startTUI(options: CLIOptions): Promise<void> {
  const { startTUI: start } = await import('./app.js');
  await start(options);
}
```

This pattern works at runtime but NOT during bundling because:
- `bun build` statically analyzes imports
- It bundles `app.tsx` before any runtime code executes
- The preload never runs during the build process

---

## The Correct Solution: Use OpenTUI's Solid Plugin

### ✅ Create a Build Script

Create `scripts/build.mjs`:

```javascript
#!/usr/bin/env bun
/**
 * Build script for OpenTUI/SolidJS applications
 * Uses OpenTUI's solid plugin for proper JSX transformation
 */
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(repoRoot, 'dist');

// CRITICAL: Load OpenTUI's solid plugin for JSX transformation
const solidPluginPath = resolve(repoRoot, 'node_modules/@opentui/solid/scripts/solid-plugin.ts');
const solidPlugin = (await import(solidPluginPath)).default;

console.log('Building with SolidJS transform...');

mkdirSync(outdir, { recursive: true });

const result = await Bun.build({
  conditions: ['browser'],
  tsconfig: './tsconfig.json',
  plugins: [solidPlugin],  // <-- THIS IS THE KEY
  target: 'bun',
  outdir: outdir,
  entrypoints: ['./src/runtime/cli-setup.ts'],
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log('Build complete!');
```

### ✅ Update package.json

```json
{
  "scripts": {
    "dev": "bun --conditions=browser src/runtime/cli-setup.ts",
    "start": "bun --conditions=browser src/runtime/cli-setup.ts",
    "build": "bun scripts/build.mjs"
  }
}
```

### Why This Works

The `solidPlugin` from `@opentui/solid/scripts/solid-plugin.ts`:
1. Intercepts all `.tsx` and `.jsx` files during bundling
2. Transforms JSX syntax using SolidJS's compiler instead of React's
3. Produces correct `_$createComponent()` calls instead of `React.createElement()`

---

## Building Executables (Standalone Binaries)

If you need to compile to a standalone executable, use `Bun.build()` with the `compile` option:

```javascript
const result = await Bun.build({
  conditions: ['browser'],
  tsconfig: './tsconfig.json',
  plugins: [solidPlugin],
  minify: true,
  compile: {
    target: 'bun-windows-x64',  // or 'bun-linux-x64', 'bun-darwin-arm64', etc.
    outfile: './dist/my-app.exe',
  },
  entrypoints: ['./src/runtime/cli-setup.ts'],
});
```

### Available Compile Targets

| Target | OS | Architecture |
|--------|-----|--------------|
| `bun-windows-x64` | Windows | x64 |
| `bun-linux-x64` | Linux | x64 |
| `bun-darwin-x64` | macOS | x64 (Intel) |
| `bun-darwin-arm64` | macOS | ARM64 (Apple Silicon) |

---

## Secondary Issue: `instance.waitUntilExit is not a function`

### Error Message

```
[ERROR] 'Fatal error:' "instance.waitUntilExit is not a function. (In 'instance.waitUntilExit()', 'instance.waitUntilExit' is undefined)"
```

### Root Cause

OpenTUI's `render()` function does NOT return an object with `waitUntilExit()`. This is different from Ink (React-based TUI library) which does provide this method.

### ❌ Wrong Pattern (Ink-style)

```typescript
const instance = render(() => <App />);
await instance.waitUntilExit();  // ERROR: waitUntilExit doesn't exist
```

### ✅ Correct Pattern (OpenTUI-style)

```typescript
export async function startTUI(options: CLIOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    render(
      () => <App options={options} onExit={() => resolve()} />,
      {
        targetFps: 30,
        exitOnCtrlC: false,
        useMouse: false,
        useKittyKeyboard: true,
      }
    );
  });
}
```

With this pattern:
1. Wrap `render()` in a Promise
2. Pass an `onExit` callback to your App component
3. Call `resolve()` when you want the TUI to exit
4. Use `renderer.destroy()` from within components to trigger exit

### Handling Ctrl+C (Exit)

```typescript
function App(props: { onExit: () => void }) {
  const renderer = useRenderer();

  useKeyboard((evt) => {
    if (evt.ctrl && evt.name === 'c') {
      evt.preventDefault();
      renderer.destroy();
      process.stdout.write('\x1b[2J\x1b[H\x1b[?25h'); // Clear screen, show cursor
      process.exit(0);
    }
  });

  return <box>...</box>;
}
```

---

## Configuration Files

### tsconfig.json

Ensure your tsconfig.json has the correct JSX settings:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@opentui/solid",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### bunfig.toml

```toml
[install]
peer = false

[run]
# Enable browser conditions for OpenTUI/SolidJS
conditions = ["browser"]
```

---

## File Header Requirements

Every `.tsx` file MUST have the JSX pragma as the FIRST line:

```typescript
/** @jsxImportSource @opentui/solid */
import { render } from '@opentui/solid';
// ... rest of imports
```

This pragma tells TypeScript to use SolidJS's JSX transform. While it's not enough for bundling (you still need the plugin), it's required for:
- IDE type checking
- TypeScript compilation
- Runtime execution from source

---

## Quick Reference: Build Commands

### Development (from source)

```bash
bun --conditions=browser src/runtime/cli-setup.ts
# or
bun start
# or
bun dev
```

### Production Build (bundled JS)

```bash
bun scripts/build.mjs
# Then run with:
bun dist/cli-setup.js
```

### Production Build (standalone exe)

Modify `scripts/build.mjs` to use `compile` option (see above).

---

## Checklist for New OpenTUI/SolidJS Projects

1. [ ] Create `scripts/build.mjs` with solid plugin
2. [ ] Update `package.json` build script to use `bun scripts/build.mjs`
3. [ ] Add `/** @jsxImportSource @opentui/solid */` to ALL `.tsx` files
4. [ ] Configure `tsconfig.json` with `"jsxImportSource": "@opentui/solid"`
5. [ ] Use `new Promise()` pattern instead of `waitUntilExit()`
6. [ ] Use `useRenderer().destroy()` for exit handling
7. [ ] Set `exitOnCtrlC: false` in render options if handling Ctrl+C manually

---

## Dependencies

Required packages for OpenTUI/SolidJS TUI applications:

```json
{
  "dependencies": {
    "@opentui/core": "^0.1.48",
    "@opentui/solid": "^0.1.48",
    "solid-js": "^1.9.9"
  }
}
```

---

## Reference Implementation

See the CodeMachine-CLI project for a production-ready example:
- Build script: `scripts/build-binaries.mjs`
- TUI entry point: `src/cli/tui/app.tsx`
- Launcher pattern: `src/cli/tui/launcher.ts`

---

## Summary

| Problem | Cause | Solution |
|---------|-------|----------|
| "React is not defined" | Bun bundler uses React JSX transform | Use `solidPlugin` in `Bun.build()` |
| "waitUntilExit is not a function" | OpenTUI doesn't have this method | Use Promise wrapper pattern |
| Build works, runtime fails | Preload doesn't work at bundle time | Always use build script with plugin |
| Exe build fails | Same JSX transform issue | Same solution - use solidPlugin |

**Golden Rule**: Never use bare `bun build` for OpenTUI/SolidJS projects. Always use a build script that loads the solid plugin.
