/**
 * Shader System
 *
 * Lighting calculations, color mapping, and visual effects.
 */

import {
  type Vec3,
  type SceneSDF,
  vec3,
  add,
  sub,
  mul,
  dot,
  normalize,
  clamp,
  mix,
} from "./sdf";
import { type RayHit, calcNormal, calcAO, calcSoftShadow } from "./raymarcher";

// ============================================================================
// Color Types
// ============================================================================

export interface RGB {
  r: number; // 0-255
  g: number;
  b: number;
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-1
  l: number; // 0-1
}

// ============================================================================
// Color Utilities
// ============================================================================

export function rgb(r: number, g: number, b: number): RGB {
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
}

export function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return rgb(
    mix(a.r, b.r, t),
    mix(a.g, b.g, t),
    mix(a.b, b.b, t)
  );
}

export function mulRGB(c: RGB, s: number): RGB {
  return rgb(c.r * s, c.g * s, c.b * s);
}

export function addRGB(a: RGB, b: RGB): RGB {
  return rgb(
    Math.min(255, a.r + b.r),
    Math.min(255, a.g + b.g),
    Math.min(255, a.b + b.b)
  );
}

export function hexToRGB(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function hslToRGB(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const hNorm = h / 360;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRGB = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  return {
    r: Math.round(hueToRGB(hNorm + 1 / 3) * 255),
    g: Math.round(hueToRGB(hNorm) * 255),
    b: Math.round(hueToRGB(hNorm - 1 / 3) * 255),
  };
}

export function rgbToHSL(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s, l };
}

export function hueShift(color: RGB, amount: number): RGB {
  const hsl = rgbToHSL(color);
  hsl.h = (hsl.h + amount) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return hslToRGB(hsl);
}

// ============================================================================
// Color Palette
// ============================================================================

export const palette = {
  background: hexToRGB("#0a0a1a"),
  primary: hexToRGB("#8b5cf6"), // Electric purple
  secondary: hexToRGB("#ec4899"), // Hot pink
  highlight: hexToRGB("#22d3ee"), // Cyan glow
  shadow: hexToRGB("#1e1b4b"), // Deep violet
  ao: hexToRGB("#f59e0b"), // Warm amber (for AO tint)
  white: hexToRGB("#ffffff"),
};

// ============================================================================
// Lighting
// ============================================================================

export interface LightingParams {
  lightDir: Vec3; // Normalized direction TO light
  ambientStrength: number; // 0-1
  diffuseStrength: number; // 0-1
  specularStrength: number; // 0-1
  specularPower: number; // Shininess (higher = tighter highlight)
  rimStrength: number; // 0-1 rim light intensity
  aoStrength: number; // 0-1 ambient occlusion strength
}

export const defaultLighting: LightingParams = {
  lightDir: normalize([0.5, 0.8, 0.3]),
  ambientStrength: 0.15,
  diffuseStrength: 0.7,
  specularStrength: 0.4,
  specularPower: 32,
  rimStrength: 0.3,
  aoStrength: 0.6,
};

/**
 * Calculate lighting intensity at a surface point
 */
export function calcLighting(
  position: Vec3,
  normal: Vec3,
  viewDir: Vec3,
  params: LightingParams,
  ao: number
): number {
  // Ambient
  let intensity = params.ambientStrength;

  // Diffuse (Lambert)
  const nDotL = Math.max(0, dot(normal, params.lightDir));
  intensity += nDotL * params.diffuseStrength;

  // Specular (Blinn-Phong)
  const halfDir = normalize(add(params.lightDir, viewDir));
  const nDotH = Math.max(0, dot(normal, halfDir));
  const specular = Math.pow(nDotH, params.specularPower);
  intensity += specular * params.specularStrength;

  // Rim light (fresnel-like effect)
  const rim = 1.0 - Math.max(0, dot(normal, viewDir));
  const rimPow = Math.pow(rim, 3);
  intensity += rimPow * params.rimStrength;

  // Apply ambient occlusion
  const aoFactor = mix(1.0, ao, params.aoStrength);
  intensity *= aoFactor;

  return clamp(intensity, 0, 1);
}

// ============================================================================
// Shading
// ============================================================================

export interface ShadeParams {
  lighting: LightingParams;
  primaryColor: RGB;
  secondaryColor: RGB;
  highlightColor: RGB;
  backgroundColor: RGB;
  hueOffset: number; // For color cycling
  time: number; // For animated effects
  enableShadows: boolean;
  enableAO: boolean;
}

/**
 * Shade a ray hit to produce final color
 */
export function shade(
  hit: RayHit,
  scene: SceneSDF,
  viewDir: Vec3,
  params: ShadeParams
): RGB {
  // Miss - return background with depth fog
  if (!hit.hit) {
    // Slight gradient in background based on ray direction
    const skyGradient = (viewDir[1] + 1) * 0.5; // 0 at bottom, 1 at top
    const bgColor = lerpRGB(
      params.backgroundColor,
      hueShift(params.backgroundColor, 30),
      skyGradient * 0.3
    );
    return bgColor;
  }

  // Calculate surface properties
  const normal = calcNormal(hit.position, scene);
  const ao = params.enableAO ? calcAO(hit.position, normal, scene) : 1.0;

  // Calculate lighting intensity
  const intensity = calcLighting(
    hit.position,
    normal,
    viewDir,
    params.lighting,
    ao
  );

  // Soft shadows (optional, expensive)
  let shadow = 1.0;
  if (params.enableShadows) {
    const shadowOrigin = add(hit.position, mul(normal, 0.01));
    shadow = calcSoftShadow(shadowOrigin, params.lighting.lightDir, scene);
    shadow = mix(0.3, 1.0, shadow); // Don't go fully black
  }

  // Apply hue shift for color cycling
  const primary = hueShift(params.primaryColor, params.hueOffset);
  const secondary = hueShift(params.secondaryColor, params.hueOffset);
  const highlight = hueShift(params.highlightColor, params.hueOffset);

  // Base color from normal direction (gives variation across surface)
  const normalBlend = (normal[1] + 1) * 0.5; // Y component for top/bottom gradient
  const baseColor = lerpRGB(primary, secondary, normalBlend);

  // Apply lighting intensity
  let finalColor = mulRGB(baseColor, intensity * shadow);

  // Add highlight on bright spots
  const highlightFactor = Math.pow(intensity, 3);
  finalColor = lerpRGB(finalColor, highlight, highlightFactor * 0.3);

  // Subtle AO tint (warm shadows)
  if (ao < 0.8) {
    const aoTint = hueShift(palette.ao, params.hueOffset);
    const aoBlend = (1 - ao) * 0.2;
    finalColor = lerpRGB(finalColor, mulRGB(aoTint, 0.5), aoBlend);
  }

  // Depth fog
  const fogStart = 3.0;
  const fogEnd = 15.0;
  const fogFactor = clamp((hit.totalDistance - fogStart) / (fogEnd - fogStart), 0, 1);
  finalColor = lerpRGB(finalColor, params.backgroundColor, fogFactor * 0.5);

  return finalColor;
}
