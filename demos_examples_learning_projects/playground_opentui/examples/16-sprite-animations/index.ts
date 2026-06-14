/**
 * Example 16: Sprite Animations
 *
 * Demonstrates sprite-based animations:
 * - Frame-by-frame animation
 * - Character sprites
 * - Explosion effects
 * - Multiple animated entities
 */

import {
  TextRenderable,
  BoxRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

interface Sprite {
  frames: string[][];
  currentFrame: number;
  frameDelay: number;
  frameCounter: number;
}

interface Entity {
  x: number;
  y: number;
  sprite: Sprite;
  vx: number;
  vy: number;
  active: boolean;
}

interface Explosion {
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
}

createExampleApp(({ renderer, addInterval }) => {
  // Sprite definitions
  const characterSprite: Sprite = {
    frames: [
      [" o ", "/|\\", "/ \\"],
      [" o ", "/|\\", "| |"],
      [" o ", "\\|/", "/ \\"],
      [" o ", "\\|/", "| |"],
    ],
    currentFrame: 0,
    frameDelay: 5,
    frameCounter: 0,
  };

  const birdSprite: Sprite = {
    frames: [
      ["  __  ", ">(o )>", "  \\/  "],
      ["  __  ", ">(o )>", "  /\\  "],
      [" \\__/ ", ">(o )>", "      "],
      [" /__\\ ", ">(o )>", "      "],
    ],
    currentFrame: 0,
    frameDelay: 4,
    frameCounter: 0,
  };

  const starSprite: Sprite = {
    frames: [
      ["  *  ", " *** ", "  *  "],
      [" * * ", "  *  ", " * * "],
      ["  +  ", " +++ ", "  +  "],
      [" + + ", "  +  ", " + + "],
    ],
    currentFrame: 0,
    frameDelay: 8,
    frameCounter: 0,
  };

  const explosionFrames = [
    ["  .  ", " ... ", "  .  "],
    [" .*. ", ".*.*.", " .*. "],
    [".*.*.", "*****", ".*.*.", "*.*.*"],
    [" * * ", "* * *", " * * ", "* * *"],
    ["  .  ", " . . ", "  .  "],
    ["     ", "  .  ", "     "],
  ];

  // Entities
  const entities: Entity[] = [
    {
      x: 10,
      y: 15,
      sprite: { ...characterSprite },
      vx: 0.5,
      vy: 0,
      active: true,
    },
    {
      x: 60,
      y: 8,
      sprite: { ...birdSprite },
      vx: -0.8,
      vy: 0.2,
      active: true,
    },
    {
      x: 35,
      y: 20,
      sprite: { ...starSprite },
      vx: 0,
      vy: 0,
      active: true,
    },
  ];

  const explosions: Explosion[] = [];
  let paused = false;

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
    title: "Sprite Animations",
    rightContent: "PLAYING | Press 'e' to explode!",
    rightColor: theme.colors.success,
  });

  // Animation container
  const animContainer = new BoxRenderable(renderer, {
    id: "anim-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    position: "relative",
    overflow: "hidden",
  });

  // Create text renderables for each entity
  const entityRenderables: TextRenderable[][] = [];

  entities.forEach((entity, entityIndex) => {
    const lines: TextRenderable[] = [];
    const spriteHeight = entity.sprite.frames[0].length;

    for (let i = 0; i < spriteHeight; i++) {
      const line = new TextRenderable(renderer, {
        id: `entity-${entityIndex}-line-${i}`,
        content: entity.sprite.frames[0][i],
        fg: [theme.colors.accent4, theme.colors.accent3, theme.colors.accent6][
          entityIndex
        ],
        position: "absolute",
        left: Math.floor(entity.x),
        top: Math.floor(entity.y) + i,
      });
      lines.push(line);
      animContainer.add(line);
    }
    entityRenderables.push(lines);
  });

  // Explosion renderables (pooled)
  const explosionRenderables: TextRenderable[][] = [];
  const MAX_EXPLOSIONS = 5;

  for (let e = 0; e < MAX_EXPLOSIONS; e++) {
    const lines: TextRenderable[] = [];
    for (let i = 0; i < 4; i++) {
      const line = new TextRenderable(renderer, {
        id: `explosion-${e}-line-${i}`,
        content: "",
        fg: theme.colors.accent5,
        position: "absolute",
        left: 0,
        top: 0,
      });
      lines.push(line);
      animContainer.add(line);
    }
    explosionRenderables.push(lines);
  }

  function updateEntities() {
    if (paused) return;

    entities.forEach((entity, entityIndex) => {
      if (!entity.active) return;

      // Update animation frame
      entity.sprite.frameCounter++;
      if (entity.sprite.frameCounter >= entity.sprite.frameDelay) {
        entity.sprite.frameCounter = 0;
        entity.sprite.currentFrame =
          (entity.sprite.currentFrame + 1) % entity.sprite.frames.length;
      }

      // Update position
      entity.x += entity.vx;
      entity.y += entity.vy;

      // Bounce off walls
      if (entity.x < 0 || entity.x > 70) {
        entity.vx = -entity.vx;
        entity.x = Math.max(0, Math.min(70, entity.x));
      }
      if (entity.y < 0 || entity.y > 25) {
        entity.vy = -entity.vy;
        entity.y = Math.max(0, Math.min(25, entity.y));
      }

      // Update renderables
      const currentFrame = entity.sprite.frames[entity.sprite.currentFrame];
      entityRenderables[entityIndex].forEach((line, lineIndex) => {
        line.content = currentFrame[lineIndex] || "";
        line.left = Math.floor(entity.x);
        line.top = Math.floor(entity.y) + lineIndex;
      });
    });
  }

  function updateExplosions() {
    if (paused) return;

    // Iterate in reverse to safely remove items while iterating
    for (let expIndex = explosions.length - 1; expIndex >= 0; expIndex--) {
      const explosion = explosions[expIndex];
      explosion.frame++;

      if (explosion.frame >= explosion.maxFrames) {
        // Hide renderable before removing from array
        explosionRenderables[expIndex]?.forEach((line) => {
          line.content = "";
        });
        // Remove explosion
        explosions.splice(expIndex, 1);
        continue;
      }

      const frameIndex = Math.min(
        Math.floor(
          (explosion.frame / explosion.maxFrames) * explosionFrames.length
        ),
        explosionFrames.length - 1
      );
      const frame = explosionFrames[frameIndex];

      // Get colors for explosion (yellow to red to gray)
      const progress = explosion.frame / explosion.maxFrames;
      let color: string;
      if (progress < 0.3) {
        color = theme.colors.accent6; // Yellow
      } else if (progress < 0.6) {
        color = theme.colors.accent5; // Orange
      } else if (progress < 0.8) {
        color = theme.colors.error; // Red
      } else {
        color = theme.colors.fgMuted; // Gray
      }

      explosionRenderables[expIndex]?.forEach((line, lineIndex) => {
        line.content = frame[lineIndex] || "";
        line.fg = color;
        line.left = explosion.x;
        line.top = explosion.y + lineIndex;
      });
    }
  }

  function addExplosion(x: number, y: number) {
    if (explosions.length < MAX_EXPLOSIONS) {
      explosions.push({
        x: Math.floor(x),
        y: Math.floor(y),
        frame: 0,
        maxFrames: 20,
      });
    }
  }

  // Sprite preview
  const previewSection = new BoxRenderable(renderer, {
    id: "preview-section",
    flexDirection: "row",
    gap: 3,
    marginTop: 1,
  });

  const spriteNames = ["Character", "Bird", "Star"];
  const previewColors = [
    theme.colors.accent4,
    theme.colors.accent3,
    theme.colors.accent6,
  ];

  [characterSprite, birdSprite, starSprite].forEach((sprite, i) => {
    const preview = new BoxRenderable(renderer, {
      id: `preview-${i}`,
      flexDirection: "column",
      alignItems: "center",
      padding: 1,
      backgroundColor: theme.colors.bg,
      border: true,
      borderStyle: "single",
      borderColor: theme.colors.border,
    });

    const label = new TextRenderable(renderer, {
      id: `preview-label-${i}`,
      content: spriteNames[i],
      fg: theme.colors.fgMuted,
    });
    preview.add(label);

    sprite.frames[0].forEach((line, j) => {
      const spriteLine = new TextRenderable(renderer, {
        id: `preview-sprite-${i}-${j}`,
        content: line,
        fg: previewColors[i],
      });
      preview.add(spriteLine);
    });

    previewSection.add(preview);
  });

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "Space", action: "Pause" },
      { key: "e", action: "Add explosion" },
      { key: "r", action: "Reset positions" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(animContainer);
  main.add(previewSection);
  main.add(keyBar);
  renderer.root.add(main);

  // Animation loop
  const animLoop = setInterval(() => {
    updateEntities();
    updateExplosions();
  }, 50);
  addInterval(animLoop);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "space":
        paused = !paused;
        header.setRightContent(
          `${paused ? "PAUSED" : "PLAYING"} | Press 'e' to explode!`
        );
        header.setRightColor(
          paused ? theme.colors.warning : theme.colors.success
        );
        break;
      case "e":
        // Add explosion at random position
        addExplosion(
          Math.floor(Math.random() * 60) + 5,
          Math.floor(Math.random() * 20) + 3
        );
        break;
      case "r":
        // Reset entity positions
        entities[0].x = 10;
        entities[0].y = 15;
        entities[1].x = 60;
        entities[1].y = 8;
        entities[2].x = 35;
        entities[2].y = 20;
        break;
    }
  });
});
