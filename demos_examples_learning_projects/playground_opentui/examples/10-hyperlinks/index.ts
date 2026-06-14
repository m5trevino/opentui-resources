/**
 * Example 11: Hyperlinks
 *
 * Demonstrates OSC 8 clickable links in the terminal:
 * - Creating clickable URLs
 * - Link styling
 * - Mixed content with links
 */

import {
  TextRenderable,
  BoxRenderable,
  t,
  bold,
  underline,
  fg,
  link,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";

createExampleApp(({ renderer }) => {
  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 2,
    gap: 1,
  });

  // Header
  const title = new TextRenderable(renderer, {
    id: "title",
    content: t`${bold(fg(theme.colors.accent2)("Hyperlinks Example (OSC 8)"))}`,
  });

  const subtitle = new TextRenderable(renderer, {
    id: "subtitle",
    content: "Click links or use your terminal's link feature",
    fg: theme.colors.fgMuted,
  });

  // Info box
  const infoBox = new BoxRenderable(renderer, {
    id: "info-box",
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.info,
    backgroundColor: theme.colors.bgAlt,
    width: 60,
  });

  const infoTitle = new TextRenderable(renderer, {
    id: "info-title",
    content: t`${bold(fg(theme.colors.info)("What are OSC 8 Hyperlinks?"))}`,
  });

  const infoText = new TextRenderable(renderer, {
    id: "info-text",
    content:
      "OSC 8 is a terminal escape sequence that enables clickable\nhyperlinks in compatible terminals like iTerm2, Kitty,\nWindows Terminal, and others.",
    fg: theme.colors.fg,
  });

  infoBox.add(infoTitle);
  infoBox.add(infoText);

  // Links section
  const linksSection = new BoxRenderable(renderer, {
    id: "links-section",
    flexDirection: "column",
    gap: 1,
    marginTop: 1,
  });

  const linksTitle = new TextRenderable(renderer, {
    id: "links-title",
    content: t`${bold(fg(theme.colors.accent5)("Useful Links:"))}`,
  });

  // Example links with descriptions
  const links = [
    {
      text: "OpenTUI Documentation",
      url: "https://opentui.com",
      description: "Official documentation and getting started guide",
    },
    {
      text: "GitHub Repository",
      url: "https://github.com/sst/opentui",
      description: "Source code and issue tracker",
    },
    {
      text: "npm Package",
      url: "https://www.npmjs.com/package/@opentui/core",
      description: "Install via npm or bun",
    },
    {
      text: "Bun Runtime",
      url: "https://bun.sh",
      description: "Required runtime for OpenTUI",
    },
    {
      text: "Yoga Layout",
      url: "https://www.yogalayout.dev",
      description: "Flexbox layout engine used by OpenTUI",
    },
  ];

  const linksContainer = new BoxRenderable(renderer, {
    id: "links-container",
    flexDirection: "column",
    gap: 1,
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    width: 60,
  });

  links.forEach((linkData, i) => {
    const linkRow = new BoxRenderable(renderer, {
      id: `link-row-${i}`,
      flexDirection: "column",
      gap: 0,
    });

    // Clickable link text using OSC 8 link function
    const linkText = new TextRenderable(renderer, {
      id: `link-${i}`,
      content: t`${link(linkData.url)(underline(fg(theme.colors.accent3)(`→ ${linkData.text}`)))}`,
    });

    // Description
    const descText = new TextRenderable(renderer, {
      id: `desc-${i}`,
      content: `  ${linkData.description}`,
      fg: theme.colors.fgMuted,
    });

    linkRow.add(linkText);
    linkRow.add(descText);
    linksContainer.add(linkRow);
  });

  linksSection.add(linksTitle);
  linksSection.add(linksContainer);

  // Mixed content example
  const mixedSection = new BoxRenderable(renderer, {
    id: "mixed-section",
    flexDirection: "column",
    marginTop: 1,
    gap: 0,
  });

  const mixedTitle = new TextRenderable(renderer, {
    id: "mixed-title",
    content: t`${bold(fg(theme.colors.accent5)("Inline Links in Text:"))}`,
  });

  const mixedBox = new BoxRenderable(renderer, {
    id: "mixed-box",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    width: 60,
  });

  // Create mixed text with inline links
  const textParts = [
    { content: "Check out the ", isLink: false },
    {
      content: "official docs",
      isLink: true,
      url: "https://opentui.com/docs",
    },
    { content: " or visit ", isLink: false },
    {
      content: "GitHub",
      isLink: true,
      url: "https://github.com/sst/opentui",
    },
    { content: " for more information.", isLink: false },
  ];

  textParts.forEach((part, i) => {
    const textEl = new TextRenderable(renderer, {
      id: `mixed-text-${i}`,
      content: part.isLink
        ? t`${link(part.url!)(underline(fg(theme.colors.accent3)(part.content)))}`
        : part.content,
      fg: part.isLink ? undefined : theme.colors.fg,
    });
    mixedBox.add(textEl);
  });

  mixedSection.add(mixedTitle);
  mixedSection.add(mixedBox);

  // Terminal compatibility note
  const compatNote = new BoxRenderable(renderer, {
    id: "compat-note",
    flexDirection: "column",
    marginTop: 1,
    padding: 1,
    backgroundColor: theme.colors.bgHighlight,
    width: 60,
  });

  const compatTitle = new TextRenderable(renderer, {
    id: "compat-title",
    content: t`${bold(fg(theme.colors.warning)("Terminal Compatibility:"))}`,
  });

  const compatList = [
    "✓ iTerm2 (macOS)",
    "✓ Kitty",
    "✓ Windows Terminal",
    "✓ Hyper",
    "✓ Alacritty (with settings)",
    "✗ Default macOS Terminal",
  ];

  const compatListBox = new BoxRenderable(renderer, {
    id: "compat-list",
    flexDirection: "column",
    gap: 0,
  });

  compatList.forEach((item, i) => {
    const isSupported = item.startsWith("✓");
    const listItem = new TextRenderable(renderer, {
      id: `compat-${i}`,
      content: item,
      fg: isSupported ? theme.colors.success : theme.colors.error,
    });
    compatListBox.add(listItem);
  });

  compatNote.add(compatTitle);
  compatNote.add(compatListBox);

  // Instructions
  const instructions = new TextRenderable(renderer, {
    id: "instructions",
    content: "Press q or Ctrl+C to exit",
    fg: theme.colors.fgMuted,
    marginTop: 1,
  });

  // Build component tree
  main.add(title);
  main.add(subtitle);
  main.add(infoBox);
  main.add(linksSection);
  main.add(mixedSection);
  main.add(compatNote);
  main.add(instructions);
  renderer.root.add(main);
});
