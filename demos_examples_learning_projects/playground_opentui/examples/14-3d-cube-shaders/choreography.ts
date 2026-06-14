/**
 * Choreography System
 *
 * Manages camera movement, shape morphing, and visual sequences
 * for the autonomous showcase.
 */

import { type Vec3, vec3, normalize, mix } from "./sdf";
import { type Camera } from "./raymarcher";

// ============================================================================
// Types
// ============================================================================

export interface SceneState {
  time: number; // Total elapsed time in ms
  deltaTime: number; // Frame delta in ms

  // Shape morphing (manual)
  morphProgress: number; // 0-1 progress within current morph
  currentShapeIdx: number; // Index of current shape
  nextShapeIdx: number; // Index of shape we're morphing TO
  isMorphing: boolean; // Whether we're actively morphing
  morphStartTime: number; // When morph started
  shapeName: string; // Human-readable current shape

  // Object transform
  rotation: Vec3; // Current rotation angles (radians)
  scale: number; // Current scale (for pulse effect)

  // Camera
  cameraAngle: number; // Orbit angle (radians)
  cameraHeight: number; // Camera Y position
  cameraDistance: number; // Distance from origin

  // Visual effects
  lightAngle: number; // Light orbit angle
  hueOffset: number; // Color cycling offset (degrees)
  pulsePhase: number; // Pulse animation phase

  // Playback
  paused: boolean;
  sequenceIndex: number; // Current sequence in timeline
}

// ============================================================================
// Configuration
// ============================================================================

export const SHAPE_NAMES = ["Cube", "Torus", "Octahedron"];
export const NUM_SHAPES = SHAPE_NAMES.length;

// Timing (in milliseconds)
const MORPH_DURATION = 1500; // Time for each shape transition (faster for manual)

// Animation speeds
const CAMERA_ORBIT_SPEED = 0.0003; // Radians per ms
const OBJECT_ROTATION_SPEED = 0.0008; // Radians per ms
const LIGHT_ORBIT_SPEED = 0.0005; // Radians per ms
const HUE_CYCLE_SPEED = 0.02; // Degrees per ms
const PULSE_SPEED = 0.003; // Radians per ms

// Camera path
const CAMERA_DISTANCE_BASE = 4.0;
const CAMERA_DISTANCE_VAR = 1.0;
const CAMERA_HEIGHT_BASE = 1.5;
const CAMERA_HEIGHT_VAR = 1.0;

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Smooth start and end (ease in-out)
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Smooth start (ease in)
 */
function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Smooth end (ease out)
 */
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Elastic bounce at end
 */
function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

// ============================================================================
// State Management
// ============================================================================

/**
 * Create initial scene state
 */
export function createInitialState(): SceneState {
  return {
    time: 0,
    deltaTime: 0,
    morphProgress: 0,
    currentShapeIdx: 0,
    nextShapeIdx: 0, // Same as current (no morph in progress)
    isMorphing: false,
    morphStartTime: 0,
    shapeName: SHAPE_NAMES[0],
    rotation: [0, 0, 0],
    scale: 0.75,
    cameraAngle: 0,
    cameraHeight: CAMERA_HEIGHT_BASE,
    cameraDistance: CAMERA_DISTANCE_BASE,
    lightAngle: 0,
    hueOffset: 0,
    pulsePhase: 0,
    paused: false,
    sequenceIndex: 0,
  };
}

/**
 * Update scene state for next frame
 */
export function updateState(state: SceneState, deltaTime: number): SceneState {
  if (state.paused) {
    return { ...state, deltaTime };
  }

  const newTime = state.time + deltaTime;

  // Handle manual morphing
  let morphProgress = state.morphProgress;
  let currentShapeIdx = state.currentShapeIdx;
  let nextShapeIdx = state.nextShapeIdx;
  let isMorphing = state.isMorphing;
  let morphStartTime = state.morphStartTime;

  if (isMorphing) {
    // Calculate morph progress based on elapsed time since morph started
    const morphElapsed = newTime - morphStartTime;
    const rawProgress = morphElapsed / MORPH_DURATION;

    if (rawProgress >= 1.0) {
      // Morph complete
      morphProgress = 0;
      currentShapeIdx = nextShapeIdx;
      isMorphing = false;
    } else {
      // Apply easing
      morphProgress = easeInOutCubic(rawProgress);
    }
  }

  // Determine display name
  const shapeName = isMorphing
    ? `${SHAPE_NAMES[currentShapeIdx]} → ${SHAPE_NAMES[nextShapeIdx]}`
    : SHAPE_NAMES[currentShapeIdx];

  // Object rotation (X and Y axes)
  const rotationX = newTime * OBJECT_ROTATION_SPEED * 0.7;
  const rotationY = newTime * OBJECT_ROTATION_SPEED;
  const rotationZ = 0;

  // Scale (no pulsing)
  const pulsePhase = 0;
  const scale = 0.75;

  // Camera orbit (constant height and distance)
  const cameraAngle = newTime * CAMERA_ORBIT_SPEED;
  const cameraHeight = CAMERA_HEIGHT_BASE;
  const cameraDistance = CAMERA_DISTANCE_BASE;

  // Light orbit (slightly faster than camera for dynamic shadows)
  const lightAngle = newTime * LIGHT_ORBIT_SPEED;

  // Color cycling
  const hueOffset = (newTime * HUE_CYCLE_SPEED) % 360;

  return {
    time: newTime,
    deltaTime,
    morphProgress,
    currentShapeIdx,
    nextShapeIdx,
    isMorphing,
    morphStartTime,
    shapeName,
    rotation: [rotationX, rotationY, rotationZ],
    scale,
    cameraAngle,
    cameraHeight,
    cameraDistance,
    lightAngle,
    hueOffset,
    pulsePhase,
    paused: state.paused,
    sequenceIndex: currentShapeIdx,
  };
}

/**
 * Get camera from scene state
 */
export function getCamera(state: SceneState): Camera {
  const x = Math.cos(state.cameraAngle) * state.cameraDistance;
  const z = Math.sin(state.cameraAngle) * state.cameraDistance;

  return {
    position: [x, state.cameraHeight, z],
    target: [0, 0, 0],
    up: [0, 1, 0],
    fov: 60,
  };
}

/**
 * Get light direction from scene state
 */
export function getLightDirection(state: SceneState): Vec3 {
  // Light orbits around the scene
  const x = Math.cos(state.lightAngle);
  const z = Math.sin(state.lightAngle);
  const y = 0.7; // Slightly from above

  return normalize([x, y, z]);
}

/**
 * Toggle pause state
 */
export function togglePause(state: SceneState): SceneState {
  return { ...state, paused: !state.paused };
}

/**
 * Trigger a morph to the next shape
 * @param direction - 1 for next, -1 for previous
 */
export function triggerMorphDirection(state: SceneState, direction: 1 | -1): SceneState {
  // Don't interrupt an ongoing morph
  if (state.isMorphing) return state;

  const targetIdx = (state.currentShapeIdx + direction + NUM_SHAPES) % NUM_SHAPES;
  return triggerMorphTo(state, targetIdx);
}

/**
 * Trigger a morph to a specific shape
 * @param targetIdx - Index of the target shape (0-4)
 */
export function triggerMorphTo(state: SceneState, targetIdx: number): SceneState {
  // Clamp to valid range
  const validTarget = Math.max(0, Math.min(NUM_SHAPES - 1, targetIdx));

  // Don't morph to the same shape
  if (validTarget === state.currentShapeIdx) return state;

  // Don't interrupt an ongoing morph
  if (state.isMorphing) return state;

  return {
    ...state,
    nextShapeIdx: validTarget,
    isMorphing: true,
    morphStartTime: state.time,
    morphProgress: 0,
  };
}

/**
 * Reset to initial state
 */
export function reset(): SceneState {
  return createInitialState();
}
