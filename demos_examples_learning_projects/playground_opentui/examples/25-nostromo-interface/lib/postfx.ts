/**
 * Post-Processing Effects Pipeline
 *
 * Applies CRT-style visual effects to achieve the 1979 Alien aesthetic:
 * - Bloom: Subtle glow around bright elements
 * - Scanlines: CRT horizontal line effect
 * - Vignette: Darkened screen edges
 * - Noise: Film grain/CRT static texture
 */

import {
  applyScanlines,
  applyNoise,
  BloomEffect,
  VignetteEffect,
} from "@opentui/core/post/filters";
import type { OptimizedBuffer } from "@opentui/core/buffer";

// Configure effects for Alien 1979 look
const bloom = new BloomEffect(
  0.6, // threshold: Only bright pixels (60%+) glow
  0.25, // strength: Subtle glow, not overwhelming
  1 // radius: Tight glow radius
);

const vignette = new VignetteEffect(0.12); // Subtle edge darkening

/**
 * Apply full post-processing pipeline to a buffer
 */
export function applyPostProcessing(buffer: OptimizedBuffer): void {
  // 1. Bloom effect for glow on bright lines
  bloom.apply(buffer);

  // 2. Scanlines for CRT look (every other line slightly darker)
  applyScanlines(buffer, 0.1, 2); // strength=0.1, step=2

  // 3. Vignette for edge darkening
  vignette.apply(buffer);

  // 4. Subtle noise for film grain/CRT texture
  applyNoise(buffer, 0.015);
}

/**
 * Apply lighter post-processing (for better performance)
 * Use this for panels that don't need full effects
 */
export function applyLightPostProcessing(buffer: OptimizedBuffer): void {
  // Just scanlines and subtle noise
  applyScanlines(buffer, 0.08, 2);
  applyNoise(buffer, 0.01);
}

// Export individual effects for panel-specific use
export { bloom, vignette, applyScanlines, applyNoise };
