/**
 * Example 05: Scrolling
 *
 * Demonstrates ScrollBoxRenderable capabilities:
 * - Virtual scrolling with 10,000+ items
 * - Smooth scroll navigation
 * - Scroll indicators
 * - Performance with large lists
 */

import {
  TextRenderable,
  BoxRenderable,
  ScrollBoxRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer }) => {
  const TOTAL_ITEMS = 10000;
  let selectedIndex = 0;

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
    title: "Scrolling Example - 10,000 Items",
    rightContent: `Item 1 of ${TOTAL_ITEMS}`,
  });

  // Scroll container with content
  const scrollContainer = new BoxRenderable(renderer, {
    id: "scroll-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    overflow: "hidden",
  });

  const scrollBox = new ScrollBoxRenderable(renderer, {
    id: "scroll-box",
    width: "100%",
    height: "100%",
    scrollbarOptions: {
      visible: true,
      trackOptions: {
        foregroundColor: theme.colors.accent3,
        backgroundColor: theme.colors.bgHighlight,
      },
    },
  });

  // Content container inside scroll box
  const content = new BoxRenderable(renderer, {
    id: "content",
    flexDirection: "column",
    width: "100%",
  });

  // Generate items
  const items: TextRenderable[] = [];

  function generateItemContent(index: number): string {
    const types = ["Task", "Note", "Event", "Reminder", "Log"];
    const type = types[index % types.length];
    const priority = ["Low", "Medium", "High"][index % 3];
    return `${index + 1}. [${type}] Item #${index + 1} - Priority: ${priority}`;
  }

  function getItemColor(index: number): string {
    if (index === selectedIndex) {
      return theme.colors.bg;
    }
    const colors = [
      theme.colors.fg,
      theme.colors.accent3,
      theme.colors.accent4,
      theme.colors.accent5,
      theme.colors.accent6,
    ];
    return colors[index % colors.length];
  }

  function getItemBgColor(index: number): string | undefined {
    if (index === selectedIndex) {
      return theme.colors.accent2;
    }
    return undefined;
  }

  // Create all items (virtual scrolling handles performance)
  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const item = new TextRenderable(renderer, {
      id: `item-${i}`,
      content: generateItemContent(i),
      fg: getItemColor(i),
      bg: getItemBgColor(i),
      width: "100%",
    });
    items.push(item);
    content.add(item);
  }

  scrollBox.add(content);
  scrollContainer.add(scrollBox);

  // Update selection display
  function updateSelection(newIndex: number) {
    const oldIndex = selectedIndex;
    selectedIndex = Math.max(0, Math.min(TOTAL_ITEMS - 1, newIndex));

    // Update old item
    if (oldIndex !== selectedIndex && items[oldIndex]) {
      items[oldIndex].fg = getItemColor(oldIndex);
      items[oldIndex].bg = undefined;
    }

    // Update new item
    if (items[selectedIndex]) {
      items[selectedIndex].fg = theme.colors.bg;
      items[selectedIndex].bg = theme.colors.accent2;
    }

    // Update counter
    header.setRightContent(`Item ${selectedIndex + 1} of ${TOTAL_ITEMS}`);

    // Scroll to keep selection visible (assuming 1 line per item)
    scrollBox.scrollTo({ x: 0, y: selectedIndex });
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "↑/k", action: "Up" },
      { key: "↓/j", action: "Down" },
      { key: "PgUp", action: "Page up" },
      { key: "PgDn", action: "Page down" },
      { key: "Home", action: "First" },
      { key: "End", action: "Last" },
      { key: "g", action: "Go to..." },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(scrollContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Handle keyboard navigation
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "up":
      case "k":
        updateSelection(selectedIndex - 1);
        break;
      case "down":
      case "j":
        updateSelection(selectedIndex + 1);
        break;
      case "pageup":
        updateSelection(selectedIndex - 20);
        break;
      case "pagedown":
        updateSelection(selectedIndex + 20);
        break;
      case "home":
        updateSelection(0);
        break;
      case "end":
        updateSelection(TOTAL_ITEMS - 1);
        break;
      case "g":
        // Jump to specific index (simplified - jumps to middle)
        updateSelection(Math.floor(TOTAL_ITEMS / 2));
        break;
    }
  });

  // Initial selection
  updateSelection(0);
});
