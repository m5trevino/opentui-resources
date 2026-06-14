/**
 * Example 10: Timeline Animations
 *
 * Demonstrates animation capabilities:
 * - Timeline API for sequenced animations
 * - Easing functions
 * - Property animations (position, color, size)
 * - Looping and nested timelines
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
import { easings, lerpColor, AnimationRunner } from "@shared/utils/animation-presets";

createExampleApp(({ renderer, addTimeout }) => {
  const animRunner = new AnimationRunner();
  let animationPlaying = true;

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
    title: "Timeline Animations",
    rightContent: "▶ Playing",
    rightColor: theme.colors.success,
  });

  // Animation showcase area
  const showcase = new BoxRenderable(renderer, {
    id: "showcase",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    padding: 1,
  });

  // Animation 1: Bouncing ball
  const ballContainer = new BoxRenderable(renderer, {
    id: "ball-container",
    width: "100%",
    height: 6,
    flexDirection: "column",
    marginBottom: 1,
  });

  const ballLabel = new TextRenderable(renderer, {
    id: "ball-label",
    content: "Bouncing Ball (easeOutBounce):",
    fg: theme.colors.fgMuted,
  });

  const ballTrack = new BoxRenderable(renderer, {
    id: "ball-track",
    width: 60,
    height: 3,
    backgroundColor: theme.colors.bg,
    position: "relative",
  });

  const ball = new TextRenderable(renderer, {
    id: "ball",
    content: "●",
    fg: theme.colors.accent1,
    position: "absolute",
    left: 0,
    top: 1,
  });

  ballTrack.add(ball);
  ballContainer.add(ballLabel);
  ballContainer.add(ballTrack);

  // Animation 2: Color cycling
  const colorContainer = new BoxRenderable(renderer, {
    id: "color-container",
    width: "100%",
    height: 4,
    flexDirection: "column",
    marginBottom: 1,
  });

  const colorLabel = new TextRenderable(renderer, {
    id: "color-label",
    content: "Color Cycling (linear):",
    fg: theme.colors.fgMuted,
  });

  const colorBlock = new TextRenderable(renderer, {
    id: "color-block",
    content: "████████████████████████████████",
    fg: theme.colors.accent3,
  });

  colorContainer.add(colorLabel);
  colorContainer.add(colorBlock);

  // Animation 3: Progress bar
  const progressContainer = new BoxRenderable(renderer, {
    id: "progress-container",
    width: "100%",
    height: 4,
    flexDirection: "column",
    marginBottom: 1,
  });

  const progressLabel = new TextRenderable(renderer, {
    id: "progress-label",
    content: "Progress Bar (easeInOutCubic):",
    fg: theme.colors.fgMuted,
  });

  const progressTrack = new BoxRenderable(renderer, {
    id: "progress-track",
    width: 50,
    height: 1,
    backgroundColor: theme.colors.bg,
    flexDirection: "row",
  });

  const progressFill = new TextRenderable(renderer, {
    id: "progress-fill",
    content: "",
    bg: theme.colors.accent4,
  });

  progressTrack.add(progressFill);
  progressContainer.add(progressLabel);
  progressContainer.add(progressTrack);

  // Animation 4: Pulsing text
  const pulseContainer = new BoxRenderable(renderer, {
    id: "pulse-container",
    width: "100%",
    height: 4,
    flexDirection: "column",
    marginBottom: 1,
  });

  const pulseLabel = new TextRenderable(renderer, {
    id: "pulse-label",
    content: "Pulsing Text (easeInOutQuad):",
    fg: theme.colors.fgMuted,
  });

  const pulseText = new TextRenderable(renderer, {
    id: "pulse-text",
    content: t`${bold(fg(theme.colors.accent5)("★ OpenTUI ★"))}`,
  });

  pulseContainer.add(pulseLabel);
  pulseContainer.add(pulseText);

  // Animation 5: Wave effect
  const waveContainer = new BoxRenderable(renderer, {
    id: "wave-container",
    width: "100%",
    height: 4,
    flexDirection: "column",
  });

  const waveLabel = new TextRenderable(renderer, {
    id: "wave-label",
    content: "Wave Effect (sine):",
    fg: theme.colors.fgMuted,
  });

  const waveChars = "HELLO WORLD".split("");
  const waveBox = new BoxRenderable(renderer, {
    id: "wave-box",
    flexDirection: "row",
    gap: 0,
  });

  const waveTexts: TextRenderable[] = [];
  waveChars.forEach((char, i) => {
    const waveChar = new TextRenderable(renderer, {
      id: `wave-${i}`,
      content: char,
      fg: theme.colors.accent6,
    });
    waveTexts.push(waveChar);
    waveBox.add(waveChar);
  });

  waveContainer.add(waveLabel);
  waveContainer.add(waveBox);

  // Build showcase
  showcase.add(ballContainer);
  showcase.add(colorContainer);
  showcase.add(progressContainer);
  showcase.add(pulseContainer);
  showcase.add(waveContainer);

  // Easing selector
  const easingInfo = new TextRenderable(renderer, {
    id: "easing-info",
    content:
      "Available easings: linear, easeInQuad, easeOutBounce, easeInOutElastic, easeOutBack",
    fg: theme.colors.fgMuted,
  });

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "Space", action: "Pause/Resume" },
      { key: "r", action: "Restart" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build main tree
  main.add(header.getContainer());
  main.add(showcase);
  main.add(easingInfo);
  main.add(keyBar);
  renderer.root.add(main);

  // Animation states
  let ballPosition = 0;
  let colorPhase = 0;
  let progressValue = 0;
  let pulsePhase = 0;
  let wavePhase = 0;

  const colors = [
    theme.colors.accent1,
    theme.colors.accent2,
    theme.colors.accent3,
    theme.colors.accent4,
    theme.colors.accent5,
    theme.colors.accent6,
  ];

  function animate() {
    if (!animationPlaying) return;

    const time = Date.now() / 1000;

    // Ball animation (bouncing)
    ballPosition = (time * 0.5) % 1;
    const easedBall = easings.easeOutBounce(ballPosition);
    const ballX = Math.floor(easedBall * 55);
    ball.left = ballX;

    // Color cycling
    colorPhase = (time * 0.3) % 1;
    const colorIndex = Math.floor(colorPhase * colors.length);
    const nextColorIndex = (colorIndex + 1) % colors.length;
    const colorT = (colorPhase * colors.length) % 1;
    const currentColor = lerpColor(
      colors[colorIndex],
      colors[nextColorIndex],
      colorT
    );
    colorBlock.fg = currentColor;

    // Progress bar
    progressValue = (time * 0.4) % 1;
    const easedProgress = easings.easeInOutCubic(progressValue);
    const fillWidth = Math.floor(easedProgress * 48);
    progressFill.content = "█".repeat(fillWidth);

    // Pulsing text - use styled text with dynamic color
    pulsePhase = Math.sin(time * 3) * 0.5 + 0.5;
    const pulseFg = lerpColor(
      theme.colors.fgMuted,
      theme.colors.accent5,
      pulsePhase
    );
    pulseText.content = t`${bold(fg(pulseFg)("★ OpenTUI ★"))}`;

    // Wave effect
    wavePhase = time * 2;
    waveTexts.forEach((text, i) => {
      const offset = Math.sin(wavePhase + i * 0.5) * 0.5 + 0.5;
      const waveFg = lerpColor(
        theme.colors.accent3,
        theme.colors.accent6,
        offset
      );
      text.fg = waveFg;
    });

    // Continue animation
    const timeout = setTimeout(animate, 16);
    addTimeout(timeout);
  }

  function toggleAnimation() {
    animationPlaying = !animationPlaying;
    header.setRightContent(animationPlaying ? "▶ Playing" : "⏸ Paused");
    header.setRightColor(
      animationPlaying ? theme.colors.success : theme.colors.warning
    );
    if (animationPlaying) {
      animate();
    }
  }

  // Start animation
  animate();

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "space":
        toggleAnimation();
        break;
      case "r":
        // Restart animations
        ballPosition = 0;
        colorPhase = 0;
        progressValue = 0;
        pulsePhase = 0;
        wavePhase = 0;
        break;
    }
  });
});
