/**
 * MOTHER Database Panel
 *
 * Features:
 * - Auto-navigating tree view of ship database
 * - Expand/collapse folders automatically
 * - Preview pane showing selected file content
 * - Classification badges (PUBLIC, RESTRICTED, CLASSIFIED)
 * - Easter egg: Eventually reveals SPECIAL ORDER 937
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
import {
  motherDatabase,
  type DatabaseNode,
  getClassificationColor,
} from "../data/database";

const VISIBLE_LINES = 6;

interface TreeState {
  path: string[];
  expandedPaths: Set<string>;
  selectedIndex: number;
  flatList: { node: DatabaseNode; depth: number; path: string }[];
}

export function createMotherDatabasePanel(renderer: CliRenderer): {
  container: BoxRenderable;
  update: (time: number) => void;
} {
  // Panel container
  const container = new BoxRenderable(renderer, {
    id: "mother-panel",
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
    id: "mother-title-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 1,
    paddingRight: 1,
    backgroundColor: theme.colors.bgAlt,
  });

  const title = new TextRenderable(renderer, {
    id: "mother-title",
    content: t`${bold(fg(theme.colors.fg)("MOTHER DATABASE"))}`,
  });

  const accessLevel = new TextRenderable(renderer, {
    id: "mother-access",
    content: "ACCESS: LVL-3",
    fg: theme.colors.accent2,
  });

  titleBar.add(title);
  titleBar.add(accessLevel);

  // Content area - split into tree and preview
  const content = new BoxRenderable(renderer, {
    id: "mother-content",
    flexDirection: "row",
    padding: 1,
    gap: 1,
    flexGrow: 1,
    overflow: "hidden",
  });

  // Tree view
  const treeContainer = new BoxRenderable(renderer, {
    id: "mother-tree",
    flexDirection: "column",
    flexGrow: 1,
  });

  // Tree lines
  const treeLines: TextRenderable[] = [];
  for (let i = 0; i < VISIBLE_LINES; i++) {
    const line = new TextRenderable(renderer, {
      id: `mother-tree-${i}`,
      content: "",
      fg: theme.colors.fg,
    });
    treeLines.push(line);
    treeContainer.add(line);
  }

  // Preview area
  const previewContainer = new BoxRenderable(renderer, {
    id: "mother-preview",
    flexDirection: "column",
    flexGrow: 1,
    borderColor: theme.colors.border,
    border: ["left"],
    paddingLeft: 1,
  });

  const previewTitle = new TextRenderable(renderer, {
    id: "mother-preview-title",
    content: "[SELECT FILE]",
    fg: theme.colors.fgMuted,
  });

  const previewLines: TextRenderable[] = [];
  for (let i = 0; i < VISIBLE_LINES - 1; i++) {
    const line = new TextRenderable(renderer, {
      id: `mother-preview-${i}`,
      content: "",
      fg: theme.colors.fg,
    });
    previewLines.push(line);
    previewContainer.add(line);
  }
  previewContainer.add(previewTitle);

  content.add(treeContainer);
  content.add(previewContainer);

  container.add(titleBar);
  container.add(content);

  // State management
  const state: TreeState = {
    path: [],
    expandedPaths: new Set(["MOTHER"]),
    selectedIndex: 0,
    flatList: [],
  };

  // Flatten the tree based on expanded state
  function rebuildFlatList() {
    state.flatList = [];
    flattenNode(motherDatabase, 0, "");
  }

  function flattenNode(
    node: DatabaseNode,
    depth: number,
    parentPath: string
  ) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    state.flatList.push({ node, depth, path });

    if (
      node.type === "folder" &&
      node.children &&
      state.expandedPaths.has(path)
    ) {
      for (const child of node.children) {
        flattenNode(child, depth + 1, path);
      }
    }
  }

  // Auto-navigation timing
  let lastActionTime = 0;
  let actionQueue: Array<() => void> = [];
  let currentActionIndex = 0;

  // Build a sequence of actions to gradually reveal the database
  function buildActionSequence() {
    actionQueue = [];

    // Start by expanding root folders one by one
    const rootChildren = motherDatabase.children || [];

    for (const child of rootChildren) {
      if (child.type === "folder") {
        const path = `MOTHER/${child.name}`;

        // Move to folder
        actionQueue.push(() => {
          const idx = state.flatList.findIndex((f) => f.path === path);
          if (idx >= 0) state.selectedIndex = idx;
        });

        // Expand folder
        actionQueue.push(() => {
          state.expandedPaths.add(path);
          rebuildFlatList();
        });

        // Browse through some files
        if (child.children) {
          for (let i = 0; i < Math.min(2, child.children.length); i++) {
            const filePath = `${path}/${child.children[i].name}`;
            actionQueue.push(() => {
              const idx = state.flatList.findIndex((f) => f.path === filePath);
              if (idx >= 0) state.selectedIndex = idx;
            });
          }
        }

        // Collapse folder (except COMPANY DIRECTIVES)
        if (child.name !== "COMPANY DIRECTIVES") {
          actionQueue.push(() => {
            state.expandedPaths.delete(path);
            rebuildFlatList();
          });
        }
      }
    }

    // Final sequence: reveal SPECIAL ORDER 937
    actionQueue.push(() => {
      const path = "MOTHER/COMPANY DIRECTIVES";
      state.expandedPaths.add(path);
      rebuildFlatList();
    });

    actionQueue.push(() => {
      const idx = state.flatList.findIndex(
        (f) => f.node.name === "SPECIAL ORDER 937"
      );
      if (idx >= 0) state.selectedIndex = idx;
    });

    // Pause on SPECIAL ORDER 937 for dramatic effect
    for (let i = 0; i < 5; i++) {
      actionQueue.push(() => {}); // No-op, just wait
    }

    // Then continue cycling
    actionQueue.push(() => {
      currentActionIndex = 0; // Loop back
    });
  }

  // Initialize
  rebuildFlatList();
  buildActionSequence();

  function formatTreeLine(
    item: { node: DatabaseNode; depth: number; path: string },
    isSelected: boolean
  ): { text: string; color: string } {
    const indent = "  ".repeat(item.depth);
    const isFolder = item.node.type === "folder";
    const isExpanded = state.expandedPaths.has(item.path);

    let icon: string;
    if (isFolder) {
      icon = isExpanded ? "▼ " : "► ";
    } else {
      icon = "  ";
    }

    let badge = "";
    if (item.node.classification === "CLASSIFIED") {
      badge = " ⚠";
    } else if (item.node.classification === "RESTRICTED") {
      badge = " ◆";
    }

    const name = item.node.name.substring(0, 16);
    const text = `${indent}${icon}${name}${badge}`;

    let color: string;
    if (isSelected) {
      color = theme.colors.accent2;
    } else if (item.node.classification === "CLASSIFIED") {
      color = theme.colors.error;
    } else if (item.node.classification === "RESTRICTED") {
      color = theme.colors.warning;
    } else if (isFolder) {
      color = theme.colors.fg;
    } else {
      color = theme.colors.fgMuted;
    }

    return { text, color };
  }

  function update(time: number) {
    // Execute actions at intervals
    const now = Date.now();
    if (now - lastActionTime > 1500 && currentActionIndex < actionQueue.length) {
      actionQueue[currentActionIndex]();
      currentActionIndex++;
      lastActionTime = now;
    }

    // Calculate scroll offset to keep selected item visible
    const scrollOffset = Math.max(
      0,
      Math.min(
        state.selectedIndex - Math.floor(VISIBLE_LINES / 2),
        state.flatList.length - VISIBLE_LINES
      )
    );

    // Update tree display
    for (let i = 0; i < VISIBLE_LINES; i++) {
      const idx = scrollOffset + i;
      if (idx < state.flatList.length) {
        const item = state.flatList[idx];
        const isSelected = idx === state.selectedIndex;
        const { text, color } = formatTreeLine(item, isSelected);

        const prefix = isSelected ? ">" : " ";
        treeLines[i].content = prefix + text;
        treeLines[i].fg = color;
      } else {
        treeLines[i].content = "";
      }
    }

    // Update preview pane
    const selected = state.flatList[state.selectedIndex];
    if (selected && selected.node.type === "file" && selected.node.content) {
      previewTitle.content = `[${selected.node.name}]`;
      previewTitle.fg = getClassificationColor(
        selected.node.classification,
        theme
      );

      const contentLines = selected.node.content.split("\n");
      for (let i = 0; i < previewLines.length; i++) {
        previewLines[i].content =
          i < contentLines.length ? contentLines[i].substring(0, 20) : "";
        previewLines[i].fg =
          selected.node.classification === "CLASSIFIED"
            ? theme.colors.error
            : theme.colors.fg;
      }
    } else if (selected && selected.node.type === "folder") {
      previewTitle.content = `[${selected.node.name}/]`;
      previewTitle.fg = theme.colors.fg;
      const childCount = selected.node.children?.length || 0;
      previewLines[0].content = `${childCount} ITEMS`;
      previewLines[0].fg = theme.colors.fgMuted;
      for (let i = 1; i < previewLines.length; i++) {
        previewLines[i].content = "";
      }
    }

    // Blinking cursor effect on selected
    const cursorBlink = Math.floor(time * 2) % 2 === 0;
    if (cursorBlink && state.selectedIndex < state.flatList.length) {
      const visibleIdx = state.selectedIndex - scrollOffset;
      if (visibleIdx >= 0 && visibleIdx < VISIBLE_LINES) {
        // Already handled by ">" prefix
      }
    }
  }

  return { container, update };
}
