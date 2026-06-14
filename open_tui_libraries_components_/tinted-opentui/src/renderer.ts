import { RGBA, type CliRenderer } from "@opentui/core";
import type { TintyOpenTUITheme } from "./types.js";

export interface ApplyRendererThemeOptions {
  background?: boolean;
  cursor?: boolean;
}

export function applyRendererTheme(
  renderer: Pick<CliRenderer, "setBackgroundColor" | "setCursorColor">,
  theme: TintyOpenTUITheme,
  options: ApplyRendererThemeOptions = {},
): void {
  if (options.background ?? true) {
    renderer.setBackgroundColor(theme.components.renderer.backgroundColor);
  }

  if (options.cursor ?? true) {
    renderer.setCursorColor(RGBA.fromHex(theme.components.renderer.cursorColor));
  }
}
