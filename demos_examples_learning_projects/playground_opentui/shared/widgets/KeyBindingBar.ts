/**
 * KeyBindingBar Widget
 * Displays keyboard shortcuts in a horizontal row with consistent styling
 */

import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";
import type { Theme } from "../themes/index";

export interface KeyBinding {
  /** The key(s) to display, e.g., "q", "↑/↓", "Ctrl+C" */
  key: string;
  /** The action description, e.g., "Exit", "Navigate", "Copy" */
  action: string;
}

export interface KeyBindingBarOptions {
  theme: Theme;
  /** Gap between keybindings (default: 3) */
  gap?: number;
  /** Custom ID for the container */
  id?: string;
}

/**
 * Creates a key binding bar displaying keyboard shortcuts.
 *
 * @example
 * ```typescript
 * const keyBar = createKeyBindingBar(renderer, [
 *   { key: "↑/↓", action: "Navigate" },
 *   { key: "Enter", action: "Select" },
 *   { key: "q", action: "Exit" },
 * ], { theme });
 * main.add(keyBar);
 * ```
 */
export function createKeyBindingBar(
  renderer: CliRenderer,
  bindings: KeyBinding[],
  options: KeyBindingBarOptions
): BoxRenderable {
  const { theme, gap = 3, id = "key-bindings" } = options;

  const container = new BoxRenderable(renderer, {
    id,
    flexDirection: "row",
    gap,
  });

  bindings.forEach((binding, i) => {
    const text = new TextRenderable(renderer, {
      id: `${id}-${i}`,
      content: `${binding.key}: ${binding.action}`,
      fg: theme.colors.fgMuted,
    });
    container.add(text);
  });

  return container;
}

/**
 * KeyBindingBar class for dynamic updates.
 * Use when you need to update bindings after creation.
 */
export class KeyBindingBar {
  private container: BoxRenderable;
  private renderer: CliRenderer;
  private theme: Theme;
  private textElements: TextRenderable[] = [];

  constructor(
    renderer: CliRenderer,
    bindings: KeyBinding[],
    options: KeyBindingBarOptions
  ) {
    this.renderer = renderer;
    this.theme = options.theme;
    const { gap = 3, id = "key-bindings" } = options;

    this.container = new BoxRenderable(renderer, {
      id,
      flexDirection: "row",
      gap,
    });

    this.setBindings(bindings);
  }

  setBindings(bindings: KeyBinding[]): void {
    // Clear existing
    this.textElements.forEach((el) => this.container.remove(el.id));
    this.textElements = [];

    // Create new
    bindings.forEach((binding, i) => {
      const text = new TextRenderable(this.renderer, {
        id: `key-binding-${i}`,
        content: `${binding.key}: ${binding.action}`,
        fg: this.theme.colors.fgMuted,
      });
      this.textElements.push(text);
      this.container.add(text);
    });
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.textElements.forEach((el) => {
      el.fg = theme.colors.fgMuted;
    });
  }

  getContainer(): BoxRenderable {
    return this.container;
  }
}
