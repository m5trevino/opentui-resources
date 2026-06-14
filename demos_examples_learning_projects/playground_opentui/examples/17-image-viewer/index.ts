/**
 * Example 23: Image Viewer
 *
 * Demonstrates terminal image rendering concepts:
 * - ASCII art representation
 * - Different rendering modes
 * - Pan and zoom controls
 *
 * Note: Full image rendering requires terminal support for
 * sixel, kitty graphics protocol, or iTerm inline images.
 * This example uses ASCII art as a fallback demonstration.
 */

import {
  TextRenderable,
  BoxRenderable,
  type KeyEvent,
  t,
  bold,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

createExampleApp(({ renderer }) => {
  // ASCII art images (simulated)
  const images = [
    {
      name: "Landscape",
      art: [
        "                    .  .                        ",
        "               . _\\/|\\_ .                      ",
        "             .  \\\\  //  .                      ",
        "            .    \\\\//    .                     ",
        "      _______|____\\/|________                  ",
        "     /                       \\                 ",
        "    /    ~  ~    _   ~   ~    \\                ",
        "   /   ~    ~   / \\   ~    ~   \\               ",
        "  /  ~   ~   ~ /   \\  ~   ~   ~ \\              ",
        " /____________/     \\____________\\             ",
        "     |    |           |    |                   ",
        "   __|____|___________|____|__                 ",
        "  /                           \\                ",
        " /                             \\               ",
        "/                               \\              ",
      ],
      colors: [theme.colors.accent6, theme.colors.accent4, theme.colors.accent3],
    },
    {
      name: "Cat",
      art: [
        "    /\\_____/\\    ",
        "   /  o   o  \\   ",
        "  ( ==  ^  == )  ",
        "   )         (   ",
        "  (           )  ",
        " ( (  )   (  ) ) ",
        "(__(__)___(__)__))",
      ],
      colors: [theme.colors.accent5, theme.colors.accent1],
    },
    {
      name: "House",
      art: [
        "              /\\              ",
        "             /  \\             ",
        "            /    \\            ",
        "           /      \\           ",
        "          /   /\\   \\          ",
        "         /   /  \\   \\         ",
        "        /___/____\\___\\        ",
        "        |   ____   |         ",
        "        |  |    |  |         ",
        "        |  | __ |  |         ",
        "        |__|    |__|         ",
        "        |  |    |  |         ",
        "        |__|____|__|         ",
      ],
      colors: [theme.colors.accent2, theme.colors.accent5, theme.colors.accent4],
    },
    {
      name: "Rocket",
      art: [
        "        /\\        ",
        "       /  \\       ",
        "      |    |      ",
        "      |    |      ",
        "      | __ |      ",
        "      |/  \\|      ",
        "     /|    |\\     ",
        "    / |    | \\    ",
        "   /  |    |  \\   ",
        "  /  /|    |\\  \\  ",
        " /  / |    | \\  \\ ",
        "/__/  |____|  \\__\\",
        "      | || |      ",
        "      |_||_|      ",
        "      ^^^^        ",
        "     / || \\       ",
        "    /  ||  \\      ",
      ],
      colors: [theme.colors.accent3, theme.colors.error, theme.colors.accent5],
    },
  ];

  let currentImageIndex = 0;
  let zoom = 1;
  let renderMode = 0;
  const renderModes = ["Color", "Grayscale", "Inverted", "Outline"];

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
    title: "Image Viewer",
    rightContent: `${images[currentImageIndex].name} | Mode: ${renderModes[renderMode]}`,
  });

  // Image tabs
  const tabs = new BoxRenderable(renderer, {
    id: "tabs",
    flexDirection: "row",
    gap: 1,
  });

  const tabRenderables: TextRenderable[] = [];

  images.forEach((img, i) => {
    const isActive = i === currentImageIndex;
    const tabContent = ` ${img.name} `;
    const tab = new TextRenderable(renderer, {
      id: `tab-${i}`,
      content: isActive ? t`${bold(tabContent)}` : tabContent,
      fg: isActive ? theme.colors.bg : theme.colors.fg,
      bg: isActive ? theme.colors.accent2 : theme.colors.bgHighlight,
    });
    tabRenderables.push(tab);
    tabs.add(tab);
  });

  // Image container
  const imageContainer = new BoxRenderable(renderer, {
    id: "image-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    padding: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  });

  const imageContent = new BoxRenderable(renderer, {
    id: "image-content",
    flexDirection: "column",
    alignItems: "center",
  });

  const imageLines: TextRenderable[] = [];

  function renderImage() {
    const image = images[currentImageIndex];

    // Clear existing lines
    imageLines.forEach((line) => imageContent.remove(line.id));
    imageLines.length = 0;

    // Render image with current settings
    image.art.forEach((line, i) => {
      let displayLine = line;
      let fg = image.colors[i % image.colors.length];

      // Apply render mode
      switch (renderMode) {
        case 1: // Grayscale
          fg = theme.colors.fgMuted;
          break;
        case 2: // Inverted
          displayLine = line
            .split("")
            .map((c) => (c === " " ? "█" : c === "█" ? " " : c))
            .join("");
          break;
        case 3: // Outline
          displayLine = line.replace(/[^\s\/\\|_\-]/g, "·");
          fg = theme.colors.accent3;
          break;
      }

      // Apply zoom (simplified - just repeat characters)
      if (zoom > 1) {
        displayLine = displayLine
          .split("")
          .map((c) => c.repeat(Math.floor(zoom)))
          .join("");
      }

      const textLine = new TextRenderable(renderer, {
        id: `img-line-${i}`,
        content: displayLine,
        fg,
      });
      imageLines.push(textLine);
      imageContent.add(textLine);
    });

    // Update header info
    header.setRightContent(`${image.name} | Mode: ${renderModes[renderMode]} | Zoom: ${zoom}x`);

    // Update tabs
    tabRenderables.forEach((tab, i) => {
      const isActive = i === currentImageIndex;
      const tabContent = ` ${images[i].name} `;
      tab.content = isActive ? t`${bold(tabContent)}` : tabContent;
      tab.fg = isActive ? theme.colors.bg : theme.colors.fg;
      tab.bg = isActive ? theme.colors.accent2 : theme.colors.bgHighlight;
    });
  }

  imageContainer.add(imageContent);

  // Info panel
  const infoPanel = new BoxRenderable(renderer, {
    id: "info-panel",
    flexDirection: "row",
    gap: 3,
    padding: 1,
    backgroundColor: theme.colors.bgAlt,
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
  });

  const formatInfo = new TextRenderable(renderer, {
    id: "format-info",
    content: "Format: ASCII Art",
    fg: theme.colors.fgMuted,
  });

  const sizeInfo = new TextRenderable(renderer, {
    id: "size-info",
    content: "",
    fg: theme.colors.fgMuted,
  });

  const protocolInfo = new TextRenderable(renderer, {
    id: "protocol-info",
    content: "Protocol: Text (Sixel/Kitty available)",
    fg: theme.colors.fgMuted,
  });

  infoPanel.add(formatInfo);
  infoPanel.add(sizeInfo);
  infoPanel.add(protocolInfo);

  function updateSizeInfo() {
    const image = images[currentImageIndex];
    const width = image.art[0]?.length || 0;
    const height = image.art.length;
    sizeInfo.content = `Size: ${width}x${height}`;
  }

  // Instructions
  const instructions = createKeyBindingBar(
    renderer,
    [
      { key: "←/→", action: "Switch image" },
      { key: "+/-", action: "Zoom" },
      { key: "m", action: "Render mode" },
      { key: "1-4", action: "Select image" },
      { key: "q", action: "Exit" },
    ],
    { theme, gap: 2 }
  );

  // Build tree
  main.add(header.getContainer());
  main.add(tabs);
  main.add(imageContainer);
  main.add(infoPanel);
  main.add(instructions);
  renderer.root.add(main);

  // Initial render
  renderImage();
  updateSizeInfo();

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "left":
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        renderImage();
        updateSizeInfo();
        break;
      case "right":
        currentImageIndex = (currentImageIndex + 1) % images.length;
        renderImage();
        updateSizeInfo();
        break;
      case "m":
        renderMode = (renderMode + 1) % renderModes.length;
        renderImage();
        break;
      case "+":
      case "=":
        zoom = Math.min(3, zoom + 1);
        renderImage();
        break;
      case "-":
        zoom = Math.max(1, zoom - 1);
        renderImage();
        break;
      case "1":
      case "2":
      case "3":
      case "4":
        const idx = parseInt(key.name) - 1;
        if (idx < images.length) {
          currentImageIndex = idx;
          renderImage();
          updateSizeInfo();
        }
        break;
    }
  });
});
