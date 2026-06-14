/**
 * Example 03: Layout with Flexbox
 *
 * Demonstrates Yoga flexbox layout capabilities:
 * - Row and column directions
 * - Gap spacing
 * - Justify content and align items
 * - Flex grow and shrink
 * - Nested containers
 * - Percentage and fixed widths
 */

import { TextRenderable, BoxRenderable, t, bold, fg } from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";

createExampleApp(({ renderer }) => {
  // Main container - full screen
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
    gap: 1,
  });

  // Title
  const title = new TextRenderable(renderer, {
    id: "title",
    content: t`${bold(fg(theme.colors.accent2)("Flexbox Layout Examples"))}`,
  });

  // Example 1: Row with gap
  const rowExample = new BoxRenderable(renderer, {
    id: "row-example",
    flexDirection: "column",
    gap: 0,
  });

  const rowLabel = new TextRenderable(renderer, {
    id: "row-label",
    content: "Row direction with gap:",
    fg: theme.colors.fgMuted,
  });

  const rowContainer = new BoxRenderable(renderer, {
    id: "row-container",
    flexDirection: "row",
    gap: 2,
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
  });

  ["Item 1", "Item 2", "Item 3"].forEach((text, i) => {
    const item = new BoxRenderable(renderer, {
      id: `row-item-${i}`,
      padding: 1,
      backgroundColor: theme.colors.bgHighlight,
    });
    const itemText = new TextRenderable(renderer, {
      id: `row-item-text-${i}`,
      content: text,
      fg: theme.colors.accent3,
    });
    item.add(itemText);
    rowContainer.add(item);
  });

  rowExample.add(rowLabel);
  rowExample.add(rowContainer);

  // Example 2: Column with justify
  const columnExample = new BoxRenderable(renderer, {
    id: "column-example",
    flexDirection: "column",
    gap: 0,
  });

  const columnLabel = new TextRenderable(renderer, {
    id: "column-label",
    content: "Column direction with space-between:",
    fg: theme.colors.fgMuted,
  });

  const columnContainer = new BoxRenderable(renderer, {
    id: "column-container",
    flexDirection: "column",
    justifyContent: "space-between",
    height: 8,
    width: 30,
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
  });

  ["Top", "Middle", "Bottom"].forEach((text, i) => {
    const item = new TextRenderable(renderer, {
      id: `column-item-${i}`,
      content: text,
      fg: theme.colors.accent4,
    });
    columnContainer.add(item);
  });

  columnExample.add(columnLabel);
  columnExample.add(columnContainer);

  // Example 3: Flex grow
  const growExample = new BoxRenderable(renderer, {
    id: "grow-example",
    flexDirection: "column",
    gap: 0,
  });

  const growLabel = new TextRenderable(renderer, {
    id: "grow-label",
    content: "Flex grow (1:2:1 ratio):",
    fg: theme.colors.fgMuted,
  });

  const growContainer = new BoxRenderable(renderer, {
    id: "grow-container",
    flexDirection: "row",
    width: 60,
    padding: 1,
    gap: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
  });

  const growConfigs = [
    { flex: 1, color: theme.colors.accent1 },
    { flex: 2, color: theme.colors.accent2 },
    { flex: 1, color: theme.colors.accent3 },
  ];

  growConfigs.forEach((config, i) => {
    const item = new BoxRenderable(renderer, {
      id: `grow-item-${i}`,
      flexGrow: config.flex,
      padding: 1,
      backgroundColor: theme.colors.bgHighlight,
      justifyContent: "center",
      alignItems: "center",
    });
    const itemText = new TextRenderable(renderer, {
      id: `grow-item-text-${i}`,
      content: `Flex ${config.flex}`,
      fg: config.color,
    });
    item.add(itemText);
    growContainer.add(item);
  });

  growExample.add(growLabel);
  growExample.add(growContainer);

  // Example 4: Nested layout (sidebar + content)
  const nestedExample = new BoxRenderable(renderer, {
    id: "nested-example",
    flexDirection: "column",
    gap: 0,
  });

  const nestedLabel = new TextRenderable(renderer, {
    id: "nested-label",
    content: "Nested layout (sidebar + content):",
    fg: theme.colors.fgMuted,
  });

  const nestedContainer = new BoxRenderable(renderer, {
    id: "nested-container",
    flexDirection: "row",
    width: 60,
    height: 10,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
  });

  // Sidebar
  const sidebar = new BoxRenderable(renderer, {
    id: "sidebar",
    width: 15,
    flexDirection: "column",
    padding: 1,
    backgroundColor: theme.colors.bgAlt,
    border: ["right"],
    borderColor: theme.colors.border,
  });

  const sidebarTitle = new TextRenderable(renderer, {
    id: "sidebar-title",
    content: t`${bold(fg(theme.colors.accent5)("Sidebar"))}`,
  });
  sidebar.add(sidebarTitle);

  ["Nav 1", "Nav 2", "Nav 3"].forEach((text, i) => {
    const navItem = new TextRenderable(renderer, {
      id: `nav-${i}`,
      content: `> ${text}`,
      fg: theme.colors.fgMuted,
    });
    sidebar.add(navItem);
  });

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "content",
    flexGrow: 1,
    flexDirection: "column",
    padding: 1,
  });

  const contentTitle = new TextRenderable(renderer, {
    id: "content-title",
    content: t`${bold(fg(theme.colors.accent6)("Main Content"))}`,
  });

  const contentBody = new TextRenderable(renderer, {
    id: "content-body",
    content: "This area grows to fill available space.",
    fg: theme.colors.fg,
  });

  content.add(contentTitle);
  content.add(contentBody);

  nestedContainer.add(sidebar);
  nestedContainer.add(content);

  nestedExample.add(nestedLabel);
  nestedExample.add(nestedContainer);

  // Instructions
  const instructions = new TextRenderable(renderer, {
    id: "instructions",
    content: "Press q or Ctrl+C to exit",
    fg: theme.colors.fgMuted,
    marginTop: 1,
  });

  // Build component tree
  main.add(title);
  main.add(rowExample);
  main.add(columnExample);
  main.add(growExample);
  main.add(nestedExample);
  main.add(instructions);
  renderer.root.add(main);
});
