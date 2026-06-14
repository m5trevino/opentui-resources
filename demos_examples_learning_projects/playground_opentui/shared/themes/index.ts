/**
 * Theme system for OpenTUI examples
 * Provides consistent color palettes across all examples
 */

export interface Theme {
  name: string;
  colors: {
    // Background colors
    bg: string;
    bgAlt: string;
    bgHighlight: string;

    // Foreground colors
    fg: string;
    fgMuted: string;
    fgAccent: string;

    // UI element colors
    border: string;
    borderFocused: string;
    selection: string;
    cursor: string;

    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Accent colors
    accent1: string;
    accent2: string;
    accent3: string;
    accent4: string;
    accent5: string;
    accent6: string;
  };
}

export { draculaTheme } from "./dracula";
export { nordTheme } from "./nord";
export { monokaiTheme } from "./monokai";
export { githubDarkTheme } from "./github-dark";
export { catppuccinTheme } from "./catppuccin";

import { draculaTheme } from "./dracula";
import { nordTheme } from "./nord";
import { monokaiTheme } from "./monokai";
import { githubDarkTheme } from "./github-dark";
import { catppuccinTheme } from "./catppuccin";

export const themes: Record<string, Theme> = {
  dracula: draculaTheme,
  nord: nordTheme,
  monokai: monokaiTheme,
  "github-dark": githubDarkTheme,
  catppuccin: catppuccinTheme,
};

export const defaultTheme = draculaTheme;

/** Default theme export for simplified imports */
export const theme = defaultTheme;

export function getTheme(name: string): Theme {
  return themes[name] || defaultTheme;
}

export function listThemes(): string[] {
  return Object.keys(themes);
}
