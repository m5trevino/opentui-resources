/**
 * Example 15: 2D Physics Simulation
 *
 * Demonstrates physics simulation concepts:
 * - Gravity and collision detection
 * - Bouncing balls with velocity
 * - Wall boundaries
 * - Simple physics engine
 *
 * Note: Real implementation could integrate Rapier.js for more advanced physics
 */

import {
  TextRenderable,
  BoxRenderable,
  FrameBufferRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
  RGBA,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  mass: number;
}

createExampleApp(({ renderer, addInterval }) => {
  // Responsive sizing - scale to terminal with reasonable limits
  const PADDING = 4;
  const HUD_HEIGHT = 4; // Header + instructions
  const WIDTH = Math.max(40, Math.min(renderer.width - PADDING, 120));
  const HEIGHT = Math.max(20, Math.min(renderer.height - HUD_HEIGHT - PADDING, 50));
  const GRAVITY = 0.3;
  const FRICTION = 0.99;
  const BOUNCE = 0.8;

  let paused = false;
  let showTrails = false;
  let gravityEnabled = true;

  // Initialize balls
  const colors = [
    theme.colors.accent1,
    theme.colors.accent2,
    theme.colors.accent3,
    theme.colors.accent4,
    theme.colors.accent5,
    theme.colors.accent6,
  ];

  const balls: Ball[] = [];

  function addBall(x?: number, y?: number) {
    const radius = Math.floor(Math.random() * 3) + 2;
    balls.push({
      x: x ?? Math.random() * (WIDTH - radius * 2 - 10) + radius + 5,
      y: y ?? Math.random() * (HEIGHT / 3) + radius, // Spawn in top third
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 2,
      radius,
      color: colors[balls.length % colors.length],
      mass: Math.random() * 2 + 1,
    });
  }

  // Start with some balls
  for (let i = 0; i < 6; i++) {
    addBall();
  }

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
    gap: 1,
    alignItems: "center",
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "2D Physics Simulation",
    rightContent: `Balls: ${balls.length} | RUNNING`,
    rightColor: theme.colors.success,
  });

  // Physics container
  const physicsContainer = new BoxRenderable(renderer, {
    id: "physics-container",
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

  physicsContainer.add(framebuffer);

  // Drawing functions
  function clear() {
    const bgColor = RGBA.fromHex(theme.colors.bg);
    const bgAltColor = RGBA.fromHex(theme.colors.bgAlt);
    if (!showTrails) {
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          framebuffer.frameBuffer.setCell(x, y, " ", bgColor, bgColor);
        }
      }
    } else {
      // Fade trails
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          // Darken existing pixels slightly
          framebuffer.frameBuffer.setCell(x, y, " ", bgAltColor, bgAltColor);
        }
      }
    }
  }

  function setPixel(x: number, y: number, color: string) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    if (px >= 0 && px < WIDTH && py >= 0 && py < HEIGHT) {
      const rgba = RGBA.fromHex(color);
      framebuffer.frameBuffer.setCell(px, py, " ", rgba, rgba);
    }
  }

  function drawCircle(cx: number, cy: number, r: number, color: string) {
    // Fill circle
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        // Adjust for terminal aspect ratio (characters are ~2x taller than wide)
        if (dx * dx + dy * dy * 4 <= r * r) {
          setPixel(cx + dx, cy + dy, color);
        }
      }
    }
  }

  // Physics update
  function updatePhysics() {
    if (paused) return;

    for (const ball of balls) {
      // Apply gravity
      if (gravityEnabled) {
        ball.vy += GRAVITY;
      }

      // Apply friction
      ball.vx *= FRICTION;
      ball.vy *= FRICTION;

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall collisions
      // Left wall
      if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * BOUNCE;
      }
      // Right wall
      if (ball.x + ball.radius >= WIDTH) {
        ball.x = WIDTH - ball.radius - 1;
        ball.vx = -ball.vx * BOUNCE;
      }
      // Top wall
      if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * BOUNCE;
      }
      // Bottom wall (floor)
      if (ball.y + ball.radius >= HEIGHT) {
        ball.y = HEIGHT - ball.radius - 1;
        ball.vy = -ball.vy * BOUNCE;

        // Stop if moving too slowly
        if (Math.abs(ball.vy) < 0.5) {
          ball.vy = 0;
        }
      }
    }

    // Ball-to-ball collisions
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const b1 = balls[i];
        const b2 = balls[j];

        // Calculate distance in pixel space
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          // Collision detected - simple elastic collision
          const nx = dx / dist;
          const ny = dy / dist;

          // Relative velocity
          const dvx = b1.vx - b2.vx;
          const dvy = b1.vy - b2.vy;

          // Relative velocity in collision normal direction
          const dvn = dvx * nx + dvy * ny;

          // Only resolve if balls are approaching
          if (dvn > 0) {
            // Collision impulse
            const impulse = (2 * dvn) / (b1.mass + b2.mass);

            b1.vx -= impulse * b2.mass * nx;
            b1.vy -= impulse * b2.mass * ny;
            b2.vx += impulse * b1.mass * nx;
            b2.vy += impulse * b1.mass * ny;

            // Separate balls to prevent overlap
            const overlap = minDist - dist;
            const separationX = (overlap / 2 + 0.5) * nx;
            const separationY = (overlap / 2 + 0.5) * ny;
            b1.x -= separationX;
            b1.y -= separationY;
            b2.x += separationX;
            b2.y += separationY;
          }
        }
      }
    }
  }

  function render() {
    clear();

    // Draw floor indicator
    for (let x = 0; x < WIDTH; x++) {
      setPixel(x, HEIGHT - 1, theme.colors.bgHighlight);
    }

    // Draw balls
    for (const ball of balls) {
      drawCircle(ball.x, ball.y, ball.radius, ball.color);
    }

    framebuffer.requestRender();
  }

  function updateStatus() {
    header.setRightContent(
      `Balls: ${balls.length} | ${paused ? "PAUSED" : "RUNNING"} | Trails: ${showTrails ? "ON" : "OFF"} | Gravity: ${gravityEnabled ? "ON" : "OFF"}`
    );
    header.setRightColor(paused ? theme.colors.warning : theme.colors.success);
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "Space", action: "Pause" },
      { key: "a", action: "Add ball" },
      { key: "r", action: "Reset" },
      { key: "t", action: "Trails" },
      { key: "g", action: "Toggle gravity" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(physicsContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Game loop
  const gameLoop = setInterval(() => {
    updatePhysics();
    render();
  }, 33); // ~30 FPS
  addInterval(gameLoop);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "space":
        paused = !paused;
        updateStatus();
        break;
      case "a":
        if (balls.length < 20) {
          addBall();
          updateStatus();
        }
        break;
      case "r":
        balls.length = 0;
        for (let i = 0; i < 6; i++) {
          addBall();
        }
        updateStatus();
        break;
      case "t":
        showTrails = !showTrails;
        updateStatus();
        break;
      case "g":
        gravityEnabled = !gravityEnabled;
        // When disabling gravity, give balls random velocities to simulate zero-g drift
        // This prevents them from sitting motionless on the floor
        if (!gravityEnabled) {
          balls.forEach((ball) => {
            ball.vy = (Math.random() - 0.5) * 4;
          });
        }
        updateStatus();
        break;
    }
  });
});
