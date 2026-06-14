/**
 * Example 08: Markdown Renderer
 *
 * Demonstrates MarkdownRenderable capabilities:
 * - Headers, paragraphs, lists
 * - Code blocks with syntax highlighting
 * - Tables
 * - Links and emphasis
 */

import {
  BoxRenderable,
  MarkdownRenderable,
  ScrollBoxRenderable,
  SyntaxStyle,
  RGBA,
  type KeyEvent,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

// Create syntax style for markdown
const syntaxStyle = SyntaxStyle.fromStyles({
  keyword: { fg: RGBA.fromHex(theme.colors.accent1), bold: true },
  string: { fg: RGBA.fromHex(theme.colors.success) },
  comment: { fg: RGBA.fromHex(theme.colors.fgMuted), italic: true },
  number: { fg: RGBA.fromHex(theme.colors.warning) },
  default: { fg: RGBA.fromHex(theme.colors.fg) },
});

createExampleApp(({ renderer }) => {
  const markdownContent = `# Markdown Renderer Example

This example demonstrates OpenTUI's **Markdown rendering** capabilities.

## Features

- **Bold** and *italic* text
- \`inline code\` formatting
- Multiple heading levels
- Ordered and unordered lists

### Code Blocks

Here's a TypeScript example:

\`\`\`typescript
interface Config {
  theme: 'light' | 'dark';
  language: string;
}

function applyConfig(config: Config): void {
  console.log('Applying:', config);
}
\`\`\`

### Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Headings | ✅ Done | High |
| Lists | ✅ Done | High |
| Code blocks | ✅ Done | Medium |
| Tables | ✅ Done | Medium |
| Links | ✅ Done | Low |

### Lists

**Unordered list:**
- First item
- Second item
  - Nested item
  - Another nested
- Third item

**Ordered list:**
1. Step one
2. Step two
3. Step three

### Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

### Links

Check out [OpenTUI](https://opentui.com) for more information.

---

## Summary

This Markdown renderer supports most common formatting options and renders them beautifully in the terminal.

Press **q** to exit.`;

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
    title: "Markdown Renderer",
    rightContent: "Scroll: ↑/↓ or j/k",
  });

  // Markdown container with scroll
  const markdownContainer = new BoxRenderable(renderer, {
    id: "markdown-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
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
      },
    },
  });

  const markdownView = new MarkdownRenderable(renderer, {
    id: "markdown",
    content: markdownContent,
    width: "100%",
    padding: 2,
    syntaxStyle,
  });

  scrollBox.add(markdownView);
  markdownContainer.add(scrollBox);

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "↑/k", action: "Scroll up" },
      { key: "↓/j", action: "Scroll down" },
      { key: "PgUp/PgDn", action: "Page scroll" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(markdownContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "up":
      case "k":
        scrollBox.scrollBy({ x: 0, y: -2 });
        break;
      case "down":
      case "j":
        scrollBox.scrollBy({ x: 0, y: 2 });
        break;
      case "pageup":
        scrollBox.scrollBy({ x: 0, y: -10 });
        break;
      case "pagedown":
        scrollBox.scrollBy({ x: 0, y: 10 });
        break;
      case "home":
        scrollBox.scrollTo({ x: 0, y: 0 });
        break;
      case "end":
        scrollBox.scrollTo({ x: 0, y: scrollBox.scrollHeight });
        break;
    }
  });
});
