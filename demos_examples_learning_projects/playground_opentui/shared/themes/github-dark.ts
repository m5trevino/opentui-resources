import type { Theme } from "./index";

export const githubDarkTheme: Theme = {
  name: "GitHub Dark",
  colors: {
    // Background colors
    bg: "#0d1117",
    bgAlt: "#161b22",
    bgHighlight: "#21262d",

    // Foreground colors
    fg: "#c9d1d9",
    fgMuted: "#8b949e",
    fgAccent: "#58a6ff",

    // UI element colors
    border: "#30363d",
    borderFocused: "#58a6ff",
    selection: "#264f78",
    cursor: "#c9d1d9",

    // Semantic colors
    success: "#3fb950",
    warning: "#d29922",
    error: "#f85149",
    info: "#58a6ff",

    // Accent colors (GitHub palette)
    accent1: "#f778ba", // Pink
    accent2: "#a371f7", // Purple
    accent3: "#58a6ff", // Blue
    accent4: "#3fb950", // Green
    accent5: "#d29922", // Yellow
    accent6: "#79c0ff", // Light Blue
  },
};
