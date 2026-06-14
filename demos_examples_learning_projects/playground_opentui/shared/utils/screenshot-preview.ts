/**
 * Screenshot Preview Utility
 *
 * Loads PNG screenshots and renders them as colored ASCII art using
 * half-block characters (▀) for 2x vertical resolution in the terminal.
 */

import { Jimp } from "jimp";
import { FrameBufferRenderable, RGBA } from "@opentui/core";
import { existsSync } from "fs";

// Cache loaded images to avoid re-reading from disk
const imageCache = new Map<string, { width: number; height: number; pixels: Uint8Array } | null>();

/**
 * Load an image from disk and return pixel data
 * Returns null if the image doesn't exist or can't be loaded
 */
async function loadImage(
  imagePath: string
): Promise<{ width: number; height: number; pixels: Uint8Array } | null> {
  // Check cache first
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath) ?? null;
  }

  // Check if file exists
  if (!existsSync(imagePath)) {
    imageCache.set(imagePath, null);
    return null;
  }

  try {
    const image = await Jimp.read(imagePath);
    const result = {
      width: image.width,
      height: image.height,
      pixels: new Uint8Array(image.bitmap.data),
    };
    imageCache.set(imagePath, result);
    return result;
  } catch {
    imageCache.set(imagePath, null);
    return null;
  }
}

/**
 * Resize image data to fit target dimensions using nearest-neighbor sampling
 */
function resizeImage(
  source: { width: number; height: number; pixels: Uint8Array },
  targetWidth: number,
  targetHeight: number
): { width: number; height: number; pixels: Uint8Array } {
  const result = new Uint8Array(targetWidth * targetHeight * 4);

  const scaleX = source.width / targetWidth;
  const scaleY = source.height / targetHeight;

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      const srcY = Math.floor(y * scaleY);
      const srcIdx = (srcY * source.width + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;

      result[dstIdx] = source.pixels[srcIdx];
      result[dstIdx + 1] = source.pixels[srcIdx + 1];
      result[dstIdx + 2] = source.pixels[srcIdx + 2];
      result[dstIdx + 3] = source.pixels[srcIdx + 3];
    }
  }

  return { width: targetWidth, height: targetHeight, pixels: result };
}

/**
 * Get pixel color from image data at (x, y)
 */
function getPixel(
  image: { width: number; height: number; pixels: Uint8Array },
  x: number,
  y: number
): { r: number; g: number; b: number; a: number } {
  const idx = (y * image.width + x) * 4;
  return {
    r: image.pixels[idx],
    g: image.pixels[idx + 1],
    b: image.pixels[idx + 2],
    a: image.pixels[idx + 3],
  };
}

/**
 * Load a screenshot and render it to a FrameBufferRenderable using half-block technique
 *
 * The half-block technique uses the "▀" character where:
 * - The foreground color represents the top pixel
 * - The background color represents the bottom pixel
 *
 * This effectively doubles the vertical resolution.
 *
 * @param fb - The FrameBufferRenderable to render to
 * @param imagePath - Path to the PNG screenshot
 * @param width - Target width in terminal columns
 * @param height - Target height in terminal rows (each row = 2 pixels)
 * @returns true if the image was loaded and rendered, false otherwise
 */
export async function loadAndRenderScreenshot(
  fb: FrameBufferRenderable,
  imagePath: string,
  width: number,
  height: number
): Promise<boolean> {
  const imageData = await loadImage(imagePath);

  if (!imageData) {
    // Clear the framebuffer if image not found
    clearFramebuffer(fb, width, height);
    return false;
  }

  // Resize to fit: width columns x (height * 2) pixel rows
  const pixelHeight = height * 2;
  const resized = resizeImage(imageData, width, pixelHeight);

  // Render using half-block technique
  for (let cellY = 0; cellY < height; cellY++) {
    for (let x = 0; x < width; x++) {
      // Get top and bottom pixels for this cell
      const topPixel = getPixel(resized, x, cellY * 2);
      const botPixel = getPixel(resized, x, cellY * 2 + 1);

      // Create RGBA colors
      const fgColor = RGBA.fromInts(topPixel.r, topPixel.g, topPixel.b, topPixel.a);
      const bgColor = RGBA.fromInts(botPixel.r, botPixel.g, botPixel.b, botPixel.a);

      // Set the cell with half-block character
      fb.frameBuffer.setCell(x, cellY, "▀", fgColor, bgColor);
    }
  }

  return true;
}

/**
 * Clear the framebuffer with a transparent/empty state
 */
function clearFramebuffer(fb: FrameBufferRenderable, width: number, height: number): void {
  const transparent = RGBA.fromInts(0, 0, 0, 0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      fb.frameBuffer.setCell(x, y, " ", transparent, transparent);
    }
  }
}

/**
 * Clear the image cache (useful for testing or forcing reload)
 */
export function clearScreenshotCache(): void {
  imageCache.clear();
}

/**
 * Invalidate a specific image from the cache
 */
export function invalidateScreenshotCache(imagePath: string): void {
  imageCache.delete(imagePath);
}
