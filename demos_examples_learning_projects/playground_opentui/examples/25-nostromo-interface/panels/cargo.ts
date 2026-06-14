/**
 * Cargo Manifest Panel
 *
 * Features:
 * - Auto-scrolling list of cargo containers
 * - Columns: ID, CONTENTS, TONNAGE, STATUS
 * - Status badges with color coding
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
import { cargoManifest, totalTonnage, hazmatCount } from "../data/cargo";

const VISIBLE_ROWS = 8;

export function createCargoPanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "cargo-panel",
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
    id: "cargo-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "cargo-title",
    content: t`${bold(fg(theme.colors.fg)("CARGO MANIFEST"))}`,
  });

  const totalDisplay = new TextRenderable(renderer, {
    id: "cargo-total",
    content: `${Math.floor(totalTonnage / 1000)}KT`,
    fg: theme.colors.fgMuted,
  });

  titleBar.add(title);
  titleBar.add(totalDisplay);

  // Column headers
  const headerRow = new BoxRenderable(renderer, {
    id: "cargo-header",
    flexDirection: "row",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgHighlight,
  });

  const headerContent = new TextRenderable(renderer, {
    id: "cargo-header-text",
    content: "ID        CONTENTS         TONS    STATUS",
    fg: theme.colors.fgMuted,
  });

  headerRow.add(headerContent);

  // Cargo list area
  const listArea = new BoxRenderable(renderer, {
    id: "cargo-list",
    flexDirection: "column",
    padding: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Create visible row renderables
  const rowDisplays: TextRenderable[] = [];
  for (let i = 0; i < VISIBLE_ROWS; i++) {
    const row = new TextRenderable(renderer, {
      id: `cargo-row-${i}`,
      content: "",
      fg: theme.colors.fg,
    });
    rowDisplays.push(row);
    listArea.add(row);
  }

  // Footer with stats
  const footer = new BoxRenderable(renderer, {
    id: "cargo-footer",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const itemCount = new TextRenderable(renderer, {
    id: "cargo-count",
    content: `${cargoManifest.length} CONTAINERS`,
    fg: theme.colors.fgMuted,
  });

  const hazmatDisplay = new TextRenderable(renderer, {
    id: "cargo-hazmat",
    content: `${hazmatCount} HAZ`,
    fg: theme.colors.warning,
  });

  footer.add(itemCount);
  footer.add(hazmatDisplay);

  container.add(titleBar);
  container.add(headerRow);
  container.add(listArea);
  container.add(footer);

  // Scroll state
  let scrollOffset = 0;
  let lastScrollTime = 0;

  function formatCargoRow(item: typeof cargoManifest[0]): { text: string; color: string } {
    const id = item.id.padEnd(10);
    const contents = item.contents.substring(0, 16).padEnd(16);
    const tonnage = item.tonnage.toString().padStart(6);

    let statusText: string;
    let statusColor: string;

    switch (item.status) {
      case "HAZ":
        statusText = "[HAZ]";
        statusColor = theme.colors.warning;
        break;
      case "SECURE":
        statusText = "[SEC]";
        statusColor = theme.colors.accent2;
        break;
      case "QUARANTINE":
        statusText = "[QTN]";
        statusColor = theme.colors.error;
        break;
      default:
        statusText = "[ OK]";
        statusColor = theme.colors.success;
    }

    return {
      text: `${id}${contents}${tonnage}  ${statusText}`,
      color: statusColor,
    };
  }

  function update(time: number) {
    // Auto-scroll every 2 seconds
    if (time - lastScrollTime > 2) {
      scrollOffset = (scrollOffset + 1) % cargoManifest.length;
      lastScrollTime = time;
    }

    // Update visible rows
    rowDisplays.forEach((display, i) => {
      const dataIndex = (scrollOffset + i) % cargoManifest.length;
      const item = cargoManifest[dataIndex];
      const { text, color } = formatCargoRow(item);

      display.content = text;

      // Highlight hazmat rows
      if (item.status === "HAZ") {
        display.fg = theme.colors.warning;
      } else if (item.status === "SECURE") {
        display.fg = theme.colors.accent2;
      } else {
        display.fg = theme.colors.fg;
      }
    });
  }

  return { container, update };
}
