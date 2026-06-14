/**
 * Proximity Alert Panel
 *
 * Features:
 * - State machine: DORMANT → DETECTING → ALERT → COOLDOWN
 * - Frame-based sprite animations
 * - Color progression: green → yellow → orange → red
 * - Syncs with motion tracker anomaly events
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  t,
  bold,
  fg,
} from "@opentui/core";
import { nostromoTheme as theme } from "../theme";
import { nostromoEvents } from "../lib/events";

type AlertState = "DORMANT" | "DETECTING" | "ALERT" | "COOLDOWN";

interface SpriteAnimation {
  frames: string[];
  frameDelay: number; // ms between frames
  color: string;
}

const ANIMATIONS: Record<AlertState, SpriteAnimation> = {
  DORMANT: {
    frames: ["[ NO CONTACT ]", "[  NO CONTACT ]", "[NO CONTACT  ]"],
    frameDelay: 2000,
    color: theme.colors.fgMuted,
  },
  DETECTING: {
    frames: ["◯", "◔", "◑", "◕", "●"],
    frameDelay: 150,
    color: theme.colors.warning,
  },
  ALERT: {
    frames: [
      "  ╱ ▲ ╲  ",
      " ╱  ▲  ╲ ",
      "╱   ▲   ╲",
      "╲   ▲   ╱",
      " ╲  ▲  ╱ ",
      "  ╲ ▲ ╱  ",
    ],
    frameDelay: 80,
    color: theme.colors.error,
  },
  COOLDOWN: {
    frames: ["...", ".. ", ".  ", "   ", ".  ", ".. "],
    frameDelay: 200,
    color: theme.colors.fgMuted,
  },
};

const STATE_LABELS: Record<AlertState, string> = {
  DORMANT: "STANDBY",
  DETECTING: "SCANNING",
  ALERT: "CONTACT!",
  COOLDOWN: "CLEARING",
};

export function createProximityAlertPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container - flexible width
  const container = new BoxRenderable(renderer, {
    id: "proximity-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    overflow: "hidden",
    // Removed fixed width: 18 - now uses flexGrow in index.ts
  });

  // Title bar
  const titleBar = new BoxRenderable(renderer, {
    id: "prox-title-bar",
    flexDirection: "row",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "prox-title",
    content: t`${bold(fg(theme.colors.fg)("PROXIMITY"))}`,
  });

  titleBar.add(title);

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "prox-content",
    flexDirection: "column",
    padding: 1,
    alignItems: "center",
    gap: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Status label
  const statusLabel = new TextRenderable(renderer, {
    id: "prox-status",
    content: "STANDBY",
    fg: theme.colors.fgMuted,
  });

  // Animation display (centered)
  const animDisplay = new TextRenderable(renderer, {
    id: "prox-anim",
    content: "[ NO CONTACT ]",
    fg: theme.colors.fgMuted,
  });

  // Distance indicator
  const distanceDisplay = new TextRenderable(renderer, {
    id: "prox-distance",
    content: "DIST: ---",
    fg: theme.colors.fgMuted,
  });

  content.add(statusLabel);
  content.add(animDisplay);
  content.add(distanceDisplay);

  container.add(titleBar);
  container.add(content);

  // State machine
  let currentState: AlertState = "DORMANT";
  let currentFrame = 0;
  let lastFrameTime = 0;
  let anomalyData: { angle: number; distance: number } | null = null;
  let stateEndTime = 0;

  // Subscribe to anomaly events
  nostromoEvents.on("anomalyDetected", (data) => {
    anomalyData = data;
    setState("DETECTING");

    // Schedule state transitions
    setTimeout(() => setState("ALERT"), 600);
    setTimeout(() => setState("COOLDOWN"), 3500);
    setTimeout(() => {
      setState("DORMANT");
      anomalyData = null;
    }, 5500);
  });

  function setState(newState: AlertState) {
    if (currentState !== newState) {
      currentState = newState;
      currentFrame = 0;
      lastFrameTime = 0;

      // Update status label
      statusLabel.content = STATE_LABELS[newState];
      statusLabel.fg = ANIMATIONS[newState].color;

      // Update border color for emphasis
      if (newState === "ALERT") {
        container.borderColor = theme.colors.error;
      } else if (newState === "DETECTING") {
        container.borderColor = theme.colors.warning;
      } else {
        container.borderColor = theme.colors.border;
      }
    }
  }

  function update(time: number) {
    const anim = ANIMATIONS[currentState];
    const now = Date.now();

    // Advance frame if enough time passed
    if (now - lastFrameTime > anim.frameDelay) {
      currentFrame = (currentFrame + 1) % anim.frames.length;
      lastFrameTime = now;
    }

    // Update animation display
    animDisplay.content = anim.frames[currentFrame];
    animDisplay.fg = anim.color;

    // Update distance display
    if (anomalyData && currentState !== "DORMANT") {
      const dist = Math.floor(anomalyData.distance);
      distanceDisplay.content = `DIST: ${dist}m`;
      distanceDisplay.fg =
        currentState === "ALERT" ? theme.colors.error : theme.colors.warning;
    } else {
      distanceDisplay.content = "DIST: ---";
      distanceDisplay.fg = theme.colors.fgMuted;
    }

    // Flashing effect during ALERT
    if (currentState === "ALERT") {
      const flash = Math.floor(time * 8) % 2 === 0;
      container.backgroundColor = flash
        ? theme.colors.bgHighlight
        : theme.colors.bg;
    } else {
      container.backgroundColor = theme.colors.bg;
    }
  }

  return { container, update };
}
