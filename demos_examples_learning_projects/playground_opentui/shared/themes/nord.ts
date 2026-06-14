import type { Theme } from "./index";

export const nordTheme: Theme = {
  name: "Nord",
  colors: {
    // Background colors (Polar Night)
    bg: "#2e3440",
    bgAlt: "#3b4252",
    bgHighlight: "#434c5e",

    // Foreground colors (Snow Storm)
    fg: "#eceff4",
    fgMuted: "#d8dee9",
    fgAccent: "#88c0d0",

    // UI element colors
    border: "#4c566a",
    borderFocused: "#81a1c1",
    selection: "#434c5e",
    cursor: "#d8dee9",

    // Semantic colors (Aurora)
    success: "#a3be8c",
    warning: "#ebcb8b",
    error: "#bf616a",
    info: "#81a1c1",

    // Accent colors (Frost + Aurora)
    accent1: "#b48ead", // Purple
    accent2: "#81a1c1", // Frost Blue
    accent3: "#88c0d0", // Ice Blue
    accent4: "#a3be8c", // Green
    accent5: "#ebcb8b", // Yellow
    accent6: "#8fbcbb", // Teal
  },
};
