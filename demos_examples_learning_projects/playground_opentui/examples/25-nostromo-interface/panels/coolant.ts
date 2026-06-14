/**
 * Coolant Flow Panel
 *
 * Features:
 * - ASCII pipe layout with flowing particles
 * - Particles animate through pipe segments
 * - Temperature-based coloring (cyan → green → amber → red)
 * - Shows coolant circulation through reactor system
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

// Pipe layout (text-based for simplicity)
const PIPE_WIDTH = 18;
const PIPE_HEIGHT = 10;

interface Particle {
  segment: number; // Current pipe segment (0-5)
  progress: number; // 0-1 within segment
  temperature: number; // 0-1
}

// Pipe segments define the flow path
interface PipeSegment {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  char: string;
}

const PIPE_SEGMENTS: PipeSegment[] = [
  { startX: 2, startY: 1, endX: 8, endY: 1, char: "═" }, // Top intake
  { startX: 8, startY: 1, endX: 8, endY: 4, char: "║" }, // Down to reactor
  { startX: 8, startY: 4, endX: 8, endY: 7, char: "║" }, // Through reactor
  { startX: 8, startY: 7, endX: 2, endY: 7, char: "═" }, // Bottom away
  { startX: 2, startY: 7, endX: 2, endY: 4, char: "║" }, // Up return
  { startX: 2, startY: 4, endX: 2, endY: 1, char: "║" }, // Back to top
];

export function createCoolantPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "coolant-panel",
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
    id: "coolant-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "coolant-title",
    content: t`${bold(fg(theme.colors.fg)("COOLANT FLOW"))}`,
  });

  const flowRate = new TextRenderable(renderer, {
    id: "coolant-rate",
    content: "42 L/S",
    fg: theme.colors.success,
  });

  titleBar.add(title);
  titleBar.add(flowRate);

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "coolant-content",
    flexDirection: "column",
    padding: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // ASCII display lines
  const displayLines: TextRenderable[] = [];
  for (let i = 0; i < PIPE_HEIGHT; i++) {
    const line = new TextRenderable(renderer, {
      id: `coolant-line-${i}`,
      content: "",
      fg: theme.colors.fg,
    });
    displayLines.push(line);
    content.add(line);
  }

  // Temperature legend
  const legend = new TextRenderable(renderer, {
    id: "coolant-legend",
    content: "FLOW NOMINAL".padEnd(12),
    fg: theme.colors.fgMuted,
  });
  content.add(legend);

  container.add(titleBar);
  container.add(content);

  // Initialize particles - increased count for denser flow
  const particles: Particle[] = [];
  for (let i = 0; i < 12; i++) {  // Increased from 8 to 12
    particles.push({
      segment: i % PIPE_SEGMENTS.length,
      progress: (i * 0.083) % 1,  // Adjusted for 12 particles
      temperature: 0.2,
    });
  }

  // Base pipe layout - with direction arrows for flow visibility
  const basePipe = [
    "   ╔══►════╗   ",  // Arrow showing flow direction
    " ╔═╝ INTAKE╚═╗ ",
    " ▲           ▼ ",  // Vertical flow indicators
    " ║  ┌─────┐  ║ ",
    " ║  │REACT│  ║ ",
    " ║  │ OR  │  ║ ",
    " ║  └─────┘  ║ ",
    " ╚══◄══════╝  ",  // Arrow showing return flow
    "   ▼ OUTPUT ▼  ",  // Exit indicators
  ];

  // 6-color temperature gradient (blue cold → red hot)
  function getTemperatureColor(temp: number): string {
    if (temp < 0.15) return theme.colors.accent5; // Blue - very cold
    if (temp < 0.3) return theme.colors.accent2; // Cyan - cold
    if (temp < 0.5) return theme.colors.success; // Green - nominal
    if (temp < 0.7) return theme.colors.warning; // Amber - warm
    if (temp < 0.85) return theme.colors.accent4; // Orange - hot
    return theme.colors.error; // Red - critical
  }

  function getParticlePosition(
    segment: number,
    progress: number
  ): { x: number; y: number } {
    // Coordinates matching the basePipe layout:
    // Line 0: "   ╔══►════╗   "  - top pipe at x: 3-11
    // Lines 2-6: left ║ at x=1, right ║ at x=13
    // Line 7: " ╚══◄══════╝  "  - bottom pipe at x: 1-11
    const positions = [
      // Segment 0: Top horizontal (left to right), y=0, x: 3→11
      { x: 3 + Math.floor(progress * 8), y: 0 },
      // Segment 1: Right vertical (upper), x=13, y: 2→4
      { x: 13, y: 2 + Math.floor(progress * 2) },
      // Segment 2: Right vertical (lower through reactor), x=13, y: 4→6
      { x: 13, y: 4 + Math.floor(progress * 2) },
      // Segment 3: Bottom horizontal (right to left), y=7, x: 11→1
      { x: 11 - Math.floor(progress * 10), y: 7 },
      // Segment 4: Left vertical (bottom up, lower), x=1, y: 6→4
      { x: 1, y: 6 - Math.floor(progress * 2) },
      // Segment 5: Left vertical (up to top), x=1, y: 4→2
      { x: 1, y: 4 - Math.floor(progress * 2) },
    ];

    return positions[segment] || positions[0];
  }

  function update(time: number) {
    // Update particles
    const speed = 0.02;
    particles.forEach((p) => {
      p.progress += speed;
      if (p.progress >= 1) {
        p.progress = 0;
        p.segment = (p.segment + 1) % PIPE_SEGMENTS.length;
      }

      // Temperature: heats up in reactor segments (2-3), cools elsewhere
      if (p.segment === 2 || p.segment === 3) {
        p.temperature = Math.min(1, p.temperature + 0.03);
      } else {
        p.temperature = Math.max(0.1, p.temperature - 0.02);
      }
    });

    // Build display grid
    const grid: string[][] = basePipe.map((line) => line.split(""));
    const colors: (string | null)[][] = basePipe.map((line) =>
      line.split("").map(() => null)
    );

    // Place particles on grid - using larger character for visibility
    particles.forEach((p) => {
      const pos = getParticlePosition(p.segment, p.progress);
      if (pos.y >= 0 && pos.y < grid.length && pos.x >= 0 && pos.x < 16) {
        grid[pos.y][pos.x] = "◉";  // Larger filled circle for better visibility
        colors[pos.y][pos.x] = getTemperatureColor(p.temperature);
      }
    });

    // Render to display lines
    for (let y = 0; y < Math.min(displayLines.length, grid.length); y++) {
      // For simplicity, we'll use the base color and just show the grid
      // In a real implementation, we'd need per-character coloring
      displayLines[y].content = grid[y].join("");

      // Use the color of the first particle on this line, if any
      const particleOnLine = particles.find((p) => {
        const pos = getParticlePosition(p.segment, p.progress);
        return pos.y === y;
      });

      if (particleOnLine) {
        // Tint the entire line based on particle temperature
        const avgTemp =
          particles
            .filter((p) => {
              const pos = getParticlePosition(p.segment, p.progress);
              return pos.y === y;
            })
            .reduce((sum, p) => sum + p.temperature, 0) / particles.length;
        displayLines[y].fg = getTemperatureColor(avgTemp);
      } else {
        displayLines[y].fg = theme.colors.fg;
      }
    }

    // Update flow rate (oscillate slightly)
    const rate = 42 + Math.sin(time * 0.5) * 3;
    flowRate.content = `${rate.toFixed(0)} L/S`;

    // Update legend with current average temp (padded to fixed width)
    const avgTemp =
      particles.reduce((sum, p) => sum + p.temperature, 0) / particles.length;
    if (avgTemp > 0.6) {
      legend.content = "⚠ TEMP HIGH ".padEnd(12);
      legend.fg = theme.colors.warning;
    } else {
      legend.content = "FLOW NOMINAL".padEnd(12);
      legend.fg = theme.colors.success;
    }
  }

  return { container, update };
}
