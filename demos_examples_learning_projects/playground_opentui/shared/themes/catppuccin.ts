import type { Theme } from "./index";

// Catppuccin Mocha flavor
export const catppuccinTheme: Theme = {
  name: "Catppuccin",
  colors: {
    // Background colors (Base, Mantle, Crust)
    bg: "#1e1e2e",
    bgAlt: "#181825",
    bgHighlight: "#313244",

    // Foreground colors (Text, Subtext)
    fg: "#cdd6f4",
    fgMuted: "#a6adc8",
    fgAccent: "#f5e0dc",

    // UI element colors
    border: "#45475a",
    borderFocused: "#cba6f7",
    selection: "#45475a",
    cursor: "#f5e0dc",

    // Semantic colors
    success: "#a6e3a1",
    warning: "#f9e2af",
    error: "#f38ba8",
    info: "#89b4fa",

    // Accent colors (Catppuccin Mocha)
    accent1: "#f5c2e7", // Pink
    accent2: "#cba6f7", // Mauve
    accent3: "#89b4fa", // Blue
    accent4: "#a6e3a1", // Green
    accent5: "#fab387", // Peach
    accent6: "#f9e2af", // Yellow
  },
};
