/**
 * Raymarching Engine for Reactor Core
 *
 * Sphere-tracing implementation for rendering SDFs.
 * Optimized for the Nostromo aesthetic with green/amber coloring.
 */

import {
  type Vec3,
  vec3,
  add,
  mul,
  sub,
  normalize,
  length,
  dot,
  mix,
  clamp,
  type ReactorState,
  createReactorSDF,
} from "./sdf";

// ============================================================================
// Configuration
// ============================================================================

const MAX_STEPS = 48;
const MAX_DISTANCE = 20.0;
const SURFACE_THRESHOLD = 0.005;

// ============================================================================
// Types
// ============================================================================

export interface RayHit {
  hit: boolean;
  position: Vec3;
  steps: number;
  totalDistance: number;
}

export interface Camera {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fov: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

// ============================================================================
// Vector Utilities
// ============================================================================

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// ============================================================================
// Ray Generation
// ============================================================================

export function getRayDirection(
  x: number,
  y: number,
  width: number,
  height: number,
  camera: Camera,
  pixelAspect: number = 1.0 // Use 1.0 for half-block rendering
): Vec3 {
  const aspectRatio = (width / height) * pixelAspect;
  const fovRad = (camera.fov * Math.PI) / 180;
  const fovScale = Math.tan(fovRad / 2);

  const ndcX = ((x + 0.5) / width) * 2 - 1;
  const ndcY = 1 - ((y + 0.5) / height) * 2;

  const forward = normalize(sub(camera.target, camera.position));
  const right = normalize(cross(forward, camera.up));
  const up = cross(right, forward);

  return normalize(
    add(
      add(forward, mul(right, ndcX * fovScale * aspectRatio)),
      mul(up, ndcY * fovScale)
    )
  );
}

// ============================================================================
// Raymarching
// ============================================================================

export function raymarch(
  origin: Vec3,
  direction: Vec3,
  scene: (p: Vec3) => number
): RayHit {
  let totalDistance = 0;
  let position = origin;

  for (let step = 0; step < MAX_STEPS; step++) {
    position = add(origin, mul(direction, totalDistance));
    const distance = scene(position);

    if (distance < SURFACE_THRESHOLD) {
      return { hit: true, position, steps: step, totalDistance };
    }

    if (totalDistance > MAX_DISTANCE) {
      return { hit: false, position, steps: step, totalDistance };
    }

    totalDistance += distance;
  }

  return { hit: false, position, steps: MAX_STEPS, totalDistance };
}

// ============================================================================
// Normal Calculation
// ============================================================================

export function calcNormal(p: Vec3, scene: (p: Vec3) => number): Vec3 {
  const eps = 0.002;
  const d = scene(p);

  const nx = scene([p[0] + eps, p[1], p[2]]) - d;
  const ny = scene([p[0], p[1] + eps, p[2]]) - d;
  const nz = scene([p[0], p[1], p[2] + eps]) - d;

  return normalize([nx, ny, nz]);
}

// ============================================================================
// Ambient Occlusion
// ============================================================================

export function calcAO(
  p: Vec3,
  n: Vec3,
  scene: (p: Vec3) => number
): number {
  let occlusion = 0;
  let scale = 1.0;

  for (let i = 0; i < 4; i++) {
    const h = 0.02 + 0.15 * i;
    const samplePos = add(p, mul(n, h));
    const d = scene(samplePos);
    occlusion += (h - d) * scale;
    scale *= 0.9;
  }

  return 1.0 - clamp(3.0 * occlusion, 0, 1);
}

// ============================================================================
// Shading - Nostromo Aesthetic
// ============================================================================

export interface ShadeParams {
  lightDir: Vec3;
  baseColor: Color; // Phosphor green
  hotColor: Color; // Amber/orange for heat
  temperature: number; // 0-1
  ambientStrength: number;
  specularPower: number;
  rimStrength: number;
}

const DEFAULT_SHADE_PARAMS: ShadeParams = {
  lightDir: normalize([0.5, 0.8, 0.3]),
  baseColor: { r: 0.2, g: 1.0, b: 0.2 }, // Phosphor green
  hotColor: { r: 1.0, g: 0.6, b: 0.1 }, // Amber
  temperature: 0.3,
  ambientStrength: 0.15,
  specularPower: 32,
  rimStrength: 0.5,
};

export function shade(
  pos: Vec3,
  normal: Vec3,
  rayDir: Vec3,
  ao: number,
  scene: (p: Vec3) => number,
  params: ShadeParams = DEFAULT_SHADE_PARAMS
): Color {
  // Diffuse (Lambert)
  const NdotL = Math.max(0, dot(normal, params.lightDir));
  const diffuse = NdotL;

  // Specular (Blinn-Phong)
  const halfVec = normalize(add(params.lightDir, mul(rayDir, -1)));
  const NdotH = Math.max(0, dot(normal, halfVec));
  const specular = Math.pow(NdotH, params.specularPower);

  // Rim lighting (edge glow - very fitting for reactor)
  const NdotV = Math.max(0, dot(normal, mul(rayDir, -1)));
  const rim = Math.pow(1.0 - NdotV, 3) * params.rimStrength;

  // Combine lighting
  const lighting =
    params.ambientStrength + diffuse * 0.6 + specular * 0.3 + rim;

  // Apply ambient occlusion
  const finalLighting = lighting * (0.5 + ao * 0.5);

  // Color: blend between base (green) and hot (amber) based on temperature
  const t = params.temperature;
  const color: Color = {
    r: mix(params.baseColor.r, params.hotColor.r, t) * finalLighting,
    g: mix(params.baseColor.g, params.hotColor.g, t) * finalLighting,
    b: mix(params.baseColor.b, params.hotColor.b, t) * finalLighting,
  };

  // Clamp
  color.r = clamp(color.r, 0, 1);
  color.g = clamp(color.g, 0, 1);
  color.b = clamp(color.b, 0, 1);

  return color;
}

// ============================================================================
// Camera Utilities
// ============================================================================

export function createOrbitCamera(
  angle: number,
  height: number,
  distance: number,
  fov: number = 50
): Camera {
  return {
    position: [
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance,
    ],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov,
  };
}

// ============================================================================
// Color Conversion
// ============================================================================

export function colorToRGBA(color: Color): [number, number, number, number] {
  return [
    Math.floor(color.r * 255),
    Math.floor(color.g * 255),
    Math.floor(color.b * 255),
    255,
  ];
}

export function colorToHex(color: Color): string {
  const r = Math.floor(color.r * 255)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(color.g * 255)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(color.b * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
}
