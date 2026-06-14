/**
 * Example 09: ASCII Art Fonts
 *
 * Demonstrates ASCIIFontRenderable:
 * - Large banner text
 * - Multiple font styles
 * - Color gradients
 * - Animated text effects
 */

import {
  TextRenderable,
  BoxRenderable,
  ASCIIFontRenderable,
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
  const fonts: ("block" | "tiny" | "shade" | "slick" | "huge")[] = [
    "block",
    "tiny",
    "shade",
    "slick",
    "huge",
  ];
  let currentFontIndex = 0;
  let currentColorIndex = 0;

  const gradients = [
    [theme.colors.accent1, theme.colors.accent2], // Pink to Purple
    [theme.colors.accent3, theme.colors.accent4], // Cyan to Green
    [theme.colors.accent5, theme.colors.accent6], // Orange to Yellow
    [theme.colors.error, theme.colors.warning], // Red to Orange
    [theme.colors.info, theme.colors.accent3], // Blue to Cyan
  ];

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
    title: "ASCII Art Fonts",
    rightContent: `Font: ${fonts[currentFontIndex]}`,
    rightColor: theme.colors.accent5,
  });

  // Font selection tabs
  const tabs = new BoxRenderable(renderer, {
    id: "tabs",
    flexDirection: "row",
    gap: 1,
    marginBottom: 1,
  });

  const tabRenderables: TextRenderable[] = [];

  fonts.forEach((font, i) => {
    const isActive = i === currentFontIndex;
    const tab = new TextRenderable(renderer, {
      id: `tab-${font}`,
      content: isActive
        ? t`${bold(fg(theme.colors.bg)(` ${font} `))}`
        : ` ${font} `,
      fg: isActive ? undefined : theme.colors.fg,
      bg: isActive ? theme.colors.accent2 : theme.colors.bgHighlight,
    });
    tabRenderables.push(tab);
    tabs.add(tab);
  });

  // ASCII art container
  const artContainer = new BoxRenderable(renderer, {
    id: "art-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  });

  const asciiArt = new ASCIIFontRenderable(renderer, {
    id: "ascii-art",
    text: "OpenTUI",
    font: fonts[currentFontIndex],
    color: gradients[currentColorIndex],
  });

  artContainer.add(asciiArt);

  // Color swatches
  const colorSection = new BoxRenderable(renderer, {
    id: "color-section",
    flexDirection: "column",
    gap: 1,
    marginTop: 1,
  });

  const colorLabel = new TextRenderable(renderer, {
    id: "color-label",
    content: "Gradient (press c to cycle):",
    fg: theme.colors.fgMuted,
  });

  const colorSwatches = new BoxRenderable(renderer, {
    id: "color-swatches",
    flexDirection: "row",
    gap: 1,
  });

  const swatchRenderables: TextRenderable[] = [];

  gradients.forEach((gradient, i) => {
    const isActive = i === currentColorIndex;
    const swatch = new TextRenderable(renderer, {
      id: `swatch-${i}`,
      content: isActive ? " ● " : " ○ ",
      fg: gradient[0],
    });
    swatchRenderables.push(swatch);
    colorSwatches.add(swatch);
  });

  colorSection.add(colorLabel);
  colorSection.add(colorSwatches);

  // Preview of other text
  const previewSection = new BoxRenderable(renderer, {
    id: "preview-section",
    flexDirection: "column",
    marginTop: 1,
    gap: 0,
  });

  const previewLabel = new TextRenderable(renderer, {
    id: "preview-label",
    content: "Preview text (type to change):",
    fg: theme.colors.fgMuted,
  });

  const currentText = new TextRenderable(renderer, {
    id: "current-text",
    content: "Current: OpenTUI",
    fg: theme.colors.fg,
  });

  previewSection.add(previewLabel);
  previewSection.add(currentText);

  let displayText = "OpenTUI";

  function updateDisplay() {
    // Update ASCII art
    asciiArt.text = displayText;
    asciiArt.font = fonts[currentFontIndex];
    asciiArt.color = gradients[currentColorIndex];

    // Update font indicator
    header.setRightContent(`Font: ${fonts[currentFontIndex]}`);

    // Update tabs
    tabRenderables.forEach((tab, i) => {
      const isActive = i === currentFontIndex;
      tab.content = isActive
        ? t`${bold(fg(theme.colors.bg)(` ${fonts[i]} `))}`
        : ` ${fonts[i]} `;
      tab.fg = isActive ? undefined : theme.colors.fg;
      tab.bg = isActive ? theme.colors.accent2 : theme.colors.bgHighlight;
    });

    // Update color swatches
    swatchRenderables.forEach((swatch, i) => {
      const isActive = i === currentColorIndex;
      swatch.content = isActive ? " ● " : " ○ ";
    });

    // Update current text display
    currentText.content = `Current: ${displayText}`;
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "←/→", action: "Change font" },
      { key: "c", action: "Cycle colors" },
      { key: "1-5", action: "Select font" },
      { key: "Backspace", action: "Clear" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(tabs);
  main.add(artContainer);
  main.add(colorSection);
  main.add(previewSection);
  main.add(keyBar);
  renderer.root.add(main);

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "left":
        currentFontIndex = (currentFontIndex - 1 + fonts.length) % fonts.length;
        updateDisplay();
        break;
      case "right":
        currentFontIndex = (currentFontIndex + 1) % fonts.length;
        updateDisplay();
        break;
      case "c":
        currentColorIndex = (currentColorIndex + 1) % gradients.length;
        updateDisplay();
        break;
      case "backspace":
        if (displayText.length > 0) {
          displayText = displayText.slice(0, -1) || "A";
          updateDisplay();
        }
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
        const idx = parseInt(key.name) - 1;
        if (idx < fonts.length) {
          currentFontIndex = idx;
          updateDisplay();
        }
        break;
      default:
        // Add typed character to display text
        if (key.name && key.name.length === 1 && /[a-zA-Z0-9 ]/.test(key.name)) {
          if (displayText.length < 15) {
            displayText += key.name;
            updateDisplay();
          }
        }
        break;
    }
  });
});
