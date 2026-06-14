/**
 * Nostromo Theme - Alien (1979) inspired CRT aesthetic
 *
 * Based on the reference image from the film:
 * - Cyan wireframe grids
 * - Blue UI borders and crosshairs
 * - Yellow orbital trajectories
 * - Orange-red topographical contours
 * - Phosphor green text and status indicators
 */

import type { Theme } from "../../shared/themes/index";

// Extended theme type with additional accent colors
type NostromoTheme = Theme & {
  colors: Theme["colors"] & {
    accent7: string;
    accent8: string;
  };
};

export const nostromoTheme: NostromoTheme = {
  name: "Nostromo",
  colors: {
    // Background colors - deep black with subtle blue-green tint
    bg: "#0a0a0a",
    bgAlt: "#0f1a1f", // Blue-green tint (was pure green)
    bgHighlight: "#1a2a3a", // Selection with blue undertone

    // Foreground colors - phosphor green for text
    fg: "#33ff33",
    fgMuted: "#1a8a1a",
    fgAccent: "#66ff66",

    // UI element colors - BLUE borders (like reference image)
    border: "#2a5a8a", // Blue border
    borderFocused: "#3399ff", // Bright blue when focused
    selection: "#1a3a4a",
    cursor: "#33ff33",

    // Semantic colors
    success: "#33ff33",
    warning: "#ffaa00",
    error: "#ff3333",
    info: "#00cccc",

    // Accent colors - expanded for visual variety (matching reference image)
    accent1: "#33ff33", // Phosphor green (text, status)
    accent2: "#00cccc", // Cyan (wireframes, grids)
    accent3: "#ffcc00", // Yellow (trajectories, highlights)
    accent4: "#ff6633", // Orange-red (contours, hot zones)
    accent5: "#3399ff", // Blue (borders, crosshairs)
    accent6: "#aaffaa", // Bright green (emphasized text)
    accent7: "#ff4444", // Hot red (critical)
    accent8: "#4a8aaa", // Muted cyan (secondary grids)
  },
};

// CRT scanline effect characters
export const CRT = {
  scanline: "░",
  glow: "▓",
  solid: "█",
  half: "▄",
  quarter: "░",
};

// Box drawing characters for that retro terminal feel
export const BORDER = {
  horizontal: "─",
  vertical: "│",
  topLeft: "┌",
  topRight: "┐",
  bottomLeft: "└",
  bottomRight: "┘",
  cross: "┼",
  teeLeft: "├",
  teeRight: "┤",
  teeUp: "┴",
  teeDown: "┬",
};

// Crosshair markers (corner decorations)
export const CROSSHAIR = {
  full: "╋",
  light: "+",
  target: "⊕",
};
