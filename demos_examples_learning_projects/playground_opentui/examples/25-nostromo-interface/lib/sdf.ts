/**
 * SDF (Signed Distance Function) Library for Reactor Core
 *
 * Mathematical primitives for raymarched 3D rendering.
 * Based on Inigo Quilez's SDF functions: https://iquilezles.org/articles/distfunctions/
 */

// ============================================================================
// Vector Types & Operations
// ============================================================================

export type Vec3 = [number, number, number];
export type Vec2 = [number, number];

export function vec3(x: number, y: number, z: number): Vec3 {
  return [x, y, z];
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function mul(a: Vec3, s: number): Vec3 {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function div(a: Vec3, s: number): Vec3 {
  return [a[0] / s, a[1] / s, a[2] / s];
}

export function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function length(v: Vec3): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function normalize(v: Vec3): Vec3 {
  const len = length(v);
  if (len === 0) return [0, 0, 0];
  return div(v, len);
}

export function abs3(v: Vec3): Vec3 {
  return [Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])];
}

export function max3(v: Vec3, s: number): Vec3 {
  return [Math.max(v[0], s), Math.max(v[1], s), Math.max(v[2], s)];
}

export function mix(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

export function clamp(x: number, minVal: number, maxVal: number): number {
  return Math.min(Math.max(x, minVal), maxVal);
}

// ============================================================================
// Rotation Operations
// ============================================================================

export function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [p[0], c * p[1] - s * p[2], s * p[1] + c * p[2]];
}

export function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * p[0] + s * p[2], p[1], -s * p[0] + c * p[2]];
}

export function rotateZ(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * p[0] - s * p[1], s * p[0] + c * p[1], p[2]];
}

export function rotate(p: Vec3, angles: Vec3): Vec3 {
  let result = rotateX(p, angles[0]);
  result = rotateY(result, angles[1]);
  result = rotateZ(result, angles[2]);
  return result;
}

// ============================================================================
// SDF Primitives
// ============================================================================

/**
 * Sphere SDF
 */
export function sdSphere(p: Vec3, r: number): number {
  return length(p) - r;
}

/**
 * Torus SDF (lying flat on XZ plane)
 * @param t - [major radius, minor radius]
 */
export function sdTorus(p: Vec3, t: Vec2): number {
  const q: Vec2 = [Math.sqrt(p[0] * p[0] + p[2] * p[2]) - t[0], p[1]];
  return Math.sqrt(q[0] * q[0] + q[1] * q[1]) - t[1];
}

/**
 * Octahedron SDF (exact)
 */
export function sdOctahedron(p: Vec3, s: number): number {
  const ap = abs3(p);
  const m = ap[0] + ap[1] + ap[2] - s;
  let q: Vec3;

  if (3.0 * ap[0] < m) {
    q = ap;
  } else if (3.0 * ap[1] < m) {
    q = [ap[1], ap[2], ap[0]];
  } else if (3.0 * ap[2] < m) {
    q = [ap[2], ap[0], ap[1]];
  } else {
    return m * 0.57735027; // 1/sqrt(3)
  }

  const k = clamp(0.5 * (q[2] - q[1] + s), 0.0, s);
  return length([q[0], q[1] - s + k, q[2] - k]);
}

// ============================================================================
// SDF Operations
// ============================================================================

/**
 * Smooth minimum (polynomial) - creates organic blending
 */
export function smoothMin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// ============================================================================
// Reactor Core Scene
// ============================================================================

export interface ReactorState {
  shapePhase: number; // 0-3, which shape transition we're in
  morphT: number; // 0-1, blend between shapes
  rotation: Vec3; // Current rotation
  pulseScale: number; // 0.9-1.1 breathing effect
  temperature: number; // 0-1, affects color
}

type ShapeFunc = (p: Vec3, scale: number) => number;

const REACTOR_SHAPES: ShapeFunc[] = [
  (p, scale) => sdSphere(p, 0.8 * scale),
  (p, scale) => sdTorus(p, [0.6 * scale, 0.2 * scale]),
  (p, scale) => sdOctahedron(p, 0.9 * scale),
];

export const REACTOR_SHAPE_NAMES = ["SPHERE", "TORUS", "OCTAHEDRON"];

/**
 * Create reactor core SDF based on current state
 */
export function createReactorSDF(
  state: ReactorState
): (p: Vec3) => number {
  return (p: Vec3): number => {
    // Apply rotation
    const rotatedP = rotate(p, state.rotation);

    // Get current and next shape indices
    const shapeA = state.shapePhase % REACTOR_SHAPES.length;
    const shapeB = (state.shapePhase + 1) % REACTOR_SHAPES.length;

    // Get distances
    const dA = REACTOR_SHAPES[shapeA](rotatedP, state.pulseScale);
    const dB = REACTOR_SHAPES[shapeB](rotatedP, state.pulseScale);

    // Smooth blend between shapes
    const blendK = 0.4;
    if (state.morphT < 0.5) {
      const localT = state.morphT * 2;
      return mix(dA, smoothMin(dA, dB, blendK), localT);
    } else {
      const localT = (state.morphT - 0.5) * 2;
      return mix(smoothMin(dA, dB, blendK), dB, localT);
    }
  };
}
