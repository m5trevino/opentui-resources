/**
 * Example 14: Morpheus - Raymarched SDF Showcase
 *
 * A real-time raymarched 3D demo featuring morphing geometric primitives
 * with true 24-bit color shading, ambient occlusion, and choreographed
 * camera movement.
 *
 * Controls:
 *   ← / →     - Morph to previous/next shape
 *   1-5       - Jump directly to shape
 *   Space     - Pause/Resume animations
 *   q         - Quit
 */

import {
  FrameBufferRenderable,
  TextRenderable,
  BoxRenderable,
  type KeyEvent,
  RGBA,
} from "@opentui/core";
import { createExampleApp } from "@shared/utils/example-app";

import { type MorphState, createSceneSDF, sub, normalize } from "./sdf";
import { raymarch, getRayDirection } from "./raymarcher";
import {
  shade,
  type ShadeParams,
  defaultLighting,
  palette,
  type RGB,
} from "./shader";
import {
  createInitialState,
  updateState,
  getCamera,
  getLightDirection,
  togglePause,
  triggerMorphDirection,
  triggerMorphTo,
} from "./choreography";

createExampleApp(({ renderer, addInterval }) => {
  // Responsive sizing - scale to terminal with reasonable limits
  const PADDING = 4; // Space for borders
  const HUD_HEIGHT = 3;
  const WIDTH = Math.min(renderer.width - PADDING, 120);
  const HEIGHT = Math.min(renderer.height - HUD_HEIGHT - PADDING, 50);

  // Initialize state
  let state = createInitialState();
  let frameCount = 0;
  let fpsDisplay = 0;
  let lastFpsUpdate = Date.now();

  // ============================================================================
  // UI Layout
  // ============================================================================

  const mainContainer = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: RGBA.fromHex("#0a0a1a"),
  });

  // Viewport container - centers the framebuffer
  const viewportContainer = new BoxRenderable(renderer, {
    id: "viewport-container",
    width: "100%",
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  });

  // Frame around the framebuffer
  const frame = new BoxRenderable(renderer, {
    id: "frame",
    width: WIDTH + 2,
    height: HEIGHT + 2,
    border: true,
    borderStyle: "rounded",
    borderColor: RGBA.fromHex("#8b5cf6"),
    justifyContent: "center",
    alignItems: "center",
  });

  // Framebuffer for raymarched content
  const framebuffer = new FrameBufferRenderable(renderer, {
    id: "viewport",
    width: WIDTH,
    height: HEIGHT,
  });

  frame.add(framebuffer);
  viewportContainer.add(frame);

  // HUD container
  const hud = new BoxRenderable(renderer, {
    id: "hud",
    width: "100%",
    height: HUD_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
    backgroundColor: RGBA.fromHex("#0d0d1a"),
  });

  const titleText = new TextRenderable(renderer, {
    id: "title",
    content: "◆ MORPHEUS",
    fg: RGBA.fromHex("#8b5cf6"),
  });

  const shapeText = new TextRenderable(renderer, {
    id: "shape",
    content: "Sphere",
    fg: RGBA.fromHex("#22d3ee"),
  });

  const fpsText = new TextRenderable(renderer, {
    id: "fps",
    content: "FPS: --",
    fg: RGBA.fromHex("#666666"),
  });

  const controlsText = new TextRenderable(renderer, {
    id: "controls",
    content: "[←/→] Shape  [1-3] Jump  [Space] Pause  [Q] Quit",
    fg: RGBA.fromHex("#444444"),
  });

  hud.add(titleText);
  hud.add(shapeText);
  hud.add(fpsText);
  hud.add(controlsText);

  mainContainer.add(viewportContainer);
  mainContainer.add(hud);
  renderer.root.add(mainContainer);

  // ============================================================================
  // Rendering (Half-block for 2x vertical resolution)
  // ============================================================================

  // Internal render resolution (2x vertical for half-block rendering)
  const RENDER_WIDTH = WIDTH;
  const RENDER_HEIGHT = HEIGHT * 2;

  // Pixel buffer for high-res rendering
  const pixels: RGB[][] = new Array(RENDER_HEIGHT);
  for (let y = 0; y < RENDER_HEIGHT; y++) {
    pixels[y] = new Array(RENDER_WIDTH);
  }

  function renderFrame() {
    const camera = getCamera(state);
    const lightDir = getLightDirection(state);

    // Create morph state for SDF
    const morphState: MorphState = {
      shapeA: state.currentShapeIdx,
      shapeB: state.nextShapeIdx,
      t: state.morphProgress,
      rotation: state.rotation,
      scale: state.scale,
    };

    const scene = createSceneSDF(morphState);

    // Shader parameters
    const shadeParams: ShadeParams = {
      lighting: {
        ...defaultLighting,
        lightDir,
      },
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      highlightColor: palette.highlight,
      backgroundColor: palette.background,
      hueOffset: state.hueOffset,
      time: state.time,
      enableShadows: false, // Disabled for performance
      enableAO: true,
    };

    // Render at 2x vertical resolution into pixel buffer
    // pixelAspect = 1.0 because half-block rendering gives us ~square pixels
    for (let y = 0; y < RENDER_HEIGHT; y++) {
      for (let x = 0; x < RENDER_WIDTH; x++) {
        // Get ray direction for this pixel
        const rayDir = getRayDirection(
          x,
          y,
          RENDER_WIDTH,
          RENDER_HEIGHT,
          camera,
          1.0
        );

        // Raymarch to find surface
        const hit = raymarch(camera.position, rayDir, scene);

        // Calculate view direction (from hit point back to camera)
        const viewDir = normalize(sub(camera.position, hit.position));

        // Shade the pixel and store in buffer
        pixels[y][x] = shade(hit, scene, viewDir, shadeParams);
      }
    }

    // Combine pairs of pixels into half-block characters
    // ▀ = upper half block: foreground = top pixel, background = bottom pixel
    for (let cellY = 0; cellY < HEIGHT; cellY++) {
      for (let x = 0; x < WIDTH; x++) {
        const topColor = pixels[cellY * 2][x];
        const botColor = pixels[cellY * 2 + 1][x];

        const fgRGBA = RGBA.fromInts(topColor.r, topColor.g, topColor.b, 255);
        const bgRGBA = RGBA.fromInts(botColor.r, botColor.g, botColor.b, 255);

        framebuffer.frameBuffer.setCell(x, cellY, "▀", fgRGBA, bgRGBA);
      }
    }
  }

  // ============================================================================
  // Animation Loop
  // ============================================================================

  let lastTime = Date.now();

  const animationLoop = setInterval(() => {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;

    // Update state
    state = updateState(state, deltaTime);

    // Render the frame
    renderFrame();

    // Update HUD
    const shapeNum = state.currentShapeIdx + 1;
    const morphIndicator = state.isMorphing ? " ↔" : "";
    shapeText.content = state.paused
      ? `⏸ [${shapeNum}] ${state.shapeName}`
      : `[${shapeNum}] ${state.shapeName}${morphIndicator}`;

    // Calculate FPS (update every 500ms)
    frameCount++;
    if (now - lastFpsUpdate > 500) {
      fpsDisplay = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
      lastFpsUpdate = now;
      frameCount = 0;
    }
    fpsText.content = `FPS: ${fpsDisplay}`;
  }, 33); // Target ~30 FPS
  addInterval(animationLoop);

  // ============================================================================
  // Input Handling
  // ============================================================================

  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "space":
        state = togglePause(state);
        break;

      // Arrow keys for prev/next shape
      case "left":
        state = triggerMorphDirection(state, -1);
        break;

      case "right":
        state = triggerMorphDirection(state, 1);
        break;

      // Number keys 1-3 for direct shape selection
      default:
        if (key.sequence >= "1" && key.sequence <= "3") {
          const targetIdx = parseInt(key.sequence, 10) - 1;
          state = triggerMorphTo(state, targetIdx);
        }
        break;
    }
  });
});
