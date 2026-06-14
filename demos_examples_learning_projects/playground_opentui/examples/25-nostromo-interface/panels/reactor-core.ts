/**
 * Reactor Core Panel
 *
 * Features:
 * - Raymarched 3D geometry (sphere, torus, octahedron)
 * - Morphing between shapes over time
 * - Blinn-Phong shading with phosphor green/amber coloring
 * - Pulsing intensity effect
 * - CRT glow aesthetic
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
import {
  type Vec3,
  type ReactorState,
  createReactorSDF,
  rotate,
  normalize,
  sub,
  add,
  mul,
  dot,
  length,
  mix,
  clamp,
  REACTOR_SHAPE_NAMES,
} from "../lib/sdf";

const WIDTH = 28;
const HEIGHT = 14;
const RENDER_HEIGHT = HEIGHT * 2; // Internal 2x resolution for half-block rendering

// RGB color type for pixel buffer
interface RGB {
  r: number;
  g: number;
  b: number;
}

// Raymarching constants
const MAX_STEPS = 32;
const MAX_DIST = 10.0;
const SURF_DIST = 0.01;

export function createReactorCorePanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "reactor-panel",
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
    id: "reactor-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "reactor-title",
    content: t`${bold(fg(theme.colors.fg)("REACTOR CORE"))}`,
  });

  const shapeLabel = new TextRenderable(renderer, {
    id: "reactor-shape",
    content: "SPHERE",
    fg: theme.colors.accent2,
  });

  titleBar.add(title);
  titleBar.add(shapeLabel);

  // Framebuffer for raymarched rendering
  const fbContainer = new BoxRenderable(renderer, {
    id: "reactor-fb-container",
    width: WIDTH,
    height: HEIGHT,
  });

  const framebuffer = new FrameBufferRenderable(renderer, {
    id: "reactor-framebuffer",
    width: WIDTH,
    height: HEIGHT,
  });

  fbContainer.add(framebuffer);

  // Status bar
  const statusBar = new BoxRenderable(renderer, {
    id: "reactor-status-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const tempText = new TextRenderable(renderer, {
    id: "reactor-temp",
    content: "2847°K",
    fg: theme.colors.success,
  });

  const outputText = new TextRenderable(renderer, {
    id: "reactor-output",
    content: "94%",
    fg: theme.colors.fg,
  });

  statusBar.add(tempText);
  statusBar.add(outputText);

  container.add(titleBar);
  container.add(fbContainer);
  container.add(statusBar);

  // Camera setup
  const cameraDistance = 3.5;
  const cameraHeight = 0.5;

  // Reactor state
  const state: ReactorState = {
    shapePhase: 0,
    morphT: 0,
    rotation: [0, 0, 0],
    pulseScale: 1.0,
    temperature: 0.3,
  };

  // Pixel buffer for 2x vertical resolution
  const pixelBuffer: RGB[][] = [];
  for (let y = 0; y < RENDER_HEIGHT; y++) {
    pixelBuffer[y] = [];
    for (let x = 0; x < WIDTH; x++) {
      pixelBuffer[y][x] = { r: 10, g: 10, b: 10 }; // bg color
    }
  }

  // Drawing helpers
  function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.floor(clamp(n, 0, 255)).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function setPixel(x: number, y: number, r: number, g: number, b: number) {
    if (x >= 0 && x < WIDTH && y >= 0 && y < RENDER_HEIGHT) {
      pixelBuffer[Math.round(y)][Math.round(x)] = {
        r: Math.floor(clamp(r, 0, 255)),
        g: Math.floor(clamp(g, 0, 255)),
        b: Math.floor(clamp(b, 0, 255)),
      };
    }
  }

  function length2D(x: number, y: number): number {
    return Math.sqrt(x * x + y * y);
  }

  function clear() {
    for (let y = 0; y < RENDER_HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        pixelBuffer[y][x] = { r: 10, g: 10, b: 10 };
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

  // Simplified raymarching for terminal rendering
  function raymarch(
    ro: Vec3,
    rd: Vec3,
    sdf: (p: Vec3) => number
  ): { hit: boolean; pos: Vec3; dist: number } {
    let t = 0;
    for (let i = 0; i < MAX_STEPS; i++) {
      const p: Vec3 = [ro[0] + rd[0] * t, ro[1] + rd[1] * t, ro[2] + rd[2] * t];
      const d = sdf(p);
      if (d < SURF_DIST) {
        return { hit: true, pos: p, dist: t };
      }
      if (t > MAX_DIST) break;
      t += d;
    }
    return { hit: false, pos: [0, 0, 0], dist: MAX_DIST };
  }

  function getNormal(p: Vec3, sdf: (p: Vec3) => number): Vec3 {
    const e = 0.001;
    const d = sdf(p);
    return normalize([
      sdf([p[0] + e, p[1], p[2]]) - d,
      sdf([p[0], p[1] + e, p[2]]) - d,
      sdf([p[0], p[1], p[2] + e]) - d,
    ]);
  }

  function render(time: number) {
    clear();

    // Camera position (orbiting)
    const camAngle = time * 0.3;
    const camPos: Vec3 = [
      Math.cos(camAngle) * cameraDistance,
      cameraHeight,
      Math.sin(camAngle) * cameraDistance,
    ];

    // Camera basis
    const target: Vec3 = [0, 0, 0];
    const up: Vec3 = [0, 1, 0];
    const forward = normalize(sub(target, camPos));
    const right = normalize(cross(forward, up));
    const camUp = cross(right, forward);

    // Create SDF for current state
    const sdf = createReactorSDF(state);

    // Light direction (follows camera slightly)
    const lightDir = normalize([0.5, 0.8, 0.3]);

    // Base colors from theme (cold blue → green → amber gradient)
    const coldBlue = hexToRgb(theme.colors.accent5); // Blue for cold
    const baseGreen = hexToRgb(theme.colors.fg); // Phosphor green
    const hotAmber = hexToRgb(theme.colors.warning); // Amber
    const hotRed = hexToRgb(theme.colors.accent4); // Orange-red for very hot

    // Render each pixel at 2x vertical resolution
    for (let py = 0; py < RENDER_HEIGHT; py++) {
      for (let px = 0; px < WIDTH; px++) {
        // Normalized coordinates (-1 to 1)
        const u = (px / WIDTH) * 2 - 1;
        const v = 1 - (py / RENDER_HEIGHT) * 2;

        // Aspect ratio (with half-block rendering, it's closer to 1:1)
        const aspect = WIDTH / RENDER_HEIGHT;

        // Ray direction
        const rd = normalize(
          add(add(forward, mul(right, u * aspect * 0.8)), mul(camUp, v * 0.8))
        );

        // Raymarch
        const result = raymarch(camPos, rd, sdf);

        if (result.hit) {
          // Calculate normal
          const normal = getNormal(result.pos, sdf);

          // Diffuse lighting
          const NdotL = Math.max(0, dot(normal, lightDir));

          // Specular (simplified Blinn-Phong)
          const halfVec = normalize(add(lightDir, mul(rd, -1)));
          const NdotH = Math.max(0, dot(normal, halfVec));
          const spec = Math.pow(NdotH, 16);

          // Rim lighting (makes edges glow)
          const NdotV = Math.max(0, dot(normal, mul(rd, -1)));
          const rim = Math.pow(1 - NdotV, 2) * 0.5;

          // Combine lighting
          const ambient = 0.15;
          const lighting = ambient + NdotL * 0.5 + spec * 0.3 + rim;

          // Depth fog (subtle)
          const fog = 1 - clamp(result.dist / MAX_DIST, 0, 1);

          // Final intensity
          const intensity = clamp(lighting * fog * state.pulseScale, 0, 1);

          // Color: 3-stage gradient (blue → green → amber → red) based on temperature
          const t = state.temperature;
          let r: number, g: number, b_val: number;

          if (t < 0.25) {
            // Cold: blue → green
            const coldT = t / 0.25;
            r = mix(coldBlue.r, baseGreen.r, coldT) * intensity;
            g = mix(coldBlue.g, baseGreen.g, coldT) * intensity;
            b_val = mix(coldBlue.b, baseGreen.b, coldT) * intensity;
          } else if (t < 0.5) {
            // Nominal: pure green
            r = baseGreen.r * intensity;
            g = baseGreen.g * intensity;
            b_val = baseGreen.b * intensity;
          } else if (t < 0.75) {
            // Warm: green → amber
            const warmT = (t - 0.5) / 0.25;
            r = mix(baseGreen.r, hotAmber.r, warmT) * intensity;
            g = mix(baseGreen.g, hotAmber.g, warmT) * intensity;
            b_val = mix(baseGreen.b, hotAmber.b, warmT) * intensity;
          } else {
            // Hot: amber → red
            const hotT = (t - 0.75) / 0.25;
            r = mix(hotAmber.r, hotRed.r, hotT) * intensity;
            g = mix(hotAmber.g, hotRed.g, hotT) * intensity;
            b_val = mix(hotAmber.b, hotRed.b, hotT) * intensity;
          }

          setPixel(px, py, r * 255, g * 255, b_val * 255);
        } else {
          // Background: subtle glow around edges
          const dist = length2D(u, v);
          if (dist > 0.7 && dist < 1.2) {
            const glow = (1 - Math.abs(dist - 0.9) / 0.3) * 0.1;
            setPixel(
              px,
              py,
              baseGreen.r * glow * 255,
              baseGreen.g * glow * 255,
              baseGreen.b * glow * 255
            );
          }
        }
      }
    }

    // Flush pixel buffer to framebuffer using half-block rendering
    flushToFramebuffer();
  }

  function update(time: number) {
    // Update morph state
    const morphCycle = 10; // 10 seconds per shape transition
    const totalPhase = time / morphCycle;
    state.shapePhase = Math.floor(totalPhase) % REACTOR_SHAPE_NAMES.length;
    state.morphT = totalPhase % 1;

    // Update rotation
    state.rotation = [time * 0.2, time * 0.3, time * 0.1];

    // Pulsing scale (breathing effect)
    state.pulseScale = 1 + Math.sin(time * 2) * 0.05;

    // Temperature oscillation - wider range to show full color gradient
    // Oscillates from ~0.1 (cold blue) to ~0.7 (warm amber)
    state.temperature = 0.4 + Math.sin(time * 0.3) * 0.3;

    // Render
    render(time);

    // Update labels
    const currentShape = REACTOR_SHAPE_NAMES[state.shapePhase];
    const nextShape =
      REACTOR_SHAPE_NAMES[(state.shapePhase + 1) % REACTOR_SHAPE_NAMES.length];
    if (state.morphT > 0.3 && state.morphT < 0.7) {
      shapeLabel.content = `${currentShape}→${nextShape}`;
    } else {
      shapeLabel.content = state.morphT < 0.3 ? currentShape : nextShape;
    }

    // Update temperature display
    const baseTemp = 2847;
    const tempVariation = Math.sin(time * 2) * 30;
    const displayTemp = Math.floor(baseTemp + tempVariation);
    tempText.content = `${displayTemp}°K`;

    // Color based on temp (matches reactor color gradient)
    if (displayTemp > 2900) {
      tempText.fg = theme.colors.accent4; // Orange-red (hot)
    } else if (displayTemp > 2870) {
      tempText.fg = theme.colors.warning; // Amber (warm)
    } else if (displayTemp > 2820) {
      tempText.fg = theme.colors.success; // Green (nominal)
    } else {
      tempText.fg = theme.colors.accent5; // Blue (cold)
    }

    // Output fluctuation
    const output = 94 + Math.floor(Math.sin(time * 1.5) * 3);
    outputText.content = `${output}%`;
  }

  return { container, update };
}

// Helper functions
function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 1, b: 0 };
}
