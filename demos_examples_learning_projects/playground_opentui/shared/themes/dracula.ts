import type { Theme } from "./index";

export const draculaTheme: Theme = {
  name: "Dracula",
  colors: {
    // Background colors
    bg: "#282a36",
    bgAlt: "#21222c",
    bgHighlight: "#44475a",

    // Foreground colors
    fg: "#f8f8f2",
    fgMuted: "#6272a4",
    fgAccent: "#f1fa8c",

    // UI element colors
    border: "#6272a4",
    borderFocused: "#bd93f9",
    selection: "#44475a",
    cursor: "#f8f8f2",

    // Semantic colors
    success: "#50fa7b",
    warning: "#ffb86c",
    error: "#ff5555",
    info: "#8be9fd",

    // Accent colors (Dracula palette)
    accent1: "#ff79c6", // Pink
    accent2: "#bd93f9", // Purple
    accent3: "#8be9fd", // Cyan
    accent4: "#50fa7b", // Green
    accent5: "#ffb86c", // Orange
    accent6: "#f1fa8c", // Yellow
  },
};
