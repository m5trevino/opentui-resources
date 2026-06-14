/**
 * Example 12: Mouse Interactions
 *
 * Demonstrates mouse event handling:
 * - Click detection
 * - Hover effects
 * - Drag and drop
 * - Z-index layering
 */

import {
  TextRenderable,
  BoxRenderable,
  type MouseEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer, addTimeout }) => {
  // State
  let clickCount = 0;
  let draggedBox: BoxRenderable | null = null;
  let dragOffset = { x: 0, y: 0 };

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 1,
  });

  // Header
  const header = createHeader(renderer, {
    theme,
    title: "Mouse Interactions",
    rightContent: "Clicks: 0",
    rightColor: theme.colors.accent5,
  });

  // Interactive area
  const interactiveArea = new BoxRenderable(renderer, {
    id: "interactive-area",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    position: "relative",
  });

  // Clickable button
  const clickButton = new BoxRenderable(renderer, {
    id: "click-button",
    width: 20,
    height: 3,
    position: "absolute",
    left: 5,
    top: 2,
    backgroundColor: theme.colors.accent2,
    justifyContent: "center",
    alignItems: "center",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.borderFocused,
    onMouseDown: () => {
      clickCount++;
      header.setRightContent(`Clicks: ${clickCount}`);
      // Flash effect
      clickButton.backgroundColor = theme.colors.accent1;
      const timeout = setTimeout(() => {
        clickButton.backgroundColor = theme.colors.accent2;
      }, 100);
      addTimeout(timeout);
    },
    onMouseOver: () => {
      clickButton.backgroundColor = theme.colors.accent3;
    },
    onMouseOut: () => {
      clickButton.backgroundColor = theme.colors.accent2;
    },
  });

  const buttonText = new TextRenderable(renderer, {
    id: "button-text",
    content: t`${bold(fg(theme.colors.bg)("Click Me!"))}`,
  });

  clickButton.add(buttonText);

  // Hover area
  const hoverText = new TextRenderable(renderer, {
    id: "hover-text",
    content: "Hover over me",
    fg: theme.colors.fgMuted,
  });

  const hoverArea = new BoxRenderable(renderer, {
    id: "hover-area",
    width: 25,
    height: 5,
    position: "absolute",
    left: 30,
    top: 2,
    backgroundColor: theme.colors.bg,
    justifyContent: "center",
    alignItems: "center",
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
    onMouseOver: () => {
      hoverArea.backgroundColor = theme.colors.bgHighlight;
      hoverArea.borderColor = theme.colors.accent4;
      hoverText.content = "Hovering!";
      hoverText.fg = theme.colors.accent4;
    },
    onMouseOut: () => {
      hoverArea.backgroundColor = theme.colors.bg;
      hoverArea.borderColor = theme.colors.border;
      hoverText.content = "Hover over me";
      hoverText.fg = theme.colors.fgMuted;
    },
  });

  hoverArea.add(hoverText);

  // Draggable boxes
  const draggableColors = [
    theme.colors.accent1,
    theme.colors.accent3,
    theme.colors.accent5,
  ];

  const draggableBoxes: BoxRenderable[] = [];

  draggableColors.forEach((color, i) => {
    const box = new BoxRenderable(renderer, {
      id: `draggable-${i}`,
      width: 12,
      height: 4,
      position: "absolute",
      left: 5 + i * 15,
      top: 10 + i * 2,
      backgroundColor: color,
      justifyContent: "center",
      alignItems: "center",
      border: true,
      borderStyle: "rounded",
      borderColor: theme.colors.fg,
      zIndex: i,
      onMouseDown: (event: MouseEvent) => {
        draggedBox = box;
        const boxLeft = box.left ?? 0;
        const boxTop = box.top ?? 0;
        dragOffset = {
          x: event.x - (typeof boxLeft === "number" ? boxLeft : 0),
          y: event.y - (typeof boxTop === "number" ? boxTop : 0),
        };
        // Bring to front
        box.zIndex = 100;
      },
      onMouseDrag: (event: MouseEvent) => {
        if (draggedBox === box) {
          box.left = Math.max(0, event.x - dragOffset.x);
          box.top = Math.max(0, event.y - dragOffset.y);
        }
      },
      onMouseDragEnd: () => {
        if (draggedBox === box) {
          draggedBox = null;
          box.zIndex = i;
        }
      },
    });

    const boxText = new TextRenderable(renderer, {
      id: `draggable-text-${i}`,
      content: t`${bold(fg(theme.colors.bg)(`Drag ${i + 1}`))}`,
    });

    box.add(boxText);
    draggableBoxes.push(box);
    interactiveArea.add(box);
  });

  interactiveArea.add(clickButton);
  interactiveArea.add(hoverArea);

  // Mouse position display
  const mouseInfo = new BoxRenderable(renderer, {
    id: "mouse-info",
    flexDirection: "row",
    gap: 3,
    marginTop: 1,
  });

  const positionText = new TextRenderable(renderer, {
    id: "position-text",
    content: "Mouse: (-, -)",
    fg: theme.colors.fgMuted,
  });

  const actionText = new TextRenderable(renderer, {
    id: "action-text",
    content: "Action: none",
    fg: theme.colors.fgMuted,
  });

  mouseInfo.add(positionText);
  mouseInfo.add(actionText);

  // Track mouse movement globally
  interactiveArea.onMouseMove = (event: MouseEvent) => {
    positionText.content = `Mouse: (${event.x}, ${event.y})`;
  };

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "Click", action: "Button click" },
      { key: "Hover", action: "See effects" },
      { key: "Drag", action: "Move boxes" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(interactiveArea);
  main.add(mouseInfo);
  main.add(keyBar);
  renderer.root.add(main);
});
