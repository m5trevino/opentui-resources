/**
 * Example 22: Terminal Game (Snake)
 *
 * Demonstrates a simple game implementation:
 * - Game loop
 * - Collision detection
 * - Scoring system
 * - Keyboard controls
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

interface Point {
  x: number;
  y: number;
}

createExampleApp(
  ({ renderer, addInterval }) => {
    // Calculate available space (accounting for UI elements)
    const UI_PADDING = 4; // Main container padding + borders
    const HEADER_HEIGHT = 2; // Header row + gap
    const FOOTER_HEIGHT = 3; // Status line + instructions + gaps

    // Responsive dimensions with sensible limits
    const WIDTH = Math.min(Math.max(renderer.width - UI_PADDING, 20), 80);
    const HEIGHT = Math.min(
      Math.max(renderer.height - HEADER_HEIGHT - FOOTER_HEIGHT - UI_PADDING, 10),
      40
    );

    // Game constants
    const INITIAL_SPEED = 150; // ms per frame
    const SPEED_INCREMENT = 5;

    // Game state
    let snake: Point[] = [{ x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) }];
    let direction: Point = { x: 1, y: 0 };
    let nextDirection: Point = { x: 1, y: 0 };
    let food: Point = { x: 0, y: 0 };
    let score = 0;
    let highScore = 0;
    let gameOver = false;
    let paused = false;
    let speed = INITIAL_SPEED;

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
      title: "Snake Game",
      rightContent: `Score: ${score} | High: ${highScore}`,
      rightColor: theme.colors.accent5,
    });

    // Game container (doubled width for square pixels)
    const gameContainer = new BoxRenderable(renderer, {
      id: "game-container",
      width: WIDTH * 2 + 2,
      height: HEIGHT + 2,
      border: true,
      borderStyle: "rounded",
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.bg,
    });

    const framebuffer = new FrameBufferRenderable(renderer, {
      id: "game-fb",
      width: WIDTH * 2, // Doubled for square pixels
      height: HEIGHT,
    });

    gameContainer.add(framebuffer);

    // Status display
    const statusDisplay = new TextRenderable(renderer, {
      id: "status",
      content: "Press SPACE to start!",
      fg: theme.colors.success,
    });

    // Instructions
    const instructions = createKeyBindingBar(
      renderer,
      [
        { key: "WASD/Arrows", action: "Move" },
        { key: "Space", action: "Pause" },
        { key: "R", action: "Restart" },
        { key: "Q", action: "Quit" },
      ],
      { theme }
    );

    // Build tree
    main.add(header.getContainer());
    main.add(gameContainer);
    main.add(statusDisplay);
    main.add(instructions);
    renderer.root.add(main);

    // Helper functions
    function spawnFood() {
      do {
        food = {
          x: Math.floor(Math.random() * WIDTH),
          y: Math.floor(Math.random() * HEIGHT),
        };
      } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
    }

    function setPixel(x: number, y: number, color: string) {
      if (!framebuffer.frameBuffer) return; // Guard against uninitialized framebuffer
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        const rgba = RGBA.fromHex(color);
        // Write 2 horizontal cells for square appearance
        framebuffer.frameBuffer.setCell(x * 2, y, " ", rgba, rgba);
        framebuffer.frameBuffer.setCell(x * 2 + 1, y, " ", rgba, rgba);
      }
    }

    function clear() {
      if (!framebuffer.frameBuffer) return; // Guard against uninitialized framebuffer
      const bgColor = RGBA.fromHex(theme.colors.bg);
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH * 2; x++) {
          framebuffer.frameBuffer.setCell(x, y, " ", bgColor, bgColor);
        }
      }
    }

    function drawSnake() {
      snake.forEach((segment, i) => {
        const isHead = i === 0;
        const color = isHead ? theme.colors.accent4 : theme.colors.success;
        if (segment.x >= 0 && segment.x < WIDTH && segment.y >= 0 && segment.y < HEIGHT) {
          setPixel(segment.x, segment.y, color);
        }
      });
    }

    function drawFood() {
      if (food.x >= 0 && food.x < WIDTH && food.y >= 0 && food.y < HEIGHT) {
        setPixel(food.x, food.y, theme.colors.error);
      }
    }

    function drawBorder() {
      // Draw subtle corner markers
      setPixel(0, 0, theme.colors.fgMuted);
      setPixel(WIDTH - 1, 0, theme.colors.fgMuted);
      setPixel(0, HEIGHT - 1, theme.colors.fgMuted);
      setPixel(WIDTH - 1, HEIGHT - 1, theme.colors.fgMuted);
    }

    function render() {
      clear();
      drawBorder();
      drawFood();
      drawSnake();
    }

    function checkCollision(): boolean {
      const head = snake[0];

      // Wall collision
      if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) {
        return true;
      }

      // Self collision
      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          return true;
        }
      }

      return false;
    }

    function update() {
      if (gameOver || paused) return;

      // Apply direction change
      direction = nextDirection;

      // Move snake
      const head = snake[0];
      const newHead: Point = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      snake.unshift(newHead);

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        if (score > highScore) {
          highScore = score;
        }
        spawnFood();

        // Speed up
        speed = Math.max(50, speed - SPEED_INCREMENT);

        header.setRightContent(`Score: ${score} | High: ${highScore}`);
      } else {
        snake.pop();
      }

      // Check collision
      if (checkCollision()) {
        gameOver = true;
        statusDisplay.content = "GAME OVER! Press R to restart";
        statusDisplay.fg = theme.colors.error;
      }
    }

    function resetGame() {
      snake = [{ x: Math.floor(WIDTH / 2), y: Math.floor(HEIGHT / 2) }];
      direction = { x: 1, y: 0 };
      nextDirection = { x: 1, y: 0 };
      score = 0;
      gameOver = false;
      paused = true;
      speed = INITIAL_SPEED;

      spawnFood();
      header.setRightContent(`Score: ${score} | High: ${highScore}`);
      statusDisplay.content = "Press SPACE to start!";
      statusDisplay.fg = theme.colors.success;
      render();
    }

    // Initialize
    spawnFood();
    render();

    // Game loop
    let lastUpdate = Date.now();

    const gameLoop = setInterval(() => {
      const now = Date.now();
      if (now - lastUpdate >= speed) {
        update();
        render();
        lastUpdate = now;

        if (!gameOver && !paused) {
          statusDisplay.content = `Playing... Length: ${snake.length}`;
          statusDisplay.fg = theme.colors.accent3;
        }
      }
    }, 16);

    addInterval(gameLoop);

    // Handle keyboard (using the renderer's keyInput directly for game-specific controls)
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
      if (key.name === "r") {
        resetGame();
        return;
      }

      if (key.name === "space") {
        if (gameOver) {
          resetGame();
        } else {
          paused = !paused;
          statusDisplay.content = paused ? "PAUSED - Press SPACE to resume" : `Playing... Length: ${snake.length}`;
          statusDisplay.fg = paused ? theme.colors.warning : theme.colors.accent3;
        }
        return;
      }

      if (gameOver || paused) return;

      // Direction controls - prevent 180 degree turns
      switch (key.name) {
        case "up":
        case "w":
          if (direction.y !== 1) {
            nextDirection = { x: 0, y: -1 };
          }
          break;
        case "down":
        case "s":
          if (direction.y !== -1) {
            nextDirection = { x: 0, y: 1 };
          }
          break;
        case "left":
        case "a":
          if (direction.x !== 1) {
            nextDirection = { x: -1, y: 0 };
          }
          break;
        case "right":
        case "d":
          if (direction.x !== -1) {
            nextDirection = { x: 1, y: 0 };
          }
          break;
      }
    });
  }
);
