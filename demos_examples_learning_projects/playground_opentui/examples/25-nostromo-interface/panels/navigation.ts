/**
 * Navigation / Star Map Panel
 *
 * Features matching Alien (1979) reference image:
 * - Cyan wireframe grid (lat/long lines)
 * - Orange-red topographical contour lines
 * - Yellow orbital trajectory
 * - Blue corner crosshairs
 * - Bright green ship blip
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

const WIDTH = 50;
const HEIGHT = 18;
const RENDER_HEIGHT = HEIGHT * 2; // Internal 2x resolution for half-block rendering

// RGB color type for pixel buffer
interface RGB {
  r: number;
  g: number;
  b: number;
}

// Color palette matching reference image
const COLORS = {
  grid: theme.colors.accent2, // Cyan for lat/long grid
  gridMuted: theme.colors.accent8, // Muted cyan for secondary grid
  contour: theme.colors.accent4, // Orange-red for elevation contours
  trajectory: theme.colors.accent3, // Yellow for orbital path
  shipBlip: theme.colors.accent6, // Bright green for ship position
  crosshair: theme.colors.accent5, // Blue for corner markers
  outline: theme.colors.accent2, // Cyan for planet outline
};

export function createNavigationPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "nav-panel",
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
    id: "nav-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "nav-title",
    content: t`${bold(fg(theme.colors.fg)("DEORBITAL DESCENT"))}`,
  });

  const status = new TextRenderable(renderer, {
    id: "nav-status",
    content: "ACTIVE",
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(status);

  // Framebuffer for the star map
  const fbContainer = new BoxRenderable(renderer, {
    id: "nav-fb-container",
    width: WIDTH,
    height: HEIGHT,
  });

  const framebuffer = new FrameBufferRenderable(renderer, {
    id: "nav-framebuffer",
    width: WIDTH,
    height: HEIGHT,
  });

  fbContainer.add(framebuffer);

  // Info bar at bottom
  const infoBar = new BoxRenderable(renderer, {
    id: "nav-info-bar",
    flexDirection: "column",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const destText = new TextRenderable(renderer, {
    id: "nav-dest",
    content: "DEST: EARTH  DIST: 0.42 LY",
    fg: theme.colors.fgMuted,
  });

  const etaText = new TextRenderable(renderer, {
    id: "nav-eta",
    content: "ETA: 10M 14D 06H 22M",
    fg: theme.colors.accent3, // Yellow like trajectory
  });

  infoBar.add(destText);
  infoBar.add(etaText);

  container.add(titleBar);
  container.add(fbContainer);
  container.add(infoBar);

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
  function setPixelDirect(x: number, y: number, color: string) {
    if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
      const rgb = hexToRgb(color);
      pixelBuffer[Math.round(y)][Math.round(x)] = rgb;
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

  // Draw line at render resolution (2x height)
  function drawLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ) {
    const rgb = hexToRgb(color);
    // Scale Y coordinates for 2x resolution
    y0 = y0 * 2;
    y1 = y1 * 2;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      const px = Math.round(x0);
      const py = Math.round(y0);
      if (px >= 0 && px < WIDTH && py >= 0 && py < RENDER_HEIGHT) {
        pixelBuffer[py][px] = rgb;
      }
      if (
        Math.round(x0) === Math.round(x1) &&
        Math.round(y0) === Math.round(y1)
      )
        break;
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

  function drawCircle(cx: number, cy: number, r: number, color: string) {
    const rgb = hexToRgb(color);
    // Draw at 2x resolution for smoother circles
    for (let angle = 0; angle < 360; angle += 3) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(rad));
      // With half-block rendering, aspect ratio is closer to 1:1
      const y = Math.round(cy * 2 + r * Math.sin(rad));
      if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
        pixelBuffer[y][x] = rgb;
      }
    }
  }

  // Draw wireframe sphere with CYAN grid (matching reference)
  function drawWireframeSphere(
    cx: number,
    cy: number,
    radius: number,
    rotation: number
  ) {
    const scaledCy = cy * 2; // Convert to render coordinates
    // Note: With half-block rendering, use same radius for X and Y to get round circles
    const gridMutedRgb = hexToRgb(COLORS.gridMuted);
    const gridRgb = hexToRgb(COLORS.grid);

    // Draw latitude lines (parallels) - CYAN
    for (let lat = -60; lat <= 60; lat += 20) {
      const latRad = (lat * Math.PI) / 180;
      const r = radius * Math.cos(latRad);
      const yOffset = Math.sin(latRad) * radius;
      if (r > 2) {
        // Draw circle at this latitude
        for (let angle = 0; angle < 360; angle += 4) {
          const rad = (angle * Math.PI) / 180;
          const x = Math.round(cx + r * Math.cos(rad));
          const y = Math.round(scaledCy + yOffset + r * Math.sin(rad) * 0.3);
          if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
            pixelBuffer[y][x] = gridMutedRgb;
          }
        }
      }
    }

    // Draw longitude lines (meridians) - CYAN, rotating
    for (let lon = 0; lon < 180; lon += 20) {
      const lonRad = ((lon + rotation) * Math.PI) / 180;

      // Draw arc from pole to pole
      for (let lat = -90; lat <= 90; lat += 6) {
        const latRad = (lat * Math.PI) / 180;
        const x = Math.round(cx + radius * Math.cos(latRad) * Math.sin(lonRad));
        const y = Math.round(scaledCy + radius * Math.sin(latRad));

        // Only draw if visible (front hemisphere)
        if (Math.cos(lonRad) > -0.2) {
          if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
            pixelBuffer[y][x] = gridMutedRgb;
          }
        }
      }
    }

    // Bright equator line
    for (let angle = 0; angle < 360; angle += 3) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + radius * Math.cos(rad));
      const y = Math.round(scaledCy + radius * Math.sin(rad));
      if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
        pixelBuffer[y][x] = gridRgb;
      }
    }

    // Planet outline (bright cyan)
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + radius * Math.cos(rad));
      const y = Math.round(scaledCy + radius * Math.sin(rad));
      if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
        pixelBuffer[y][x] = gridRgb;
      }
    }
  }

  // Draw topographical contour lines - ORANGE/RED (like reference)
  // Toned down: sparse dashed lines, reduced amplitude, dimmed color
  function drawContourLines(
    cx: number,
    cy: number,
    radius: number,
    rotation: number
  ) {
    const scaledCy = cy * 2;
    // Dim the contour color to 70% brightness for subtlety
    const baseContourRgb = hexToRgb(COLORS.contour);
    const contourRgb: RGB = {
      r: Math.floor(baseContourRgb.r * 0.7),
      g: Math.floor(baseContourRgb.g * 0.7),
      b: Math.floor(baseContourRgb.b * 0.7),
    };

    // Reduced amplitudes for smoother, less chaotic contours
    const contourLevels = [
      { scale: 0.4, amplitude: 0.08 },   // Was: 0.15
      { scale: 0.55, amplitude: 0.10 },  // Was: 0.2
      { scale: 0.7, amplitude: 0.06 },   // Was: 0.12
    ];

    for (const { scale, amplitude } of contourLevels) {
      const baseR = radius * scale;
      // Draw wavy contour that rotates with planet
      // Increased angle step from 4 to 8 for dashed/sparser appearance
      for (let angle = 0; angle < 360; angle += 8) {
        const rad = ((angle + rotation * 0.5) * Math.PI) / 180;
        // Perturb radius with multiple sine waves for organic look
        const perturbation =
          Math.sin(angle * 3 * (Math.PI / 180)) * amplitude +
          Math.sin(angle * 5 * (Math.PI / 180)) * amplitude * 0.5;
        const r = baseR * (1 + perturbation);

        const x = Math.round(cx + r * Math.cos(rad));
        const y = Math.round(scaledCy + r * Math.sin(rad)); // Same radius for X and Y

        // Only draw visible portion (front hemisphere simulation)
        const visibility = Math.cos(rad - rotation * 0.01);
        if (visibility > -0.3) {
          if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
            pixelBuffer[y][x] = contourRgb;
          }
        }
      }
    }
  }

  // Draw orbital trajectory - YELLOW (matching reference)
  function drawOrbit(cx: number, cy: number, radiusX: number, radiusY: number) {
    const scaledCy = cy * 2;
    const trajectoryRgb = hexToRgb(COLORS.trajectory);

    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + radiusX * Math.cos(rad));
      const y = Math.round(scaledCy + radiusY * Math.sin(rad));
      // Continuous line (not dashed) like reference
      if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
        pixelBuffer[y][x] = trajectoryRgb;
      }
    }
  }

  // Draw ship position blip - BRIGHT GREEN
  function drawShipBlip(
    cx: number,
    cy: number,
    radiusX: number,
    radiusY: number,
    orbitAngle: number,
    time: number
  ) {
    const scaledCy = cy * 2;
    const shipRgb = hexToRgb(COLORS.shipBlip);

    const rad = (orbitAngle * Math.PI) / 180;
    const x = Math.round(cx + radiusX * Math.cos(rad));
    const y = Math.round(scaledCy + radiusY * Math.sin(rad));

    // Helper to set pixel safely
    const setShipPixel = (px: number, py: number) => {
      if (px >= 0 && px < WIDTH && py >= 0 && py < RENDER_HEIGHT) {
        pixelBuffer[py][px] = shipRgb;
      }
    };

    // Blinking effect
    const blink = Math.floor(time * 4) % 2 === 0;
    if (blink) {
      // Bright blip with cross shape (larger for 2x resolution)
      setShipPixel(x, y);
      setShipPixel(x + 1, y);
      setShipPixel(x - 1, y);
      setShipPixel(x, y + 1);
      setShipPixel(x, y - 1);
      setShipPixel(x, y + 2);
      setShipPixel(x, y - 2);
    } else {
      // Dimmer blip
      setShipPixel(x, y);
    }
  }

  // Draw corner crosshairs - BLUE (matching reference)
  function drawCrosshairs() {
    const color = COLORS.crosshair;

    // Top-left (coordinates in original HEIGHT space, drawLine scales them)
    drawLine(2, 1, 7, 1, color);
    drawLine(2, 1, 2, 3, color);

    // Top-right
    drawLine(WIDTH - 8, 1, WIDTH - 3, 1, color);
    drawLine(WIDTH - 3, 1, WIDTH - 3, 3, color);

    // Bottom-left
    drawLine(2, HEIGHT - 2, 7, HEIGHT - 2, color);
    drawLine(2, HEIGHT - 4, 2, HEIGHT - 2, color);

    // Bottom-right
    drawLine(WIDTH - 8, HEIGHT - 2, WIDTH - 3, HEIGHT - 2, color);
    drawLine(WIDTH - 3, HEIGHT - 4, WIDTH - 3, HEIGHT - 2, color);
  }

  function update(time: number) {
    clear();

    const planetX = WIDTH * 0.4;
    const planetY = HEIGHT * 0.5;
    const planetRadius = 8;
    const rotation = time * 15; // Slow rotation

    // Layer 1: Corner crosshairs (blue)
    drawCrosshairs();

    // Layer 2: Orbital trajectory (yellow)
    drawOrbit(planetX, planetY, 20, 14); // Adjusted for 2x vertical resolution

    // Layer 3: Planet grid (cyan)
    drawWireframeSphere(planetX, planetY, planetRadius, rotation);

    // Layer 4: Contour lines (orange-red)
    drawContourLines(planetX, planetY, planetRadius, rotation);

    // Layer 5: Ship blip (bright green, on top)
    const orbitAngle = (time * 8) % 360;
    drawShipBlip(planetX, planetY, 20, 14, orbitAngle, time);

    // Flush pixel buffer to framebuffer using half-block rendering
    flushToFramebuffer();

    // Update ETA (countdown effect)
    const days = Math.floor(314 - (time % 314));
    const hours = Math.floor((time * 60) % 24);
    const mins = Math.floor((time * 3600) % 60);
    etaText.content = `ETA: 10M ${days.toString().padStart(2, "0")}D ${hours.toString().padStart(2, "0")}H ${mins.toString().padStart(2, "0")}M`;
  }

  return { container, update };
}
