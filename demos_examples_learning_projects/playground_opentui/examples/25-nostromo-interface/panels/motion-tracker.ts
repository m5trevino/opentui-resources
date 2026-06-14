/**
 * Motion Tracker Panel
 *
 * Features:
 * - Classic sweeping radar arc
 * - Concentric range circles
 * - Distance markers
 * - Easter egg: subtle anomaly blip after random interval
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
import { nostromoEvents } from "../lib/events";

const WIDTH = 28;
const HEIGHT = 14;
const RENDER_HEIGHT = HEIGHT * 2; // Internal 2x resolution for half-block rendering

// RGB color type for pixel buffer
interface RGB {
  r: number;
  g: number;
  b: number;
}

// Distance-based zone colors (matching reference aesthetic)
const ZONE_COLORS = {
  close: "#ff4444", // Red - danger zone (inner)
  medium: "#ffaa00", // Amber - caution zone
  far: "#00cccc", // Cyan - safe zone (outer)
  edge: "#1a8a1a", // Muted green - edge
  sweep: "#33ff33", // Bright green - sweep arc
  sweepTrail: "#1a5a1a", // Dim green - sweep trail
};

export function createMotionTrackerPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "motion-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    overflow: "hidden",
  });

  // Title bar
  const titleBar = new BoxRenderable(renderer, {
    id: "motion-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "motion-title",
    content: t`${bold(fg(theme.colors.fg)("MOTION TRACKER"))}`,
  });

  const range = new TextRenderable(renderer, {
    id: "motion-range",
    content: "40M",
    fg: theme.colors.fgMuted,
  });

  titleBar.add(title);
  titleBar.add(range);

  // Framebuffer for radar display
  const fbContainer = new BoxRenderable(renderer, {
    id: "motion-fb-container",
    width: WIDTH,
    height: HEIGHT,
  });

  const framebuffer = new FrameBufferRenderable(renderer, {
    id: "motion-framebuffer",
    width: WIDTH,
    height: HEIGHT,
  });

  fbContainer.add(framebuffer);

  // Distance markers
  const distBar = new BoxRenderable(renderer, {
    id: "motion-dist-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const dist10 = new TextRenderable(renderer, {
    id: "motion-dist-10",
    content: "10M",
    fg: theme.colors.fgMuted,
  });

  const dist20 = new TextRenderable(renderer, {
    id: "motion-dist-20",
    content: "20M",
    fg: theme.colors.fgMuted,
  });

  const dist30 = new TextRenderable(renderer, {
    id: "motion-dist-30",
    content: "30M",
    fg: theme.colors.fgMuted,
  });

  const dist40 = new TextRenderable(renderer, {
    id: "motion-dist-40",
    content: "40M",
    fg: theme.colors.fgMuted,
  });

  distBar.add(dist10);
  distBar.add(dist20);
  distBar.add(dist30);
  distBar.add(dist40);

  container.add(titleBar);
  container.add(fbContainer);
  container.add(distBar);

  // Easter egg state
  let nextAnomalyTime = 30 + Math.random() * 60; // 30-90 seconds
  let anomalyActive = false;
  let anomalyFrames = 0;
  let anomalyAngle = 0;
  let anomalyDistance = 0;

  // Pixel buffer for 2x vertical resolution
  const pixelBuffer: RGB[][] = [];
  for (let y = 0; y < RENDER_HEIGHT; y++) {
    pixelBuffer[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      pixelBuffer[y][x] = { r: 10, g: 10, b: 10 }; // bg color
    }
  }

  // Helper to convert hex to RGB
  function hexToRgb(hex: string): RGB {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  const bgColor = hexToRgb(theme.colors.bg);

  // Drawing functions - write to pixel buffer at 2x resolution
  function setPixel(x: number, y: number, color: string) {
    // Scale y to work with RENDER_HEIGHT
    const scaledY = Math.round(y * 2);
    if (x >= 0 && x < WIDTH && scaledY >= 0 && scaledY < RENDER_HEIGHT) {
      const rgb = hexToRgb(color);
      pixelBuffer[scaledY][Math.round(x)] = rgb;
      // Also set adjacent pixel for better visibility
      if (scaledY + 1 < RENDER_HEIGHT) {
        pixelBuffer[scaledY + 1][Math.round(x)] = rgb;
      }
    }
  }

  // Direct pixel set at render resolution (for finer control)
  function setPixelDirect(x: number, renderY: number, rgb: RGB) {
    if (x >= 0 && x < WIDTH && renderY >= 0 && renderY < RENDER_HEIGHT) {
      pixelBuffer[Math.round(renderY)][Math.round(x)] = rgb;
    }
  }

  function clear() {
    for (let y = 0; y < RENDER_HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        pixelBuffer[y][x] = { ...bgColor };
      }
    }
  }

  // Flush pixel buffer to framebuffer using half-block characters
  function flushToFramebuffer() {
    for (let cellY = 0; cellY < HEIGHT; cellY++) {
      for (let x = 0; x < WIDTH; x++) {
        const topPixel = pixelBuffer[cellY * 2][x];
        const botPixel = pixelBuffer[cellY * 2 + 1][x];

        // Use ▀ (upper half block): fg = top, bg = bottom
        const fgRgba = RGBA.fromInts(topPixel.r, topPixel.g, topPixel.b, 255);
        const bgRgba = RGBA.fromInts(botPixel.r, botPixel.g, botPixel.b, 255);

        framebuffer.frameBuffer.setCell(x, cellY, "▀", fgRgba, bgRgba);
      }
    }
  }

  function drawCircle(cx: number, cy: number, r: number, color: string, dashed: boolean = false) {
    const scaledCy = cy * 2;
    const rgb = hexToRgb(color);
    for (let angle = 0; angle < 360; angle += 3) {
      if (dashed && angle % 12 >= 6) continue;
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(rad));
      const y = Math.round(scaledCy + r * Math.sin(rad)); // 1:1 aspect ratio with 2x resolution
      setPixelDirect(x, y, rgb);
    }
  }

  // Get zone color based on distance ratio
  function getZoneColor(distanceRatio: number): string {
    if (distanceRatio < 0.3) return ZONE_COLORS.close; // Inner - red
    if (distanceRatio < 0.6) return ZONE_COLORS.medium; // Middle - amber
    if (distanceRatio < 0.85) return ZONE_COLORS.far; // Outer - cyan
    return ZONE_COLORS.edge; // Edge - muted
  }

  function drawSweepArc(cx: number, cy: number, maxRadius: number, sweepAngle: number) {
    const scaledCy = cy * 2;
    // Draw a filled pie slice for the sweep with trail effect
    const sweepWidth = 35; // degrees

    // Pre-compute colors
    const sweepRgb = hexToRgb(ZONE_COLORS.sweep);
    const midRgb = hexToRgb(theme.colors.success);
    const trailRgb = hexToRgb(ZONE_COLORS.sweepTrail);

    for (let angle = sweepAngle - sweepWidth; angle <= sweepAngle; angle++) {
      const rad = (angle * Math.PI) / 180;
      const brightness = 1 - (sweepAngle - angle) / sweepWidth;

      // Color based on brightness (trail fades to dark)
      let sweepColorRgb: RGB;
      if (brightness > 0.8) {
        sweepColorRgb = sweepRgb; // Bright green - leading edge
      } else if (brightness > 0.5) {
        sweepColorRgb = midRgb; // Green - mid trail
      } else if (brightness > 0.3) {
        sweepColorRgb = trailRgb; // Dim green - fading trail
      } else {
        continue; // Too dim, skip
      }

      for (let r = 2; r <= maxRadius; r += 1) {
        const x = Math.round(cx + r * Math.cos(rad));
        const y = Math.round(scaledCy + r * Math.sin(rad)); // 1:1 with 2x resolution
        if (brightness > 0.6) {
          setPixelDirect(x, y, sweepColorRgb);
        } else if (brightness > 0.3 && r % 2 === 0) {
          setPixelDirect(x, y, trailRgb);
        }
      }
    }
  }

  function drawCenterDot(cx: number, cy: number) {
    const scaledCy = cy * 2;
    const rgb = hexToRgb(theme.colors.fg);
    setPixelDirect(cx, scaledCy, rgb);
    setPixelDirect(cx, scaledCy + 1, rgb);
  }

  function drawAnomaly(cx: number, cy: number, angle: number, distance: number) {
    const scaledCy = cy * 2;
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(cx + distance * Math.cos(rad));
    const y = Math.round(scaledCy + distance * Math.sin(rad));

    const warningRgb = hexToRgb(theme.colors.warning);

    // Flickering blip
    setPixelDirect(x, y, warningRgb);
    setPixelDirect(x, y + 1, warningRgb);
    if (anomalyFrames % 2 === 0) {
      setPixelDirect(x + 1, y, warningRgb);
      setPixelDirect(x - 1, y, warningRgb);
      setPixelDirect(x + 1, y + 1, warningRgb);
      setPixelDirect(x - 1, y + 1, warningRgb);
    }
  }

  function update(time: number) {
    clear();

    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    // For round circles in render space, use consistent radius that fits in panel
    const maxRadius = Math.min(WIDTH / 2 - 3, HEIGHT / 2 - 1);

    // Draw range circles with distance-based colors
    drawCircle(cx, cy, maxRadius * 0.25, getZoneColor(0.25), true); // Inner - reddish
    drawCircle(cx, cy, maxRadius * 0.5, getZoneColor(0.5), true); // Middle - amber
    drawCircle(cx, cy, maxRadius * 0.75, getZoneColor(0.75), true); // Outer - cyan
    drawCircle(cx, cy, maxRadius, theme.colors.accent5, false); // Edge - blue outline

    // Draw sweep arc with trail (2 second full rotation)
    const sweepAngle = (time * 180) % 360;
    drawSweepArc(cx, cy, maxRadius, sweepAngle);

    // Center dot
    drawCenterDot(cx, cy);

    // Easter egg: anomaly detection
    if (time > nextAnomalyTime && !anomalyActive) {
      anomalyActive = true;
      anomalyFrames = 0;
      anomalyAngle = 30 + Math.random() * 120; // Appear in upper-right quadrant
      anomalyDistance = maxRadius * (0.6 + Math.random() * 0.3);

      // Emit event for other panels to react
      nostromoEvents.emit("anomalyDetected", {
        angle: anomalyAngle,
        distance: Math.floor(anomalyDistance * 2), // Convert to meters
      });
    }

    if (anomalyActive) {
      // Check if sweep is near anomaly
      const angleDiff = Math.abs(((sweepAngle - anomalyAngle + 180) % 360) - 180);
      if (angleDiff < 45) {
        drawAnomaly(cx, cy, anomalyAngle, anomalyDistance);
        anomalyFrames++;

        // Anomaly visible for only 3-5 frames when sweep passes
        if (anomalyFrames > 4) {
          anomalyActive = false;
          nextAnomalyTime = time + 45 + Math.random() * 90; // Next anomaly in 45-135 seconds
          nostromoEvents.emit("anomalyCleared");
        }
      }
    }

    // Flush pixel buffer to framebuffer using half-block rendering
    flushToFramebuffer();
  }

  return { container, update };
}
