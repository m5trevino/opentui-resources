/**
 * Example 13: Framebuffer Graphics
 *
 * Demonstrates FrameBufferRenderable for custom pixel drawing:
 * - Direct pixel manipulation
 * - Drawing primitives (lines, rectangles, circles)
 * - Custom patterns and shapes
 */

import {
  TextRenderable,
  BoxRenderable,
  FrameBufferRenderable,
  type KeyEvent,
  RGBA,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer, addInterval }) => {
  const WIDTH = 80;
  const HEIGHT = 30;
  let mode = 0;
  const modes = ["Shapes", "Gradient", "Animation", "Pattern", "Noise"];

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
    gap: 1,
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "Framebuffer Graphics",
    rightContent: `Mode: ${modes[mode]}`,
    rightColor: theme.colors.accent5,
  });

  // Framebuffer container
  const fbContainer = new BoxRenderable(renderer, {
    id: "fb-container",
    width: WIDTH + 2,
    height: HEIGHT + 2,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  });

  const framebuffer = new FrameBufferRenderable(renderer, {
    id: "framebuffer",
    width: WIDTH,
    height: HEIGHT,
  });

  fbContainer.add(framebuffer);

  // Drawing functions
  function setPixel(x: number, y: number, color: string) {
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      const rgba = RGBA.fromHex(color);
      framebuffer.frameBuffer.setCell(x, y, " ", rgba, rgba);
    }
  }

  function fillRect(x: number, y: number, w: number, h: number, color: string) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        setPixel(px, py, color);
      }
    }
  }

  function drawRect(x: number, y: number, w: number, h: number, color: string) {
    for (let px = x; px < x + w; px++) {
      setPixel(px, y, color);
      setPixel(px, y + h - 1, color);
    }
    for (let py = y; py < y + h; py++) {
      setPixel(x, py, color);
      setPixel(x + w - 1, py, color);
    }
  }

  function drawCircle(cx: number, cy: number, r: number, color: string) {
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180;
      const x = Math.round(cx + r * Math.cos(rad));
      const y = Math.round(cy + r * Math.sin(rad) * 0.5); // Aspect ratio correction
      setPixel(x, y, color);
    }
  }

  function fillCircle(cx: number, cy: number, r: number, color: string) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y * 4 <= r * r) {
          // Aspect ratio correction
          setPixel(cx + x, cy + y, color);
        }
      }
    }
  }

  function drawLine(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string
  ) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      setPixel(x0, y0, color);
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

  function clear(color: string = theme.colors.bg) {
    fillRect(0, 0, WIDTH, HEIGHT, color);
  }

  // Draw different modes
  function drawShapes() {
    clear();

    // Filled rectangles
    fillRect(5, 3, 15, 8, theme.colors.accent1);
    fillRect(25, 5, 12, 6, theme.colors.accent2);
    fillRect(42, 2, 20, 10, theme.colors.accent3);

    // Outlined rectangles
    drawRect(10, 14, 20, 8, theme.colors.accent4);
    drawRect(35, 15, 15, 7, theme.colors.accent5);

    // Circles
    fillCircle(65, 8, 6, theme.colors.accent6);
    drawCircle(15, 22, 5, theme.colors.accent1);
    drawCircle(55, 22, 8, theme.colors.accent2);

    // Lines
    drawLine(2, 2, 78, 28, theme.colors.fgMuted);
    drawLine(78, 2, 2, 28, theme.colors.fgMuted);
  }

  function drawGradient() {
    clear();

    const colors = [
      theme.colors.accent1,
      theme.colors.accent2,
      theme.colors.accent3,
      theme.colors.accent4,
      theme.colors.accent5,
      theme.colors.accent6,
    ];

    for (let x = 0; x < WIDTH; x++) {
      const colorIndex = Math.floor((x / WIDTH) * colors.length);
      const color = colors[Math.min(colorIndex, colors.length - 1)];
      for (let y = 0; y < HEIGHT; y++) {
        setPixel(x, y, color);
      }
    }
  }

  let animFrame = 0;
  function drawAnimation() {
    clear();

    const time = animFrame * 0.1;

    // Bouncing circles
    for (let i = 0; i < 5; i++) {
      const phase = time + (i * Math.PI * 2) / 5;
      const x = Math.floor(WIDTH / 2 + Math.cos(phase) * 30);
      const y = Math.floor(HEIGHT / 2 + Math.sin(phase * 2) * 10);
      const colors = [
        theme.colors.accent1,
        theme.colors.accent2,
        theme.colors.accent3,
        theme.colors.accent4,
        theme.colors.accent5,
      ];
      fillCircle(x, y, 4 + Math.sin(time + i) * 2, colors[i]);
    }

    // Spinning line
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const len = 20;
    const angle = time * 2;
    const x1 = Math.floor(cx + Math.cos(angle) * len);
    const y1 = Math.floor(cy + Math.sin(angle) * len * 0.5);
    const x2 = Math.floor(cx - Math.cos(angle) * len);
    const y2 = Math.floor(cy - Math.sin(angle) * len * 0.5);
    drawLine(x1, y1, x2, y2, theme.colors.fg);

    animFrame++;
  }

  function drawPattern() {
    clear();

    const colors = [
      theme.colors.accent1,
      theme.colors.accent2,
      theme.colors.accent3,
      theme.colors.accent4,
    ];

    // Checkerboard pattern
    const size = 4;
    for (let y = 0; y < HEIGHT; y += size) {
      for (let x = 0; x < WIDTH; x += size) {
        const colorIndex =
          ((Math.floor(x / size) + Math.floor(y / size)) % 2) +
          (Math.floor(y / (size * 4)) % 2) * 2;
        fillRect(x, y, size, size, colors[colorIndex]);
      }
    }
  }

  function drawNoise() {
    const colors = [
      theme.colors.bg,
      theme.colors.bgAlt,
      theme.colors.bgHighlight,
      theme.colors.fgMuted,
      theme.colors.fg,
    ];

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const colorIndex = Math.floor(Math.random() * colors.length);
        setPixel(x, y, colors[colorIndex]);
      }
    }
  }

  function drawCurrentMode() {
    switch (mode) {
      case 0:
        drawShapes();
        break;
      case 1:
        drawGradient();
        break;
      case 2:
        drawAnimation();
        break;
      case 3:
        drawPattern();
        break;
      case 4:
        drawNoise();
        break;
    }
    header.setRightContent(`Mode: ${modes[mode]}`);
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "←/→", action: "Change mode" },
      { key: "Space", action: "Refresh" },
      { key: "1-5", action: "Select mode" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(fbContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Initial draw
  drawCurrentMode();

  // Constant animation loop - only animates when in mode 2
  const animationLoop = setInterval(() => {
    if (mode === 2) {
      drawAnimation();
      // Force renderer repaint by updating header
      header.setRightContent(`Mode: ${modes[mode]} [${animFrame}]`);
    }
  }, 50);
  addInterval(animationLoop);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "left":
        mode = (mode - 1 + modes.length) % modes.length;
        drawCurrentMode();
        break;
      case "right":
        mode = (mode + 1) % modes.length;
        drawCurrentMode();
        break;
      case "space":
        drawCurrentMode();
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
        mode = parseInt(key.name) - 1;
        drawCurrentMode();
        break;
    }
  });
});
