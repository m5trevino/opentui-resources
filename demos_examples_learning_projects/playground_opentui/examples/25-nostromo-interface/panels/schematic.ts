/**
 * Ship Schematic Panel
 *
 * Features:
 * - ASCII wireframe cross-section of Nostromo
 * - Blinking subsystem indicators
 * - Section labels
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

// Multi-state status system (matching reference aesthetic)
type SectionStatus = "NOMINAL" | "DIAGNOSTIC" | "CAUTION" | "STANDBY" | "ALERT";

interface ShipSection {
  name: string;
  status: SectionStatus;
}

// Status colors and symbols - larger/more visible symbols for better contrast
const STATUS_CONFIG: Record<SectionStatus, { color: string; symbol: string }> = {
  NOMINAL: { color: "#33ff33", symbol: "●" }, // Green - filled circle (was ✓)
  DIAGNOSTIC: { color: "#3399ff", symbol: "◆" }, // Blue - scanning
  CAUTION: { color: "#ffaa00", symbol: "▲" }, // Amber - warning triangle (was ⚠)
  STANDBY: { color: "#4a8aaa", symbol: "○" }, // Muted cyan - inactive
  ALERT: { color: "#ff3333", symbol: "█" }, // Red - solid block (was ✗)
};

const shipSections: ShipSection[] = [
  { name: "BRIDGE", status: "NOMINAL" },
  { name: "CREW", status: "NOMINAL" },
  { name: "MEDICAL", status: "STANDBY" },
  { name: "ENGINE", status: "NOMINAL" },
  { name: "CARGO", status: "NOMINAL" },
  { name: "CRYO", status: "DIAGNOSTIC" },
];

// ASCII art of Nostromo (simplified top-down schematic)
const SCHEMATIC_ART = [
  "           ╱═══════╲           ",
  "      ╱═══╱ BRIDGE  ╲═══╲      ",
  "    ╱═════╲═════════╱═════╲    ",
  "   ║ CREW  ═════  MEDICAL  ║   ",
  "   ╠═══════════╬═══════════╣   ",
  "   ║  ENGINE   ║    CARGO  ║   ",
  "   ╠═══════════╬═══════════╣   ",
  "   ║         CRYO          ║   ",
  "    ╲═════════════════════╱    ",
  "      ╲═══════════════╱        ",
];

export function createSchematicPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "schematic-panel",
    flexDirection: "column",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 0,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Title bar
  const titleBar = new BoxRenderable(renderer, {
    id: "schem-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "schem-title",
    content: t`${bold(fg(theme.colors.fg)("SHIP SCHEMATIC"))}`,
  });

  const deckLabel = new TextRenderable(renderer, {
    id: "schem-deck",
    content: "DECK A",
    fg: theme.colors.fgMuted,
  });

  titleBar.add(title);
  titleBar.add(deckLabel);

  // Schematic display area
  const schematicArea = new BoxRenderable(renderer, {
    id: "schem-area",
    flexDirection: "column",
    padding: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // ASCII art lines
  const schematicLines: TextRenderable[] = SCHEMATIC_ART.map((line, i) => {
    const text = new TextRenderable(renderer, {
      id: `schem-line-${i}`,
      content: line,
      fg: theme.colors.fg,
    });
    schematicArea.add(text);
    return text;
  });

  // Status indicators row
  const statusBar = new BoxRenderable(renderer, {
    id: "schem-status-bar",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    paddingLeft: 1,
    paddingRight: 1,
    paddingTop: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  interface SectionIndicator {
    text: TextRenderable;
    section: ShipSection;
  }

  const indicators: SectionIndicator[] = shipSections.map((section, i) => {
    const indicator = new TextRenderable(renderer, {
      id: `schem-ind-${i}`,
      content: `● ${section.name.padEnd(7)}`,
      fg: theme.colors.success,
    });
    statusBar.add(indicator);
    return { text: indicator, section };
  });

  container.add(titleBar);
  container.add(schematicArea);
  container.add(statusBar);

  // Highlight state
  let highlightedSection = 0;
  let blinkState = true;
  let lastStatusChange = 0;

  // Weighted random status selection (mostly nominal)
  function getRandomStatus(): SectionStatus {
    const rand = Math.random() * 100;
    if (rand < 70) return "NOMINAL";
    if (rand < 85) return "DIAGNOSTIC";
    if (rand < 92) return "STANDBY";
    if (rand < 98) return "CAUTION";
    return "ALERT"; // Rare
  }

  function highlightSection(sectionName: string, lines: TextRenderable[]) {
    // Highlight the section in the schematic - high contrast approach
    lines.forEach((line, i) => {
      // Check original ASCII art for section name
      if (SCHEMATIC_ART[i] && SCHEMATIC_ART[i].includes(sectionName)) {
        line.fg = theme.colors.accent6; // Bright green highlight (was accent2 cyan)
      } else {
        line.fg = theme.colors.fgMuted; // Dim non-highlighted sections (was fg)
      }
    });
  }

  function update(time: number) {
    // Blink indicators (every 500ms)
    const newBlinkState = Math.floor(time * 2) % 2 === 0;
    if (newBlinkState !== blinkState) {
      blinkState = newBlinkState;
    }

    // Cycle highlighted section (every 3 seconds)
    const newHighlight = Math.floor(time / 3) % shipSections.length;
    if (newHighlight !== highlightedSection) {
      highlightedSection = newHighlight;
      highlightSection(shipSections[highlightedSection].name, schematicLines);
    }

    // Occasionally change a section's status (every 10-20 seconds)
    if (time - lastStatusChange > 10 + Math.random() * 10) {
      lastStatusChange = time;
      const randomSection = Math.floor(Math.random() * shipSections.length);
      shipSections[randomSection].status = getRandomStatus();
    }

    // Update indicators with multi-state coloring (padded to fixed width)
    indicators.forEach((ind, i) => {
      const isHighlighted = i === highlightedSection;
      const config = STATUS_CONFIG[ind.section.status];
      const paddedName = ind.section.name.padEnd(7);

      if (isHighlighted && blinkState) {
        // Highlighted section uses bright green and arrow indicator
        ind.text.fg = theme.colors.accent6;
        ind.text.content = `▶ ${paddedName}`;
      } else {
        // Use status-specific color and symbol
        ind.text.fg = config.color;
        ind.text.content = `${config.symbol} ${paddedName}`;
      }
    });
  }

  return { container, update };
}
