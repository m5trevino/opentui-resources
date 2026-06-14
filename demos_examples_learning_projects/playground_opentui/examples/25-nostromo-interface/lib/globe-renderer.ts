/**
 * Globe Renderer - 3D Wireframe Projection Engine
 *
 * Provides true 3D perspective projection for rendering wireframe globes
 * with the iconic Alien (1979) computer interface aesthetic.
 *
 * Pipeline: Spherical (lat/lon) -> Cartesian 3D -> Rotate -> Project 2D -> Draw
 */

import { type Vec3, type Vec2, rotateY, rotateX } from "./sdf";

// ============================================================================
// Types
// ============================================================================

export interface Camera {
  distance: number;    // Distance from globe center
  fov: number;         // Field of view in degrees
  tiltX: number;       // Downward tilt in radians
}

export interface Viewport {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  scale: number;       // Pixels per unit
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// ============================================================================
// Coordinate Conversions
// ============================================================================

/**
 * Convert spherical coordinates (lat/lon in degrees) to 3D cartesian
 * Y is up, Z is forward (towards camera at positive Z)
 */
export function sphericalToCartesian(
  lat: number,
  lon: number,
  radius: number
): Vec3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  // Standard spherical to cartesian:
  // X = r * cos(lat) * sin(lon)
  // Y = r * sin(lat)
  // Z = r * cos(lat) * cos(lon)
  return [
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad),
  ];
}

/**
 * Apply globe rotation (Y-axis spin + optional X tilt)
 */
export function rotateGlobe(point: Vec3, yRotation: number, xTilt: number = 0): Vec3 {
  let result = rotateY(point, yRotation);
  if (xTilt !== 0) {
    result = rotateX(result, xTilt);
  }
  return result;
}

// ============================================================================
// Projection
// ============================================================================

/**
 * Perspective projection from 3D to 2D screen coordinates
 * Returns null if point is behind camera
 */
export function projectToScreen(
  point: Vec3,
  camera: Camera,
  viewport: Viewport
): Vec2 | null {
  // Camera is positioned at (0, 0, camera.distance) looking at origin
  const z = point[2] + camera.distance;

  // Point behind or at camera
  if (z <= 0.1) return null;

  // Perspective division
  const fovRad = (camera.fov * Math.PI) / 180;
  const scale = 1 / Math.tan(fovRad / 2);

  const x = (point[0] * scale) / z;
  const y = (point[1] * scale) / z;

  // Map to screen coordinates
  return [
    viewport.centerX + x * viewport.scale,
    viewport.centerY - y * viewport.scale, // Y is inverted in screen space
  ];
}

// ============================================================================
// Visibility Culling
// ============================================================================

/**
 * Check if a point on the sphere surface is visible (facing camera)
 * Uses dot product with view direction
 *
 * @param point - Point on sphere surface (also its normal when normalized)
 * @param tolerance - Values > 0 show slightly beyond horizon (0.2 typical)
 */
export function isVisible(point: Vec3, tolerance: number = 0.2): boolean {
  // View direction is -Z (looking from +Z towards origin)
  // Normal at point on unit sphere IS the point (normalized)
  const len = Math.sqrt(point[0] ** 2 + point[1] ** 2 + point[2] ** 2);
  if (len === 0) return false;

  const normalZ = point[2] / len;

  // Visible if normal points towards camera (positive Z component)
  // With tolerance, we show slightly past the horizon
  return normalZ > -tolerance;
}

// ============================================================================
// Line Generation
// ============================================================================

/**
 * Generate vertices for a latitude circle (parallel)
 */
export function generateLatitudeCircle(
  lat: number,
  radius: number,
  segments: number = 72
): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const lon = (i / segments) * 360 - 180;
    points.push(sphericalToCartesian(lat, lon, radius));
  }
  return points;
}

/**
 * Generate vertices for a longitude meridian
 */
export function generateLongitudeMeridian(
  lon: number,
  radius: number,
  segments: number = 36
): Vec3[] {
  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const lat = (i / segments) * 180 - 90;
    points.push(sphericalToCartesian(lat, lon, radius));
  }
  return points;
}

// ============================================================================
// Pixel Buffer Drawing
// ============================================================================

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Bresenham's line algorithm for drawing lines to pixel buffer
 */
export function drawLine(
  buffer: RGB[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: RGB,
  width: number,
  height: number
): void {
  // Round to integers
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    // Set pixel if in bounds
    if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
      buffer[y0][x0] = color;
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
}

/**
 * Draw a point (single pixel) to buffer
 */
export function drawPoint(
  buffer: RGB[][],
  x: number,
  y: number,
  color: RGB,
  width: number,
  height: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px >= 0 && px < width && py >= 0 && py < height) {
    buffer[py][px] = color;
  }
}

/**
 * Draw a larger point (3x3) for emphasis
 */
export function drawLargePoint(
  buffer: RGB[][],
  x: number,
  y: number,
  color: RGB,
  width: number,
  height: number
): void {
  const px = Math.round(x);
  const py = Math.round(y);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = px + dx;
      const ny = py + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        buffer[ny][nx] = color;
      }
    }
  }
}

// ============================================================================
// Wireframe Rendering Helpers
// ============================================================================

/**
 * Project and draw a line segment between two 3D points
 * Handles visibility culling and clipping
 */
export function drawProjectedLine(
  buffer: RGB[][],
  p1: Vec3,
  p2: Vec3,
  color: RGB,
  camera: Camera,
  viewport: Viewport,
  bufferWidth: number,
  bufferHeight: number,
  checkVisibility: boolean = true
): void {
  // Check visibility of both points
  if (checkVisibility) {
    const vis1 = isVisible(p1);
    const vis2 = isVisible(p2);

    // Skip if both points are hidden
    if (!vis1 && !vis2) return;
  }

  // Project both points
  const screen1 = projectToScreen(p1, camera, viewport);
  const screen2 = projectToScreen(p2, camera, viewport);

  // Skip if either point is behind camera
  if (!screen1 || !screen2) return;

  // Draw the line
  drawLine(
    buffer,
    screen1[0],
    screen1[1],
    screen2[0],
    screen2[1],
    color,
    bufferWidth,
    bufferHeight
  );
}

/**
 * Project and draw a polyline (connected points)
 */
export function drawProjectedPolyline(
  buffer: RGB[][],
  points: Vec3[],
  color: RGB,
  camera: Camera,
  viewport: Viewport,
  bufferWidth: number,
  bufferHeight: number,
  closed: boolean = false,
  checkVisibility: boolean = true
): void {
  if (points.length < 2) return;

  for (let i = 0; i < points.length - 1; i++) {
    drawProjectedLine(
      buffer,
      points[i],
      points[i + 1],
      color,
      camera,
      viewport,
      bufferWidth,
      bufferHeight,
      checkVisibility
    );
  }

  // Close the loop if requested
  if (closed && points.length > 2) {
    drawProjectedLine(
      buffer,
      points[points.length - 1],
      points[0],
      color,
      camera,
      viewport,
      bufferWidth,
      bufferHeight,
      checkVisibility
    );
  }
}

/**
 * Draw a latitude circle with visibility culling
 */
export function drawLatitudeCircle(
  buffer: RGB[][],
  lat: number,
  radius: number,
  rotation: number,
  tilt: number,
  color: RGB,
  camera: Camera,
  viewport: Viewport,
  bufferWidth: number,
  bufferHeight: number,
  segments: number = 72
): void {
  const points = generateLatitudeCircle(lat, radius, segments);

  // Apply rotation to all points
  const rotatedPoints = points.map((p) => rotateGlobe(p, rotation, tilt));

  // Draw as connected segments with visibility check
  for (let i = 0; i < rotatedPoints.length - 1; i++) {
    const p1 = rotatedPoints[i];
    const p2 = rotatedPoints[i + 1];

    // Check visibility of segment midpoint for smoother culling
    const mid: Vec3 = [
      (p1[0] + p2[0]) / 2,
      (p1[1] + p2[1]) / 2,
      (p1[2] + p2[2]) / 2,
    ];

    if (isVisible(mid, 0.1)) {
      drawProjectedLine(
        buffer,
        p1,
        p2,
        color,
        camera,
        viewport,
        bufferWidth,
        bufferHeight,
        false // Already checked visibility
      );
    }
  }
}

/**
 * Draw a longitude meridian with visibility culling
 */
export function drawLongitudeMeridian(
  buffer: RGB[][],
  lon: number,
  radius: number,
  rotation: number,
  tilt: number,
  color: RGB,
  camera: Camera,
  viewport: Viewport,
  bufferWidth: number,
  bufferHeight: number,
  segments: number = 36
): void {
  const points = generateLongitudeMeridian(lon, radius, segments);

  // Apply rotation to all points
  const rotatedPoints = points.map((p) => rotateGlobe(p, rotation, tilt));

  // Draw as connected segments with visibility check
  for (let i = 0; i < rotatedPoints.length - 1; i++) {
    const p1 = rotatedPoints[i];
    const p2 = rotatedPoints[i + 1];

    // Check visibility of segment midpoint
    const mid: Vec3 = [
      (p1[0] + p2[0]) / 2,
      (p1[1] + p2[1]) / 2,
      (p1[2] + p2[2]) / 2,
    ];

    if (isVisible(mid, 0.1)) {
      drawProjectedLine(
        buffer,
        p1,
        p2,
        color,
        camera,
        viewport,
        bufferWidth,
        bufferHeight,
        false
      );
    }
  }
}

/**
 * Draw the visible edge (silhouette) of the globe
 * This is the circle where the sphere meets the view plane
 */
export function drawGlobeOutline(
  buffer: RGB[][],
  radius: number,
  color: RGB,
  camera: Camera,
  viewport: Viewport,
  bufferWidth: number,
  bufferHeight: number,
  segments: number = 72
): void {
  // The outline is a circle in screen space
  // Its size depends on camera distance and FOV
  const fovRad = (camera.fov * Math.PI) / 180;
  const scale = 1 / Math.tan(fovRad / 2);
  const screenRadius = (radius * scale * viewport.scale) / camera.distance;

  // Draw circle using parametric form
  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * Math.PI * 2;
    const angle2 = ((i + 1) / segments) * Math.PI * 2;

    const x1 = viewport.centerX + Math.cos(angle1) * screenRadius;
    const y1 = viewport.centerY + Math.sin(angle1) * screenRadius;
    const x2 = viewport.centerX + Math.cos(angle2) * screenRadius;
    const y2 = viewport.centerY + Math.sin(angle2) * screenRadius;

    drawLine(buffer, x1, y1, x2, y2, color, bufferWidth, bufferHeight);
  }
}
