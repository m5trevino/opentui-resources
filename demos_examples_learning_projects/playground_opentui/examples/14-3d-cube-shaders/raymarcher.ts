/**
 * Raymarching Engine
 *
 * Sphere-tracing implementation for rendering SDFs.
 * Based on: https://iquilezles.org/articles/raymarchingdf/
 */

import { type Vec3, type SceneSDF, vec3, add, mul, normalize, sub, length } from "./sdf";

// ============================================================================
// Configuration
// ============================================================================

const MAX_STEPS = 96;
const MAX_DISTANCE = 50.0;
const SURFACE_THRESHOLD = 0.001;

// ============================================================================
// Types
// ============================================================================

export interface RayHit {
  hit: boolean;
  position: Vec3;
  distance: number;
  steps: number;
  totalDistance: number;
}

export interface Camera {
  position: Vec3;
  target: Vec3;
  up: Vec3;
  fov: number; // Field of view in degrees
}

// ============================================================================
// Ray Generation
// ============================================================================

/**
 * Generate a ray direction for a given pixel coordinate
 * @param x - Pixel X (0 to width-1)
 * @param y - Pixel Y (0 to height-1)
 * @param width - Screen width
 * @param height - Screen height
 * @param camera - Camera parameters
 * @param pixelAspect - Pixel aspect ratio correction (default 0.5 for terminal chars ~2x tall, use 1.0 for half-block rendering)
 */
export function getRayDirection(
  x: number,
  y: number,
  width: number,
  height: number,
  camera: Camera,
  pixelAspect: number = 0.5
): Vec3 {
  // Convert pixel to normalized device coordinates (-1 to 1)
  // pixelAspect compensates for non-square pixels (terminal chars are ~2x tall)
  // With half-block rendering, pixels are ~square so use pixelAspect=1.0
  const aspectRatio = (width / height) * pixelAspect;
  const fovRad = (camera.fov * Math.PI) / 180;
  const fovScale = Math.tan(fovRad / 2);

  const ndcX = ((x + 0.5) / width) * 2 - 1;
  const ndcY = 1 - ((y + 0.5) / height) * 2; // Flip Y for screen coords

  // Calculate camera basis vectors
  const forward = normalize(sub(camera.target, camera.position));
  const right = normalize(cross(forward, camera.up));
  const up = cross(right, forward);

  // Calculate ray direction in world space
  const rayDir = normalize(
    add(
      add(forward, mul(right, ndcX * fovScale * aspectRatio)),
      mul(up, ndcY * fovScale)
    )
  );

  return rayDir;
}

/**
 * Cross product of two vectors
 */
function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// ============================================================================
// Raymarching
// ============================================================================

/**
 * Sphere-trace through the scene to find surface intersection
 * @param origin - Ray origin (camera position)
 * @param direction - Normalized ray direction
 * @param scene - Scene SDF function
 */
export function raymarch(origin: Vec3, direction: Vec3, scene: SceneSDF): RayHit {
  let totalDistance = 0;
  let position = origin;

  for (let step = 0; step < MAX_STEPS; step++) {
    position = add(origin, mul(direction, totalDistance));
    const distance = scene(position);

    // Hit surface
    if (distance < SURFACE_THRESHOLD) {
      return {
        hit: true,
        position,
        distance,
        steps: step,
        totalDistance,
      };
    }

    // Gone too far
    if (totalDistance > MAX_DISTANCE) {
      return {
        hit: false,
        position,
        distance,
        steps: step,
        totalDistance,
      };
    }

    // March forward by the safe distance
    totalDistance += distance;
  }

  // Exceeded max steps
  return {
    hit: false,
    position,
    distance: scene(position),
    steps: MAX_STEPS,
    totalDistance,
  };
}

/**
 * Calculate surface normal at a point using gradient estimation
 * @param p - Point on surface
 * @param scene - Scene SDF function
 */
export function calcNormal(p: Vec3, scene: SceneSDF): Vec3 {
  const eps = 0.001;
  const d = scene(p);

  const nx = scene([p[0] + eps, p[1], p[2]]) - d;
  const ny = scene([p[0], p[1] + eps, p[2]]) - d;
  const nz = scene([p[0], p[1], p[2] + eps]) - d;

  return normalize([nx, ny, nz]);
}

/**
 * Calculate ambient occlusion at a point
 * Uses the SDF to estimate how occluded the point is
 * @param p - Point on surface
 * @param n - Surface normal
 * @param scene - Scene SDF function
 */
export function calcAO(p: Vec3, n: Vec3, scene: SceneSDF): number {
  let occlusion = 0;
  let scale = 1.0;

  for (let i = 0; i < 5; i++) {
    const h = 0.01 + 0.12 * i;
    const samplePos = add(p, mul(n, h));
    const d = scene(samplePos);
    occlusion += (h - d) * scale;
    scale *= 0.95;
  }

  return 1.0 - Math.max(0, Math.min(1, 3.0 * occlusion));
}

/**
 * Calculate soft shadow factor
 * @param origin - Point on surface (slightly offset)
 * @param lightDir - Direction to light (normalized)
 * @param scene - Scene SDF function
 * @param minT - Minimum march distance
 * @param maxT - Maximum march distance
 */
export function calcSoftShadow(
  origin: Vec3,
  lightDir: Vec3,
  scene: SceneSDF,
  minT: number = 0.02,
  maxT: number = 10.0
): number {
  let res = 1.0;
  let t = minT;
  const k = 16.0; // Shadow softness

  for (let i = 0; i < 32 && t < maxT; i++) {
    const pos = add(origin, mul(lightDir, t));
    const h = scene(pos);

    if (h < 0.001) {
      return 0.0; // In shadow
    }

    res = Math.min(res, (k * h) / t);
    t += h;
  }

  return Math.max(0, Math.min(1, res));
}

// ============================================================================
// Camera Utilities
// ============================================================================

/**
 * Create a camera that orbits around the origin
 * @param angle - Orbit angle in radians
 * @param height - Camera height
 * @param distance - Distance from origin
 * @param fov - Field of view in degrees
 */
export function createOrbitCamera(
  angle: number,
  height: number,
  distance: number,
  fov: number = 60
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
