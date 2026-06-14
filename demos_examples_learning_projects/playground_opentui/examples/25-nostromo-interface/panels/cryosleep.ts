/**
 * Cryosleep Pods Panel
 *
 * Features:
 * - 7 crew pods in a grid
 * - Animated heartbeat waveforms
 * - Crew names and status
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
import { crew } from "../data/crew";

// Heartbeat waveform characters (simplified ECG pattern)
const HEARTBEAT_CHARS = ["_", "_", "‾", "│", "‾", "_", "_", "_"];

// Per-crew color differentiation - 7 UNIQUE hues for visual distinction
const CREW_COLORS: Record<string, { normal: string; pulse: string }> = {
  DALLAS: { normal: "#33ff33", pulse: "#88ff88" }, // Captain - bright green
  RIPLEY: { normal: "#00ffff", pulse: "#88ffff" }, // Protagonist - bright cyan
  KANE: { normal: "#ffaa00", pulse: "#ffdd44" }, // Amber - foreshadowing
  LAMBERT: { normal: "#ff66ff", pulse: "#ffaaff" }, // Magenta - distinct
  BRETT: { normal: "#66ff66", pulse: "#aaffaa" }, // Lime green - slightly different
  PARKER: { normal: "#ffff00", pulse: "#ffff88" }, // Yellow - distinct
  ASH: { normal: "#6699ff", pulse: "#99bbff" }, // Bright blue - synthetic
};

export function createCryosleepPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "cryo-panel",
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
    id: "cryo-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "cryo-title",
    content: t`${bold(fg(theme.colors.fg)("CRYOSLEEP PODS"))}`,
  });

  const status = new TextRenderable(renderer, {
    id: "cryo-status",
    content: "7/7 STABLE",
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(status);

  // Pods container - 2 rows
  const podsContainer = new BoxRenderable(renderer, {
    id: "cryo-pods",
    flexDirection: "column",
    padding: 1,
    gap: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Top row - 4 pods
  const topRow = new BoxRenderable(renderer, {
    id: "cryo-top-row",
    flexDirection: "row",
    gap: 1,
  });

  // Bottom row - 3 pods
  const bottomRow = new BoxRenderable(renderer, {
    id: "cryo-bottom-row",
    flexDirection: "row",
    gap: 1,
  });

  interface PodDisplay {
    heartbeat: TextRenderable;
    name: TextRenderable;
    crewName: string;
    phase: number;
  }

  const podDisplays: PodDisplay[] = [];

  crew.forEach((member, i) => {
    // Get crew-specific colors
    const colors = CREW_COLORS[member.name.toUpperCase()] || {
      normal: theme.colors.success,
      pulse: theme.colors.accent2,
    };

    const pod = new BoxRenderable(renderer, {
      id: `cryo-pod-${i}`,
      flexDirection: "column",
      border: true,
      borderStyle: "single",
      borderColor: theme.colors.border,
      padding: 0,
      width: 12,
    });

    // Heartbeat line (crew-specific color)
    const heartbeat = new TextRenderable(renderer, {
      id: `cryo-heartbeat-${i}`,
      content: "──♡──────",
      fg: colors.normal,
    });

    // Name (crew-specific color)
    const name = new TextRenderable(renderer, {
      id: `cryo-name-${i}`,
      content: member.name.substring(0, 10).padEnd(10),
      fg: colors.normal,
    });

    // Status
    const statusText = new TextRenderable(renderer, {
      id: `cryo-member-status-${i}`,
      content: "STABLE",
      fg: theme.colors.fgMuted,
    });

    pod.add(heartbeat);
    pod.add(name);
    pod.add(statusText);

    // Add to appropriate row
    if (i < 4) {
      topRow.add(pod);
    } else {
      bottomRow.add(pod);
    }

    podDisplays.push({
      heartbeat,
      name,
      crewName: member.name.toUpperCase(),
      phase: i * 0.7, // Offset phase for variety
    });
  });

  podsContainer.add(topRow);
  podsContainer.add(bottomRow);

  container.add(titleBar);
  container.add(podsContainer);

  // Generate heartbeat waveform string
  function generateHeartbeat(time: number, phase: number, width: number): string {
    const period = 2.0; // seconds per beat
    const beatPosition = ((time + phase) % period) / period;
    const beatIndex = Math.floor(beatPosition * width);

    let waveform = "";
    for (let i = 0; i < width; i++) {
      const distFromBeat = Math.abs(i - beatIndex);
      if (distFromBeat === 0) {
        waveform += "♡";
      } else if (distFromBeat === 1) {
        waveform += "‾";
      } else if (distFromBeat === 2) {
        waveform += "─";
      } else {
        waveform += "─";
      }
    }
    return waveform;
  }

  function update(time: number) {
    podDisplays.forEach((display, i) => {
      const waveform = generateHeartbeat(time, display.phase, 10);
      display.heartbeat.content = waveform;

      // Get crew-specific colors
      const colors = CREW_COLORS[display.crewName] || {
        normal: theme.colors.success,
        pulse: theme.colors.accent2,
      };

      // Color pulse on heartbeat (crew-specific) - increased duration for visibility
      const period = 2.0;
      const beatPosition = ((time + display.phase) % period) / period;
      if (beatPosition < 0.25) {  // Increased from 0.15 to 0.25 (25% of cycle)
        display.heartbeat.fg = colors.pulse;
        display.name.fg = colors.pulse;  // Also pulse the name for better visibility
      } else {
        display.heartbeat.fg = colors.normal;
        display.name.fg = colors.normal;
      }
    });
  }

  return { container, update };
}
