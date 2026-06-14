# OpenTUI Skill Documentation — Gap Analysis

**Scope:** `/home/flintx/.agents/skills/opentui/SKILL.md` only.  
**Date:** 2026-06-06  
**Method:** Line-by-line structural and content-quality audit against technical documentation best practices.

---

## Executive Summary

The SKILL.md file functions almost exclusively as a navigation layer — a table of contents with path-mapping rules. It contains zero code examples, zero API signatures, zero import references, and zero definitions for domain-specific terminology. A reader landing on this file cannot produce working code, cannot understand the conceptual model, and cannot diagnose basic problems without navigating to multiple external MDX files.

---

## Gap 1: Zero Copy-Pasteable Code Examples

- **Location:** Lines 5–69 (entire document body)
- **Why it hurts:** Without fenced code blocks, a reader cannot verify syntax, package names, or API call signatures. Every interaction becomes an expedition into linked documents.
- **Example struggle:** A reader wanting to render a bordered box with text cannot determine from this file whether the component is `<box>` or `<Box>`, or whether the entry point is `createCliRenderer()` or something else.

## Gap 2: No Import Map or Package-to-API Reference

- **Location:** Lines 15–26 (Reading order by area) and Lines 49–63 (Current skill entry pages)
- **Why it hurts:** The document names functional areas and component pages but never states which npm package exports which APIs. Readers must guess the boundary between `@opentui/core`, `@opentui/react`, and `@opentui/solid`.
- **Example struggle:** A reader cannot determine whether `useKeyboard` or `createRoot` is imported from `@opentui/react` or `@opentui/core`.

## Gap 3: Routing Tables Substitute for Content

- **Location:** Lines 28–46 (Quick routing by intent table)
- **Why it hurts:** Every intent maps to an external file path with no summary, description, or excerpt. The table answers "where" but never "what" or "how."
- **Example struggle:** A reader querying for "flexbox layout" finds only the string `docs/core-concepts/layout.mdx` and learns nothing about whether OpenTUI uses Yoga, CSS-like props, or a custom layout engine.

## Gap 4: Component Pages Listed Without Prop Inventories

- **Location:** Lines 49–63 (Current skill entry pages — component slugs)
- **Why it hurts:** The document points readers to component documentation but provides no inline prop lists, type signatures, or accepted values. Readers cannot write a single component without opening another file.
- **Example struggle:** A reader cannot determine from this file whether `<input>` accepts `onChange`, `onInput`, or `onSubmit`, or whether it uses `value` or `defaultValue`.

## Gap 5: Domain Terminology Used Without Definitions

- **Location:** Lines 17–25 (Reading order — terms: "renderables", "constructs", "slots", "reconciler", "extmarks")
- **Why it hurts:** OpenTUI introduces a custom conceptual vocabulary. Readers encountering these terms for the first time have no definitions to distinguish a "renderable" from a "construct" or a "slot" from a "plugin."
- **Example struggle:** A reader seeing the route "renderables vs constructs" cannot decide which abstraction level is appropriate for their task without reading an entire external document.

## Gap 6: No Environment or Toolchain Prerequisites

- **Location:** Entire document — no setup, build, or runtime section
- **Why it hurts:** Readers do not know what must be installed before any OpenTUI code can execute. The file mentions nothing about compile-time or runtime dependencies.
- **Example struggle:** A reader does not learn from this file that a Zig compiler is required for native builds, or that Bun is the documented preferred runtime, or that `bun run build` from the repo root is the standard build command.

## Gap 7: No Lifecycle, Cleanup, or Shutdown Guidance

- **Location:** Entire document — no mention of renderer lifecycle
- **Why it hurts:** Terminal UI applications have strict lifecycle requirements. Without teardown guidance, readers may leak resources or leave the terminal in a corrupted state.
- **Example struggle:** A reader won't know that `renderer.destroy()` exists, or that Ctrl+C handling is configurable via `exitOnCtrlC`, or that cleanup on SIGTERM is automatic.

## Gap 8: No Debugging or Troubleshooting Reference

- **Location:** Entire document — no diagnostics, no common failure modes
- **Why it hurts:** When rendered output fails to appear or the terminal hangs, readers have no starting point for investigation.
- **Example struggle:** A reader whose screen is blank won't learn here that `console.log` output is suppressed during rendering and that `renderer.console.show()` is required to view logs.

## Gap 9: No Binding Selection Criteria

- **Location:** Lines 23–24 (React and Solid entries in reading order)
- **Why it hurts:** Three distinct API layers are documented (imperative core, React, Solid), but no comparison or decision matrix is provided.
- **Example struggle:** A reader with no framework preference cannot determine from this file whether to start with JSX-based React bindings, Solid signals, or raw imperative renderables.

## Gap 10: Missing Styling System Overview

- **Location:** Lines 21, 33–44 (Layout and component intents referenced)
- **Why it hurts:** Colors, dimensions, flex properties, and text attributes are central to TUI work, yet the file explains nothing about how styles are expressed.
- **Example struggle:** A reader cannot determine whether colors are expressed as hex strings, named CSS-like strings, or via an `RGBA` class, or whether layout uses standard flexbox properties.

---

## Highest Impact Quick Wins

1. **Add a minimal runnable example at the top of the file** — A single fenced block showing "Hello World" in a bordered box would eliminate the cold-start problem for new readers.

2. **Add an import reference table** — A compact table mapping common APIs (`createCliRenderer`, `createRoot`, `useKeyboard`, `BoxRenderable`) to their source packages would remove guesswork.

3. **Add a glossary of the top 5 domain terms** — Defining "renderable", "construct", "slot", "reconciler", and "CLI renderer" inline would make the routing tables comprehensible without leaving the file.
