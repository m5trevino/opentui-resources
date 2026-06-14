/**
 * Deorbital Descent Panel
 *
 * A 3D wireframe globe visualization matching the iconic Alien (1979)
 * computer interface aesthetic. Features:
 *
 * - True 3D perspective projection with hemisphere culling
 * - Wireframe latitude/longitude grid
 * - Continent outlines (simplified polygons)
 * - Orbital trajectory with animated ship blip
 * - Split layout: globe viewport (60%) + telemetry sidebar (40%)
 * - Detailed telemetry readouts with animated countdown
 */

import {
  BoxRenderable,
  FrameBufferRenderable,
  TextRenderable,
  type CliRenderer,
  RGBA,
  t,
  bold,
  fg,
} from "@opentui/core";
import { nostromoTheme as theme } from "../theme";
import { type Vec3 } from "../lib/sdf";
import {
  type Camera,
  type Viewport,
  type RGB,
  sphericalToCartesian,
  rotateGlobe,
  projectToScreen,
  isVisible,
  hexToRgb,
  drawLine,
  drawPoint,
  drawLargePoint,
  drawGlobeOutline,
} from "../lib/globe-renderer";
import { ALL_CONTINENTS, type Continent } from "../lib/continent-data";

// Globe viewport dimensions
const GLOBE_WIDTH = 45;
const GLOBE_HEIGHT = 22;
const GLOBE_RENDER_HEIGHT = GLOBE_HEIGHT * 2; // 2x vertical resolution

// Color palette
const COLORS = {
  gridMuted: theme.colors.accent8,     // Muted cyan for lat/long grid
  gridBright: theme.colors.accent2,    // Bright cyan for equator/outline
  continent: "#00ff99",                // Green for landmass
  contour: theme.colors.accent4,       // Orange-red for contours
  trajectory: theme.colors.accent3,    // Yellow for orbital path
  shipBlip: theme.colors.accent6,      // Bright green for ship position
  crosshair: theme.colors.accent5,     // Blue for corner markers
};

// Camera configuration
const CAMERA: Camera = {
  distance: 4.0,
  fov: 60,
  tiltX: 0.15, // Slight downward tilt
};

export function createDeorbitalDescentPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // ============================================
  // MAIN CONTAINER
  // ============================================

  const container = new BoxRenderable(renderer, {
    id: "deorbital-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    overflow: "hidden",
  });

  // ============================================
  // HEADER BAR
  // ============================================

  const headerBar = new BoxRenderable(renderer, {
    id: "deorbital-header",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const headerTitle = new TextRenderable(renderer, {
    id: "deorbital-title",
    content: t`${bold(fg(theme.colors.fg)("DEORBITAL DESCENT"))}`,
  });

  const headerStatus = new TextRenderable(renderer, {
    id: "deorbital-status",
    content: "COMMENCE FINAL",
    fg: theme.colors.accent3, // Yellow
  });

  const headerSystem = new TextRenderable(renderer, {
    id: "deorbital-system",
    content: "SYSTEM :BL: 76.75",
    fg: theme.colors.fgMuted,
  });

  headerBar.add(headerTitle);
  headerBar.add(headerStatus);
  headerBar.add(headerSystem);

  // ============================================
  // MAIN CONTENT (SPLIT LAYOUT)
  // ============================================

  const mainContent = new BoxRenderable(renderer, {
    id: "deorbital-content",
    flexDirection: "row",
    flexGrow: 1,
    width: "100%",
    overflow: "hidden",
  });

  // ============================================
  // GLOBE VIEWPORT (LEFT SIDE)
  // ============================================

  const globeContainer = new BoxRenderable(renderer, {
    id: "globe-container",
    flexDirection: "column",
    flexGrow: 3,
    overflow: "hidden",
  });

  const globeFb = new FrameBufferRenderable(renderer, {
    id: "globe-framebuffer",
    width: GLOBE_WIDTH,
    height: GLOBE_HEIGHT,
  });

  globeContainer.add(globeFb);

  // ============================================
  // TELEMETRY SIDEBAR (RIGHT SIDE)
  // ============================================

  const telemetrySidebar = new BoxRenderable(renderer, {
    id: "telemetry-sidebar",
    flexDirection: "column",
    flexGrow: 2,
    paddingLeft: 1,
    paddingRight: 1,
    gap: 0,
    borderColor: theme.colors.border,
    border: ["left"],
    overflow: "hidden",
  });

  // TIME FROM #7
  const timeLabel = new TextRenderable(renderer, {
    id: "time-label",
    content: "TIME FROM #7",
    fg: theme.colors.fgMuted,
  });

  const timeValue = new TextRenderable(renderer, {
    id: "time-value",
    content: " 19:38:23:34",
    fg: theme.colors.fg,
  });

  // PRESENT P.O.R.
  const porLabel = new TextRenderable(renderer, {
    id: "por-label",
    content: "PRESENT P.O.R.",
    fg: theme.colors.fgMuted,
  });

  const porValue = new TextRenderable(renderer, {
    id: "por-value",
    content: " NOSTROMO /S 5",
    fg: theme.colors.fg,
  });

  // HEADING
  const headingLabel = new TextRenderable(renderer, {
    id: "heading-label",
    content: "HEADING",
    fg: theme.colors.fgMuted,
  });

  const headingValue = new TextRenderable(renderer, {
    id: "heading-value",
    content: " N .36  E .18",
    fg: theme.colors.fg,
  });

  // GROUND SPEED
  const speedLabel = new TextRenderable(renderer, {
    id: "speed-label",
    content: "GROUND SPEED",
    fg: theme.colors.fgMuted,
  });

  const speedValue = new TextRenderable(renderer, {
    id: "speed-value",
    content: " 78.26 KM/S",
    fg: theme.colors.fg,
  });

  // CONDITION CODE
  const condLabel = new TextRenderable(renderer, {
    id: "cond-label",
    content: "CONDITION CODE",
    fg: theme.colors.fgMuted,
  });

  const condValue = new TextRenderable(renderer, {
    id: "cond-value",
    content: " 16 S=C75C PAST=8",
    fg: theme.colors.fg,
  });

  // SYSTEM #
  const sysLabel = new TextRenderable(renderer, {
    id: "sys-label",
    content: "SYSTEM #",
    fg: theme.colors.fgMuted,
  });

  const sysValue = new TextRenderable(renderer, {
    id: "sys-value",
    content: " 4",
    fg: theme.colors.fg,
  });

  // AUTODECOUNT
  const countLabel = new TextRenderable(renderer, {
    id: "count-label",
    content: "AUTODECOUNT",
    fg: theme.colors.fgMuted,
  });

  const countValue = new TextRenderable(renderer, {
    id: "count-value",
    content: " 3656.928",
    fg: theme.colors.accent3, // Yellow for emphasis
  });

  // Add telemetry items
  telemetrySidebar.add(timeLabel);
  telemetrySidebar.add(timeValue);
  telemetrySidebar.add(porLabel);
  telemetrySidebar.add(porValue);
  telemetrySidebar.add(headingLabel);
  telemetrySidebar.add(headingValue);
  telemetrySidebar.add(speedLabel);
  telemetrySidebar.add(speedValue);
  telemetrySidebar.add(condLabel);
  telemetrySidebar.add(condValue);
  telemetrySidebar.add(sysLabel);
  telemetrySidebar.add(sysValue);
  telemetrySidebar.add(countLabel);
  telemetrySidebar.add(countValue);

  // Add both to main content
  mainContent.add(globeContainer);
  mainContent.add(telemetrySidebar);

  // ============================================
  // FOOTER BAR
  // ============================================

  const footerBar = new BoxRenderable(renderer, {
    id: "deorbital-footer",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const destText = new TextRenderable(renderer, {
    id: "dest-text",
    content: "DEST: LV-426",
    fg: theme.colors.fgMuted,
  });

  const orbitText = new TextRenderable(renderer, {
    id: "orbit-text",
    content: "ORBIT: STABLE",
    fg: theme.colors.success,
  });

  const etaText = new TextRenderable(renderer, {
    id: "eta-text",
    content: "ETA: IMMINENT",
    fg: theme.colors.warning,
  });

  footerBar.add(destText);
  footerBar.add(orbitText);
  footerBar.add(etaText);

  // ============================================
  // BUILD COMPONENT TREE
  // ============================================

  container.add(headerBar);
  container.add(mainContent);
  container.add(footerBar);

  // ============================================
  // PIXEL BUFFER FOR GLOBE RENDERING
  // ============================================

  const pixelBuffer: RGB[][] = [];
  const bgColor = hexToRgb(theme.colors.bg);

  for (let y = 0; y < GLOBE_RENDER_HEIGHT; y++) {
    pixelBuffer[y] = [];
    for (let x = 0; x < GLOBE_WIDTH; x++) {
      pixelBuffer[y][x] = { ...bgColor };
    }
  }

  // Viewport setup
  const viewport: Viewport = {
    width: GLOBE_WIDTH,
    height: GLOBE_RENDER_HEIGHT,
    centerX: GLOBE_WIDTH * 0.45, // Slightly left of center
    centerY: GLOBE_RENDER_HEIGHT * 0.5,
    scale: GLOBE_RENDER_HEIGHT * 0.35,
  };

  // ============================================
  // DRAWING FUNCTIONS
  // ============================================

  function clear() {
    for (let y = 0; y < GLOBE_RENDER_HEIGHT; y++) {
      for (let x = 0; x < GLOBE_WIDTH; x++) {
        pixelBuffer[y][x] = { ...bgColor };
      }
    }
  }

  function flushToFramebuffer() {
    for (let cellY = 0; cellY < GLOBE_HEIGHT; cellY++) {
      for (let x = 0; x < GLOBE_WIDTH; x++) {
        const topPixel = pixelBuffer[cellY * 2][x];
        const botPixel = pixelBuffer[cellY * 2 + 1][x];

        const fgRgba = RGBA.fromInts(topPixel.r, topPixel.g, topPixel.b, 255);
        const bgRgba = RGBA.fromInts(botPixel.r, botPixel.g, botPixel.b, 255);

        globeFb.frameBuffer.setCell(x, cellY, "▀", fgRgba, bgRgba);
      }
    }
  }

  // Draw corner crosshairs
  function drawCrosshairs() {
    const color = hexToRgb(COLORS.crosshair);
    const margin = 3;
    const size = 5;

    // Top-left
    drawLine(pixelBuffer, margin, margin * 2, margin + size, margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
    drawLine(pixelBuffer, margin, margin * 2, margin, margin * 2 + size, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);

    // Top-right
    drawLine(pixelBuffer, GLOBE_WIDTH - margin - size, margin * 2, GLOBE_WIDTH - margin, margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
    drawLine(pixelBuffer, GLOBE_WIDTH - margin, margin * 2, GLOBE_WIDTH - margin, margin * 2 + size, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);

    // Bottom-left
    drawLine(pixelBuffer, margin, GLOBE_RENDER_HEIGHT - margin * 2, margin + size, GLOBE_RENDER_HEIGHT - margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
    drawLine(pixelBuffer, margin, GLOBE_RENDER_HEIGHT - margin * 2 - size, margin, GLOBE_RENDER_HEIGHT - margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);

    // Bottom-right
    drawLine(pixelBuffer, GLOBE_WIDTH - margin - size, GLOBE_RENDER_HEIGHT - margin * 2, GLOBE_WIDTH - margin, GLOBE_RENDER_HEIGHT - margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
    drawLine(pixelBuffer, GLOBE_WIDTH - margin, GLOBE_RENDER_HEIGHT - margin * 2 - size, GLOBE_WIDTH - margin, GLOBE_RENDER_HEIGHT - margin * 2, color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
  }

  // Draw latitude/longitude grid
  function drawGrid(rotation: number, tilt: number) {
    const mutedColor = hexToRgb(COLORS.gridMuted);
    const brightColor = hexToRgb(COLORS.gridBright);
    const radius = 1.0;

    // Latitude circles (parallels) - every 30 degrees
    for (let lat = -60; lat <= 60; lat += 30) {
      const color = lat === 0 ? brightColor : mutedColor; // Equator is bright

      // Generate points for this latitude
      for (let lon = 0; lon < 360; lon += 5) {
        const p1 = sphericalToCartesian(lat, lon, radius);
        const p2 = sphericalToCartesian(lat, lon + 5, radius);

        const rp1 = rotateGlobe(p1, rotation, tilt);
        const rp2 = rotateGlobe(p2, rotation, tilt);

        // Check visibility of midpoint
        const mid: Vec3 = [
          (rp1[0] + rp2[0]) / 2,
          (rp1[1] + rp2[1]) / 2,
          (rp1[2] + rp2[2]) / 2,
        ];

        if (isVisible(mid, 0.1)) {
          const s1 = projectToScreen(rp1, CAMERA, viewport);
          const s2 = projectToScreen(rp2, CAMERA, viewport);

          if (s1 && s2) {
            drawLine(pixelBuffer, s1[0], s1[1], s2[0], s2[1], color, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
          }
        }
      }
    }

    // Longitude meridians - every 30 degrees
    for (let lon = 0; lon < 360; lon += 30) {
      for (let lat = -90; lat < 90; lat += 5) {
        const p1 = sphericalToCartesian(lat, lon, radius);
        const p2 = sphericalToCartesian(lat + 5, lon, radius);

        const rp1 = rotateGlobe(p1, rotation, tilt);
        const rp2 = rotateGlobe(p2, rotation, tilt);

        // Check visibility
        const mid: Vec3 = [
          (rp1[0] + rp2[0]) / 2,
          (rp1[1] + rp2[1]) / 2,
          (rp1[2] + rp2[2]) / 2,
        ];

        if (isVisible(mid, 0.1)) {
          const s1 = projectToScreen(rp1, CAMERA, viewport);
          const s2 = projectToScreen(rp2, CAMERA, viewport);

          if (s1 && s2) {
            drawLine(pixelBuffer, s1[0], s1[1], s2[0], s2[1], mutedColor, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
          }
        }
      }
    }
  }

  // Draw continent outlines
  function drawContinents(rotation: number, tilt: number) {
    const continentColor = hexToRgb(COLORS.continent);
    const radius = 1.0;

    for (const continent of ALL_CONTINENTS) {
      const points = continent.points;

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        const c1 = sphericalToCartesian(p1.lat, p1.lon, radius);
        const c2 = sphericalToCartesian(p2.lat, p2.lon, radius);

        const rc1 = rotateGlobe(c1, rotation, tilt);
        const rc2 = rotateGlobe(c2, rotation, tilt);

        // Check visibility of midpoint
        const mid: Vec3 = [
          (rc1[0] + rc2[0]) / 2,
          (rc1[1] + rc2[1]) / 2,
          (rc1[2] + rc2[2]) / 2,
        ];

        if (isVisible(mid, 0.05)) {
          const s1 = projectToScreen(rc1, CAMERA, viewport);
          const s2 = projectToScreen(rc2, CAMERA, viewport);

          if (s1 && s2) {
            drawLine(pixelBuffer, s1[0], s1[1], s2[0], s2[1], continentColor, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
          }
        }
      }
    }
  }

  // Draw contour lines (procedural wavy shapes)
  function drawContours(rotation: number, tilt: number) {
    const contourColor = hexToRgb(COLORS.contour);
    // Dim the color
    const dimmedContour: RGB = {
      r: Math.floor(contourColor.r * 0.6),
      g: Math.floor(contourColor.g * 0.6),
      b: Math.floor(contourColor.b * 0.6),
    };

    const radius = 1.0;

    // Draw a few contour rings at different latitudes
    const contourLats = [-30, 15, 45];

    for (const baseLat of contourLats) {
      for (let lon = 0; lon < 360; lon += 8) {
        // Add wavy perturbation
        const wave = Math.sin(lon * 0.1) * 5 + Math.sin(lon * 0.17) * 3;
        const lat = baseLat + wave;

        const p1 = sphericalToCartesian(lat, lon, radius * 1.01);
        const p2 = sphericalToCartesian(lat + Math.sin((lon + 4) * 0.1) * 5, lon + 8, radius * 1.01);

        const rp1 = rotateGlobe(p1, rotation, tilt);
        const rp2 = rotateGlobe(p2, rotation, tilt);

        if (isVisible(rp1, 0.1) && isVisible(rp2, 0.1)) {
          const s1 = projectToScreen(rp1, CAMERA, viewport);
          const s2 = projectToScreen(rp2, CAMERA, viewport);

          if (s1 && s2) {
            drawLine(pixelBuffer, s1[0], s1[1], s2[0], s2[1], dimmedContour, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
          }
        }
      }
    }
  }

  // Draw globe outline (silhouette circle)
  function drawOutline() {
    drawGlobeOutline(
      pixelBuffer,
      1.0,
      hexToRgb(COLORS.gridBright),
      CAMERA,
      viewport,
      GLOBE_WIDTH,
      GLOBE_RENDER_HEIGHT,
      72
    );
  }

  // Draw orbital trajectory (ellipse in 3D space)
  function drawOrbit(orbitAngle: number) {
    const trajectoryColor = hexToRgb(COLORS.trajectory);

    // Orbital plane tilted relative to planet
    const orbitRadius = 1.8;
    const orbitTilt = 0.3;

    for (let angle = 0; angle < 360; angle += 4) {
      const rad1 = (angle * Math.PI) / 180;
      const rad2 = ((angle + 4) * Math.PI) / 180;

      // Elliptical orbit
      const x1 = Math.cos(rad1) * orbitRadius;
      const y1 = Math.sin(rad1) * orbitRadius * 0.4;
      const z1 = Math.sin(rad1) * orbitRadius * 0.6;

      const x2 = Math.cos(rad2) * orbitRadius;
      const y2 = Math.sin(rad2) * orbitRadius * 0.4;
      const z2 = Math.sin(rad2) * orbitRadius * 0.6;

      // Apply orbit tilt
      const p1: Vec3 = [x1, y1 * Math.cos(orbitTilt) - z1 * Math.sin(orbitTilt), y1 * Math.sin(orbitTilt) + z1 * Math.cos(orbitTilt)];
      const p2: Vec3 = [x2, y2 * Math.cos(orbitTilt) - z2 * Math.sin(orbitTilt), y2 * Math.sin(orbitTilt) + z2 * Math.cos(orbitTilt)];

      const s1 = projectToScreen(p1, CAMERA, viewport);
      const s2 = projectToScreen(p2, CAMERA, viewport);

      if (s1 && s2) {
        drawLine(pixelBuffer, s1[0], s1[1], s2[0], s2[1], trajectoryColor, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
      }
    }
  }

  // Draw ship blip on orbit
  function drawShipBlip(orbitAngle: number, blink: boolean) {
    if (!blink) return;

    const shipColor = hexToRgb(COLORS.shipBlip);
    const orbitRadius = 1.8;
    const orbitTilt = 0.3;

    const rad = (orbitAngle * Math.PI) / 180;

    const x = Math.cos(rad) * orbitRadius;
    const y = Math.sin(rad) * orbitRadius * 0.4;
    const z = Math.sin(rad) * orbitRadius * 0.6;

    const p: Vec3 = [
      x,
      y * Math.cos(orbitTilt) - z * Math.sin(orbitTilt),
      y * Math.sin(orbitTilt) + z * Math.cos(orbitTilt),
    ];

    const screen = projectToScreen(p, CAMERA, viewport);

    if (screen) {
      drawLargePoint(pixelBuffer, screen[0], screen[1], shipColor, GLOBE_WIDTH, GLOBE_RENDER_HEIGHT);
    }
  }

  // ============================================
  // ANIMATION STATE
  // ============================================

  let autoDecount = 3656.928;

  // ============================================
  // UPDATE FUNCTION
  // ============================================

  function update(time: number) {
    clear();

    // Animation parameters
    const globeRotation = time * 0.1; // Slow rotation (radians)
    const orbitAngle = (time * 12) % 360; // Ship position on orbit
    const blink = Math.floor(time * 4) % 2 === 0;

    // Draw layers
    drawCrosshairs();
    drawOrbit(orbitAngle);
    drawOutline();
    drawGrid(globeRotation, CAMERA.tiltX);
    drawContours(globeRotation, CAMERA.tiltX);
    drawContinents(globeRotation, CAMERA.tiltX);
    drawShipBlip(orbitAngle, blink);

    // Flush to framebuffer
    flushToFramebuffer();

    // Update telemetry values
    const hours = Math.floor(time / 3600) % 24;
    const mins = Math.floor(time / 60) % 60;
    const secs = Math.floor(time) % 60;
    const cents = Math.floor((time * 100) % 100);
    timeValue.content = ` ${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${cents.toString().padStart(2, "0")}`;

    // Heading wobble
    const headingN = (0.36 + Math.sin(time * 0.5) * 0.02).toFixed(2);
    const headingE = (0.18 + Math.cos(time * 0.7) * 0.01).toFixed(2);
    headingValue.content = ` N ${headingN}  E ${headingE}`;

    // Ground speed variation
    const speed = (78.26 + Math.sin(time * 0.3) * 2.5).toFixed(2);
    speedValue.content = ` ${speed} KM/S`;

    // Autodecount
    autoDecount -= 0.033; // Roughly 1 per second at 30 FPS
    if (autoDecount < 0) autoDecount = 3656.928;
    countValue.content = ` ${autoDecount.toFixed(3)}`;

    // System number cycles
    const sysNum = (Math.floor(time / 5) % 8) + 1;
    sysValue.content = ` ${sysNum}`;

    // Header system info flicker
    const sysBL = (76.75 + Math.sin(time * 2) * 0.5).toFixed(2);
    headerSystem.content = `SYSTEM :BL: ${sysBL}`;
  }

  return { container, update };
}
