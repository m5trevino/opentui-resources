import type { Theme } from "./index";

export const monokaiTheme: Theme = {
  name: "Monokai",
  colors: {
    // Background colors
    bg: "#272822",
    bgAlt: "#1e1f1c",
    bgHighlight: "#3e3d32",

    // Foreground colors
    fg: "#f8f8f2",
    fgMuted: "#75715e",
    fgAccent: "#e6db74",

    // UI element colors
    border: "#75715e",
    borderFocused: "#a6e22e",
    selection: "#49483e",
    cursor: "#f8f8f2",

    // Semantic colors
    success: "#a6e22e",
    warning: "#fd971f",
    error: "#f92672",
    info: "#66d9ef",

    // Accent colors (Monokai palette)
    accent1: "#f92672", // Pink/Red
    accent2: "#ae81ff", // Purple
    accent3: "#66d9ef", // Cyan
    accent4: "#a6e22e", // Green
    accent5: "#fd971f", // Orange
    accent6: "#e6db74", // Yellow
  },
};
