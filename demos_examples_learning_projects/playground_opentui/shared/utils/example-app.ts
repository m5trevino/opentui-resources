/**
 * Example App Wrapper
 * Eliminates boilerplate for OpenTUI examples by handling:
 * - Renderer initialization
 * - Standard exit handling (q key, Ctrl+C)
 * - Interval/timeout cleanup registration
 * - Process signal handling
 */

import { createCliRenderer, type CliRenderer, type KeyEvent } from "@opentui/core";

export interface ExampleAppContext {
  renderer: CliRenderer;
  /** Register an interval for automatic cleanup on exit */
  addInterval: (interval: ReturnType<typeof setInterval>) => void;
  /** Register a timeout for automatic cleanup on exit */
  addTimeout: (timeout: ReturnType<typeof setTimeout>) => void;
  /** Register a custom cleanup function */
  addCleanup: (cleanup: () => void) => void;
}

export interface ExampleAppOptions {
  /** Custom key handler - return true to prevent default q-to-exit behavior */
  onKeyPress?: (key: KeyEvent, ctx: ExampleAppContext) => boolean | void;
  /** If true, disables the default q-to-exit behavior */
  disableQuitKey?: boolean;
}

/**
 * Creates an example app with standard boilerplate handled.
 *
 * @example
 * ```typescript
 * createExampleApp(({ renderer, addInterval }) => {
 *   const container = new BoxRenderable(renderer, { ... });
 *   renderer.root.add(container);
 *
 *   const updateLoop = setInterval(() => { ... }, 1000);
 *   addInterval(updateLoop);
 * });
 * ```
 */
export async function createExampleApp(
  setup: (ctx: ExampleAppContext) => void | Promise<void>,
  options: ExampleAppOptions = {}
): Promise<void> {
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  const intervals: ReturnType<typeof setInterval>[] = [];
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  const cleanupFns: (() => void)[] = [];

  const ctx: ExampleAppContext = {
    renderer,
    addInterval: (interval) => intervals.push(interval),
    addTimeout: (timeout) => timeouts.push(timeout),
    addCleanup: (cleanup) => cleanupFns.push(cleanup),
  };

  function cleanup() {
    intervals.forEach(clearInterval);
    timeouts.forEach(clearTimeout);
    cleanupFns.forEach((fn) => fn());
  }

  function exit() {
    cleanup();
    renderer.destroy();
  }

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    // Call custom handler first
    if (options.onKeyPress) {
      const handled = options.onKeyPress(key, ctx);
      if (handled) return;
    }

    // Default q-to-exit behavior
    if (!options.disableQuitKey && key.name === "q" && !key.ctrl) {
      exit();
    }
  });

  // Ensure cleanup on process exit
  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });

  // Run setup
  await setup(ctx);
}
