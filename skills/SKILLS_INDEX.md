# OpenTUI Skills Index

Detailed guide to every skill in `.tui-ref/skills/`. Each entry explains what the skill is for, what it covers, and when to reach for it.

---

## `brianlovin-hn-cli-opentui/`

An older OpenTUI skill contributed by Brian Lovin. It focuses on the **Constructs API**, template-literal styling, and testing with `createTestRenderer`. Good for seeing how OpenTUI apps were built before the React/Solid reconcilers became the dominant pattern.

**Use when:** you want examples of imperative OpenTUI components, Constructs-based code, or early testing patterns.

---

## `cc_opentui-maker/`

A Claude Code **skill workspace**, not just a single `SKILL.md`. It contains:

- The `opentui-maker` skill logic
- OpenTUI reference documentation (`OpenTUI/`, `__docs/`)
- A sample batch-processor project under `test/`

**Use when:** you want Claude to scaffold a complete OpenTUI + SolidJS application and you need the surrounding workspace/reference material.

---

## `cli-opentui/`

A compact agent skill for building terminal UIs with OpenTUI. Covers the **imperative/core API**, the most common components (`Text`, `Box`, `Input`, `Select`, `ScrollBox`), keyboard input, and basic testing.

**Use when:** you need a quick, core-API-first introduction to OpenTUI without wading through React/Solid reconciler details.

---

## `jcha0713-igl-opentui-debug/`

A debugging skill for OpenTUI apps. The central idea is that `console.log` gets captured by the TUI overlay, so you need **file-based logging** (`logDebug`) to inspect state, layout calculations, scroll behaviour, and key input.

**Use when:** you are debugging render/state/layout issues and the TUI is swallowing your logs.

---

## `opentui-5/`

An early consolidated OpenTUI platform skill. Covers the **core imperative API**, the React reconciler, and the Solid reconciler with decision trees for picking the right framework and components.

**Use when:** you are working with an older OpenTUI project or want to see the v5-era recommendations. Mostly superseded by `opentui-8/` and `opentui-guide/`.

---

## `opentui-8/`

A later consolidated OpenTUI platform skill. Like `opentui-5/` but expanded with references for **animation, keyboard handling, layout, and testing**. Includes critical rules (e.g. `create-tui` argument ordering, never calling `process.exit()`, text styling with nested tags).

**Use when:** you want a broad reference that covers core, React, and Solid with extra topics like animation and keyboard.

---

## `opentui-agent/`

A large, demo-heavy agent skill. It is essentially a snapshot of the `tui-ref/opentui-agent` workspace bundled with:

- `SKILL.md` reference
- `opentui-demos/` (many runnable `.ts` demos + screenshots)
- `opentui-text/` (markdown docs)
- `opentui-ui/`, `create-tui/`, and other sub-resources

**Use when:** you want both a skill and a local copy of the demo/documentation ecosystem it references.

---

## `opentui-auto-slicer/`

A workflow skill for slicing OpenTUI work into **tracer-bullet vertical slices**. It is less about OpenTUI APIs and more about how to break a TUI project into small, independently executable chunks.

**Use when:** you are planning a multi-step OpenTUI implementation and want a structured slicing workflow.

---

## `opentui-debug/`

A skill dedicated to OpenTUI debugging. Covers common pitfalls, diagnostic techniques, and how to use logging/inspection tools to understand layout, input, and render problems.

**Use when:** something in your OpenTUI app is not rendering or behaving as expected.

---

## `opentui-dev/`

A development skill for building TUIs with OpenTUI. Heavy on **component prop tables**, layout rules, the RGBA API, `useTimeline`, `usePaste`, and `useFocus` examples.

**Use when:** you need detailed API-level guidance while building OpenTUI components.

---

## `opentui-guide/`

A **consolidated reference-backed skill** that merges the best parts of 11 earlier OpenTUI skills. Covers three APIs (Renderables, Constructs, JSX), React/Core packages, layout, keyboard input, all components, hooks, debugging, testing, and common patterns.

**Use when:** you want the current "source of truth" OpenTUI skill. Start here if you are unsure which older skill to use.

---

## `opentui-hunk-review/`

A skill for controlling **Hunk** — an interactive terminal diff viewer — through its CLI (`hunk session list`, `hunk session review`, etc.). The TUI is for the user; agents interact with sessions, not the interactive TUI directly.

**Use when:** you need to inspect, navigate, or annotate a live Hunk diff review session.

---

## `opentui-ink/`

An **Ink** platform skill, not an OpenTUI skill per se. Ink is the React-for-CLI library that termcn also supports. This skill covers Ink's `Text`, `Box`, `Static`, `Transform` components, hooks (`useInput`, `useApp`, `useFocus`), flexbox layout, testing, and accessibility.

**Use when:** you are building a terminal UI with Ink instead of OpenTUI.

---

## `opentui-lazymem/`

A memory-management agent skill for **macOS** dev environments. It collects live memory state across processes, Claude agent sessions, dev servers, and Docker containers, then helps clean up memory pressure safely.

**Use when:** your Mac is running multiple agents/servers/containers and you want to free memory.

---

## `opentui-maker/`

A Claude Code skill for scaffolding **OpenTUI + SolidJS** applications from templates. Enforces the critical patterns: SolidJS preload, JSX pragma, and correct build configuration.

**Use when:** you want to generate a new SolidJS-based OpenTUI project quickly.

---

## `opentui-opentui/`

A comprehensive OpenTUI platform skill covering the **core imperative API**, the React reconciler, and the Solid reconciler. Includes decision trees, critical rules, and references for components, layout, keyboard, animations, and testing.

**Use when:** you want a single skill that spans all three OpenTUI APIs.

---

## `opentui-pilotty/`

A skill for **automating terminal TUI applications** through managed PTY sessions. Works with vim, htop, lazygit, dialog, and any interactive CLI program.

**Use when:** you need an agent to drive an existing terminal application programmatically.

---

## `opentui-screenshot-verify/`

A visual verification skill/toolkit for OpenTUI and terminal-based applications. Uses macOS `screencapture` plus vision models to launch, capture, and analyse TUI output.

**Use when:** you want automated visual regression/verification of a TUI on macOS.

---

## `opentui-skill/`

A packaged **OpenCode skill bundle** for OpenTUI. Contains `install.sh`, `README.md`, and `LICENSE`; designed to be downloaded and installed into OpenCode.

**Use when:** you are distributing or installing an OpenCode-compatible OpenTUI skill.

---

## `opentuiskills/`

A bundled directory that contains copies of several OpenTUI agent skills:

- `opentui1/` (older consolidated skill)
- `opentui-ink/`, `opentui-hunk-review/`, `opentui-maker/`, `opentui-pilotty/`
- `opentui-screenshot-verify/`, `opentui-skill/`, `opentui-testing/`
- `opentui-vercel-react-view-transitions/`, `opentui-web-haptics/`

**Use when:** you want a snapshot of multiple skills in one folder without installing them individually.

---

## `opentui-vercel-react-view-transitions/`

A skill for implementing **React View Transition API** animations. Covers `<ViewTransition>`, `addTransitionType`, shared-element transitions, CSS pseudo-elements, Next.js integration, and accessibility (`prefers-reduced-motion`).

**Use when:** you want smooth, native-feeling page/view transitions in a React (especially Next.js) app.

---

## `opentui-web-haptics/`

A skill for adding **haptic feedback** to web apps using the `web-haptics` library, which wraps the Web Vibration API.

**Use when:** you are building mobile-facing web UIs and want tactile feedback on buttons, toggles, forms, and pickers.
