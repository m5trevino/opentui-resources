/**
 * Filename: Theme.ts
 * Folder: /domain/entities/
 */

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
}

export const themes: Record<string, Theme> = {
  default: {
    name: "Default",
    colors: {
      primary: "cyan",
      secondary: "blue",
      success: "green",
      warning: "yellow",
      danger: "red",
      info: "cyan",
      background: "black",
      foreground: "white",
      muted: "gray",
      border: "white",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      primary: "#6a5acd",
      secondary: "#4682b4",
      success: "#20b2aa",
      warning: "#daa520",
      danger: "#dc143c",
      info: "#00bfff",
      background: "#1a1b26",
      foreground: "#c0caf5",
      muted: "#565f89",
      border: "#414868",
    },
  },
  light: {
    name: "Light",
    colors: {
      primary: "blue",
      secondary: "cyan",
      success: "green",
      warning: "#ff8c00",
      danger: "red",
      info: "cyan",
      background: "white",
      foreground: "black",
      muted: "#666666",
      border: "#cccccc",
    },
  },
  matrix: {
    name: "Matrix",
    colors: {
      primary: "#00ff00",
      secondary: "#00cc00",
      success: "#00ff00",
      warning: "#88ff00",
      danger: "#ff0000",
      info: "#00ffff",
      background: "black",
      foreground: "#00ff00",
      muted: "#006600",
      border: "#00cc00",
    },
  },
  nord: {
    name: "Nord",
    colors: {
      primary: "#88c0d0",
      secondary: "#81a1c1",
      success: "#a3be8c",
      warning: "#ebcb8b",
      danger: "#bf616a",
      info: "#5e81ac",
      background: "#2e3440",
      foreground: "#eceff4",
      muted: "#4c566a",
      border: "#3b4252",
    },
  },
};
