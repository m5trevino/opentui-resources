/**
 * Color Utilities
 *
 * Additional color manipulation and palette management.
 * Re-exports core color types from shader.ts for convenience.
 */

export { type RGB, type HSL, rgb, lerpRGB, mulRGB, addRGB, hexToRGB, hslToRGB, rgbToHSL, hueShift, palette } from "./shader";

import { type RGB, hexToRGB, lerpRGB, hueShift } from "./shader";

// ============================================================================
// Extended Palettes
// ============================================================================

/**
 * Cosmic theme palette
 */
export const cosmicPalette = {
  deepSpace: hexToRGB("#0a0a1a"),
  nebula: hexToRGB("#1a0a2e"),
  stardust: hexToRGB("#2d1b4e"),
  nova: hexToRGB("#ec4899"),
  plasma: hexToRGB("#8b5cf6"),
  corona: hexToRGB("#f59e0b"),
  ice: hexToRGB("#22d3ee"),
  void: hexToRGB("#000000"),
};

/**
 * Synthwave theme palette
 */
export const synthwavePalette = {
  background: hexToRGB("#0d0221"),
  purple: hexToRGB("#541388"),
  pink: hexToRGB("#ff2975"),
  cyan: hexToRGB("#00f6ff"),
  orange: hexToRGB("#ff6c11"),
  grid: hexToRGB("#ff2975"),
};

/**
 * Nature theme palette
 */
export const naturePalette = {
  forest: hexToRGB("#0d3b0d"),
  moss: hexToRGB("#2d5a27"),
  leaf: hexToRGB("#7cb342"),
  sun: hexToRGB("#ffeb3b"),
  sky: hexToRGB("#87ceeb"),
  earth: hexToRGB("#8b4513"),
};

// ============================================================================
// Gradient Functions
// ============================================================================

/**
 * Create a gradient function that interpolates between multiple colors
 * @param colors - Array of colors to interpolate between
 * @returns Function that takes t (0-1) and returns interpolated color
 */
export function createGradient(colors: RGB[]): (t: number) => RGB {
  if (colors.length === 0) return () => ({ r: 0, g: 0, b: 0 });
  if (colors.length === 1) return () => colors[0];

  return (t: number): RGB => {
    const clampedT = Math.max(0, Math.min(1, t));
    const segments = colors.length - 1;
    const segment = Math.floor(clampedT * segments);
    const localT = (clampedT * segments) % 1;

    const startIdx = Math.min(segment, segments - 1);
    const endIdx = Math.min(startIdx + 1, segments);

    return lerpRGB(colors[startIdx], colors[endIdx], localT);
  };
}

/**
 * Rainbow gradient
 */
export const rainbowGradient = createGradient([
  hexToRGB("#ff0000"), // Red
  hexToRGB("#ff8800"), // Orange
  hexToRGB("#ffff00"), // Yellow
  hexToRGB("#00ff00"), // Green
  hexToRGB("#0088ff"), // Blue
  hexToRGB("#8800ff"), // Purple
  hexToRGB("#ff0088"), // Pink
]);

/**
 * Heat gradient (cold to hot)
 */
export const heatGradient = createGradient([
  hexToRGB("#000033"), // Deep blue
  hexToRGB("#0066ff"), // Blue
  hexToRGB("#00ffff"), // Cyan
  hexToRGB("#00ff00"), // Green
  hexToRGB("#ffff00"), // Yellow
  hexToRGB("#ff8800"), // Orange
  hexToRGB("#ff0000"), // Red
  hexToRGB("#ffffff"), // White hot
]);

/**
 * Cosmic gradient
 */
export const cosmicGradient = createGradient([
  cosmicPalette.deepSpace,
  cosmicPalette.nebula,
  cosmicPalette.plasma,
  cosmicPalette.nova,
  cosmicPalette.corona,
]);

// ============================================================================
// Color Effects
// ============================================================================

/**
 * Apply a pulsing brightness effect
 * @param color - Base color
 * @param time - Current time (any unit)
 * @param frequency - Pulse frequency
 * @param amplitude - Pulse amplitude (0-1)
 */
export function pulseBrightness(
  color: RGB,
  time: number,
  frequency: number = 1,
  amplitude: number = 0.2
): RGB {
  const pulse = (Math.sin(time * frequency * Math.PI * 2) + 1) * 0.5;
  const factor = 1 + (pulse - 0.5) * amplitude * 2;
  return {
    r: Math.min(255, Math.round(color.r * factor)),
    g: Math.min(255, Math.round(color.g * factor)),
    b: Math.min(255, Math.round(color.b * factor)),
  };
}

/**
 * Apply a rainbow cycling effect
 * @param color - Base color (used for saturation/lightness reference)
 * @param time - Current time
 * @param speed - Cycle speed
 */
export function rainbowCycle(color: RGB, time: number, speed: number = 1): RGB {
  const hueOffset = (time * speed * 360) % 360;
  return hueShift(color, hueOffset);
}

/**
 * Blend towards white for highlights
 * @param color - Base color
 * @param amount - Blend amount (0-1)
 */
export function addHighlight(color: RGB, amount: number): RGB {
  const white: RGB = { r: 255, g: 255, b: 255 };
  return lerpRGB(color, white, amount);
}

/**
 * Blend towards black for shadows
 * @param color - Base color
 * @param amount - Blend amount (0-1)
 */
export function addShadow(color: RGB, amount: number): RGB {
  const black: RGB = { r: 0, g: 0, b: 0 };
  return lerpRGB(color, black, amount);
}

// ============================================================================
// Color Quantization
// ============================================================================

/**
 * Quantize a color to fewer bits per channel
 * Useful for creating retro/dithered looks
 * @param color - Input color
 * @param levels - Number of levels per channel (e.g., 8 for 3-bit)
 */
export function quantize(color: RGB, levels: number): RGB {
  const step = 255 / (levels - 1);
  return {
    r: Math.round(Math.round(color.r / step) * step),
    g: Math.round(Math.round(color.g / step) * step),
    b: Math.round(Math.round(color.b / step) * step),
  };
}

/**
 * Apply ordered dithering
 * @param color - Input color
 * @param x - Pixel x coordinate
 * @param y - Pixel y coordinate
 * @param strength - Dither strength
 */
export function orderedDither(color: RGB, x: number, y: number, strength: number = 16): RGB {
  // 4x4 Bayer matrix
  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  const threshold = (bayer[y % 4][x % 4] / 16 - 0.5) * strength;

  return {
    r: Math.max(0, Math.min(255, Math.round(color.r + threshold))),
    g: Math.max(0, Math.min(255, Math.round(color.g + threshold))),
    b: Math.max(0, Math.min(255, Math.round(color.b + threshold))),
  };
}
