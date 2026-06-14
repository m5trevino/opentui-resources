/**
 * Example 02: Styled Text
 *
 * Demonstrates text styling capabilities:
 * - Foreground and background colors
 * - Bold, italic, underline styles
 * - Multiple text elements with different styles
 * - Using theme colors
 */

import {
  TextRenderable,
  BoxRenderable,
  t,
  bold,
  italic,
  underline,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";

createExampleApp(({ renderer }) => {
  // Main container
  const container = new BoxRenderable(renderer, {
    id: "container",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 2,
    gap: 1,
  });

  // Title
  const title = new TextRenderable(renderer, {
    id: "title",
    content: t`${bold(fg(theme.colors.accent2)("Styled Text Examples"))}`,
  });

  // Separator
  const separator = new TextRenderable(renderer, {
    id: "separator",
    content: "─".repeat(40),
    fg: theme.colors.border,
  });

  // Color examples
  const colorExamples = [
    { label: "Success:", color: theme.colors.success },
    { label: "Warning:", color: theme.colors.warning },
    { label: "Error:", color: theme.colors.error },
    { label: "Info:", color: theme.colors.info },
  ];

  const colorRow = new BoxRenderable(renderer, {
    id: "color-row",
    flexDirection: "row",
    gap: 2,
  });

  colorExamples.forEach((example, i) => {
    const text = new TextRenderable(renderer, {
      id: `color-${i}`,
      content: `${example.label} Sample text`,
      fg: example.color,
    });
    colorRow.add(text);
  });

  // Accent colors
  const accentRow = new BoxRenderable(renderer, {
    id: "accent-row",
    flexDirection: "row",
    gap: 2,
  });

  const accents = [
    theme.colors.accent1,
    theme.colors.accent2,
    theme.colors.accent3,
    theme.colors.accent4,
    theme.colors.accent5,
    theme.colors.accent6,
  ];

  accents.forEach((color, i) => {
    const block = new TextRenderable(renderer, {
      id: `accent-${i}`,
      content: ` Color ${i + 1} `,
      fg: theme.colors.bg,
      bg: color,
    });
    accentRow.add(block);
  });

  // Text style variations
  const styleSection = new BoxRenderable(renderer, {
    id: "style-section",
    flexDirection: "column",
    gap: 1,
    marginTop: 1,
  });

  // Normal text
  styleSection.add(
    new TextRenderable(renderer, {
      id: "normal",
      content: t`${fg(theme.colors.fg)("Normal text")}`,
    })
  );

  // Bold text
  styleSection.add(
    new TextRenderable(renderer, {
      id: "bold-text",
      content: t`${bold(fg(theme.colors.fg)("Bold text"))}`,
    })
  );

  // Dimmed text
  styleSection.add(
    new TextRenderable(renderer, {
      id: "dim",
      content: "Dimmed text",
      fg: theme.colors.fgMuted,
    })
  );

  // Italic text
  styleSection.add(
    new TextRenderable(renderer, {
      id: "italic-text",
      content: t`${italic(fg(theme.colors.fg)("Italic text"))}`,
    })
  );

  // Underlined text
  styleSection.add(
    new TextRenderable(renderer, {
      id: "underline-text",
      content: t`${underline(fg(theme.colors.fg)("Underlined text"))}`,
    })
  );

  // Combined styles
  styleSection.add(
    new TextRenderable(renderer, {
      id: "combined",
      content: t`${bold(italic(underline(fg(theme.colors.accent1)("Bold + Italic + Underline"))))}`,
    })
  );

  // Rainbow text demonstration
  const rainbowSection = new BoxRenderable(renderer, {
    id: "rainbow-section",
    flexDirection: "row",
    marginTop: 1,
  });

  const rainbowColors = [
    "#ff5555", // Red
    "#ffb86c", // Orange
    "#f1fa8c", // Yellow
    "#50fa7b", // Green
    "#8be9fd", // Cyan
    "#bd93f9", // Purple
    "#ff79c6", // Pink
  ];

  "RAINBOW".split("").forEach((char, i) => {
    const letter = new TextRenderable(renderer, {
      id: `rainbow-${i}`,
      content: t`${bold(fg(rainbowColors[i % rainbowColors.length])(char))}`,
    });
    rainbowSection.add(letter);
  });

  // Instructions
  const instructions = new TextRenderable(renderer, {
    id: "instructions",
    content: t`${fg(theme.colors.fgMuted)("Press q or Ctrl+C to exit")}`,
    marginTop: 2,
  });

  // Build component tree
  container.add(title);
  container.add(separator);
  container.add(colorRow);
  container.add(accentRow);
  container.add(styleSection);
  container.add(rainbowSection);
  container.add(instructions);
  renderer.root.add(container);
});
