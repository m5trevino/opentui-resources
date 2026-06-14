/**
 * SDF (Signed Distance Function) Library
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

export function min3(v: Vec3, s: number): Vec3 {
  return [Math.min(v[0], s), Math.min(v[1], s), Math.min(v[2], s)];
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
 * @param p - Point in space
 * @param r - Radius
 */
export function sdSphere(p: Vec3, r: number): number {
  return length(p) - r;
}

/**
 * Box SDF (centered at origin)
 * @param p - Point in space
 * @param b - Half-extents (box dimensions / 2)
 */
export function sdBox(p: Vec3, b: Vec3): number {
  const q = sub(abs3(p), b);
  return length(max3(q, 0)) + Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0);
}

/**
 * Rounded Box SDF
 * @param p - Point in space
 * @param b - Half-extents
 * @param r - Corner radius
 */
export function sdRoundBox(p: Vec3, b: Vec3, r: number): number {
  const q = sub(abs3(p), b);
  return length(max3(q, 0)) + Math.min(Math.max(q[0], Math.max(q[1], q[2])), 0) - r;
}

/**
 * Torus SDF (lying flat on XZ plane)
 * @param p - Point in space
 * @param t - [major radius, minor radius]
 */
export function sdTorus(p: Vec3, t: Vec2): number {
  const q: Vec2 = [Math.sqrt(p[0] * p[0] + p[2] * p[2]) - t[0], p[1]];
  return Math.sqrt(q[0] * q[0] + q[1] * q[1]) - t[1];
}

/**
 * Octahedron SDF (exact)
 * @param p - Point in space
 * @param s - Size
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

/**
 * 6-pointed Star SDF (using hexagonal prism intersection)
 * @param p - Point in space
 * @param r - Outer radius
 * @param h - Height
 */
export function sdStar(p: Vec3, r: number, h: number): number {
  // Create a star by intersecting two triangular prisms rotated 60 degrees
  const k = Math.sqrt(3.0);
  const ap = abs3(p);

  // First triangular prism
  let px = ap[0];
  let pz = ap[2];
  px -= 2.0 * Math.min((-k * px + pz) * 0.5, 0.0) * -k;
  pz -= 2.0 * Math.min((-k * px + pz) * 0.5, 0.0);
  const d1 = Math.sqrt(Math.max(px - r, 0) ** 2 + pz ** 2) - 0.01;

  // Second triangular prism (rotated)
  px = ap[0];
  pz = ap[2];
  const cos60 = 0.5;
  const sin60 = k * 0.5;
  const px2 = cos60 * px + sin60 * pz;
  const pz2 = -sin60 * px + cos60 * pz;
  const absPx2 = Math.abs(px2);
  const absPz2 = Math.abs(pz2);
  const d2 = Math.max(absPx2 - r, absPz2 - r * 0.5);

  // Combine with height constraint
  const dXZ = Math.max(d1, d2);
  const dY = Math.abs(ap[1]) - h;

  return Math.min(Math.max(dXZ, dY), 0.0) + Math.sqrt(Math.max(dXZ, 0) ** 2 + Math.max(dY, 0) ** 2);
}

/**
 * Simple 5-pointed Star (planar, extruded)
 * @param p - Point in space
 * @param r - Radius
 * @param h - Height/thickness
 */
export function sdStar5(p: Vec3, r: number, h: number): number {
  // Use polar coordinates for star shape
  const angle = Math.atan2(p[2], p[0]);
  const dist = Math.sqrt(p[0] * p[0] + p[2] * p[2]);

  // 5-pointed star modulation
  const starR = r * (0.5 + 0.5 * Math.cos(5 * angle));

  const d2D = dist - starR;
  const dY = Math.abs(p[1]) - h;

  return Math.min(Math.max(d2D, dY), 0.0) + Math.sqrt(Math.max(d2D, 0) ** 2 + Math.max(dY, 0) ** 2);
}

// ============================================================================
// SDF Operations
// ============================================================================

/**
 * Smooth minimum (polynomial)
 * Creates organic blending between shapes
 * @param a - First distance
 * @param b - Second distance
 * @param k - Smoothness factor (0.1 - 1.0 typical)
 */
export function smoothMin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

/**
 * Smooth maximum (polynomial)
 */
export function smoothMax(a: number, b: number, k: number): number {
  return -smoothMin(-a, -b, k);
}

/**
 * Union of two SDFs
 */
export function opUnion(d1: number, d2: number): number {
  return Math.min(d1, d2);
}

/**
 * Subtraction of SDFs (d2 carved from d1)
 */
export function opSubtract(d1: number, d2: number): number {
  return Math.max(d1, -d2);
}

/**
 * Intersection of SDFs
 */
export function opIntersect(d1: number, d2: number): number {
  return Math.max(d1, d2);
}

// ============================================================================
// Scene SDF Factory
// ============================================================================

export type SceneSDF = (p: Vec3) => number;

export interface MorphState {
  shapeA: number; // Index 0-4
  shapeB: number; // Index 0-4
  t: number; // 0-1 blend factor
  rotation: Vec3; // Current rotation
  scale: number; // Pulse scale
}

const SHAPE_FUNCTIONS = [
  (p: Vec3, scale: number) => sdRoundBox(p, mul([0.7, 0.7, 0.7], scale) as Vec3, 0.1 * scale),
  (p: Vec3, scale: number) => sdTorus(p, [0.7 * scale, 0.25 * scale]),
  (p: Vec3, scale: number) => sdOctahedron(p, 1.0 * scale),
];

export const SHAPE_NAMES = ["Cube", "Torus", "Octahedron"];

/**
 * Create a scene SDF with morphing between shapes
 */
export function createSceneSDF(state: MorphState): SceneSDF {
  return (p: Vec3): number => {
    // Apply rotation to the point (rotate the space, not the object)
    const rotatedP = rotate(p, state.rotation);

    // Get distances for both shapes
    const dA = SHAPE_FUNCTIONS[state.shapeA](rotatedP, state.scale);
    const dB = SHAPE_FUNCTIONS[state.shapeB](rotatedP, state.scale);

    // Smooth blend between shapes
    // Use smoothMin for organic morphing effect
    const blendK = 0.5; // Smoothness of the blend
    if (state.t < 0.5) {
      // First half: blend from A towards B
      const localT = state.t * 2;
      return mix(dA, smoothMin(dA, dB, blendK), localT);
    } else {
      // Second half: blend from mixed towards B
      const localT = (state.t - 0.5) * 2;
      return mix(smoothMin(dA, dB, blendK), dB, localT);
    }
  };
}
