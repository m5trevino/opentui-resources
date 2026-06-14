# niri-tui

a scrolling tiling window manager (similar to niri).

when starting, create an opencode instance using:

```
import { createOpencode } from "@opencode-ai/sdk"

const { client } = await createOpencode()
```

each window will be a separate opencode session.

each window should have an input to type into. when a window is focused allow entering in text.

## Current Milestone

Build reliable per-window chat behavior:

- Send text messages from a focused window to its own opencode session.
- Stream assistant responses back into that same window.
- Keep window focus/navigation behavior responsive while streaming.

## Feature Plan (SPEC-Driven)

### Phase 1: Session + Message Data Model

- [ ] Define per-window state shape:
  - `sessionID`
  - input buffer/value
  - message timeline (`user`, `assistant`, `system`)
  - streaming status (`idle`, `streaming`, `error`)
  - partial assistant buffer for in-flight streaming tokens
- [ ] Normalize state transitions:
  - submit prompt
  - stream chunk received
  - stream complete
  - stream error
  - cancel/abort

### Phase 2: Window UI Composition

- [ ] Each window has:
  - message viewport (scrollable)
  - status line (session + stream state)
  - input box (single-line prompt)
- [ ] Render user messages immediately on submit.
- [ ] Render assistant message incrementally during stream.
- [x] Show a streaming spinner indicator while assistant output is in-flight.
- [ ] Auto-scroll message viewport to newest content while focused.

### Phase 3: OpenCode Streaming Integration

- [ ] On window create, create opencode session and bind session ID.
- [ ] On input submit, send prompt to `client.session.prompt` or streaming endpoint.
- [ ] Subscribe to stream events and map them to the correct window/session.
- [ ] Append streamed text chunks to in-progress assistant message.
- [ ] Finalize assistant message when stream ends.
- [ ] Handle API/transport errors and show non-blocking window-level error state.

### Phase 4: Interaction + Concurrency Rules

- [ ] Allow multiple windows to stream concurrently.
- [ ] Keep `Alt+h` / `Alt+l` focus navigation working during active streams.
- [ ] Prevent duplicate submits for same window while its current prompt is active (or explicitly allow queueing with clear UX).
- [ ] Add `Alt+x` behavior for a streaming window:
  - either abort stream then close, or prevent close with explanatory status.

### Phase 4.5: Superfocus Mode

- [x] Add `superfocus` state for the currently focused window.
- [x] In superfocus mode, set focused window width to viewport width.
- [x] Preserve and restore original window width when toggling off.
- [x] Ensure toggle works while streaming and while focus changes.
- [x] Define toggle keybinding (`Alt+f`).
- [x] If focus changes while superfocus is active, keep superfocus on previously toggled windows.

### Phase 5: Reliability + Cleanup

- [ ] Ensure quit flow closes renderer and opencode server cleanly.
- [ ] Cancel/abort active streams during quit.
- [ ] Ensure no event listener leaks when windows are closed.
- [ ] Preserve stable behavior when adding/removing windows during active streams.

## Acceptance Criteria

- [ ] In any focused window, typing + Enter sends a user message to that window's own session.
- [ ] Assistant response appears token-by-token (or chunk-by-chunk) inside the same window.
- [ ] Responses from one window never render in another window.
- [ ] Focus can switch between windows while one or more windows are streaming.
- [ ] App exit shuts down opencode and streaming subscriptions cleanly.
- [ ] Superfocus can be toggled on a focused window and restored back to its previous width.

## Next Task

- [ ] Implement Phase 1 + Phase 2 state/UI refactor for per-window message viewport and streaming placeholders.
- [x] Clear the submitting window input immediately after Enter submits a prompt.
- [x] Hide `idle` text beside the prompt input; show status only when streaming.
- [x] Implement Superfocus mode with width snapshot/restore and viewport-sized focused layout.
- [x] Migrate app architecture from `@opentui/core` imperative renderables to `@opentui/react` declarative components.
