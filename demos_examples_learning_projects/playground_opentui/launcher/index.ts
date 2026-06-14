/**
 * OpenTUI Examples Launcher
 *
 * A TUI application that:
 * - Lists all examples with descriptions
 * - Allows selection via arrow keys or search
 * - Launches selected example
 * - Shows keyboard shortcut cheat sheet
 */

import {
  createCliRenderer,
  type CliRenderer,
  TextRenderable,
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  RenderableEvents,
  ScrollBoxRenderable,
  ASCIIFontRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { spawn } from "child_process";
import { draculaTheme as theme, themes, type Theme, listThemes } from "../shared/themes/index";

interface Example {
  id: string;
  name: string;
  description: string;
  tier: string;
  path: string;
  preview: string[];
}

const examples: Example[] = [
  // Tier 1: Fundamentals (01-05)
  {
    id: "01",
    name: "Hello World",
    description: "Basic OpenTUI setup showing createCliRenderer, TextRenderable, BoxRenderable, component tree structure, and keyboard event handling - the minimal starting point",
    tier: "Fundamentals",
    path: "examples/01-hello-world/index.ts",
    preview: [
      "┌──────────────────────────┐",
      "│                          │",
      "│    Hello, OpenTUI!       │",
      "│   Press Ctrl+C to exit   │",
      "│                          │",
      "└──────────────────────────┘",
    ],
  },
  {
    id: "02",
    name: "Styled Text",
    description: "Text styling with bold, italic, underline, foreground/background colors, theme integration, and character-level color gradients",
    tier: "Fundamentals",
    path: "examples/02-styled-text/index.ts",
    preview: [
      "  Normal  Bold  Italic",
      "  ─────────────────────",
      "  Hello   Hello  Hello",
      "  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓",
      "  R  G  B  Gradient Text",
    ],
  },
  {
    id: "03",
    name: "Flexbox Layout",
    description: "Yoga flexbox engine with row/column direction, gap, justify-content, align-items, flex-grow, nested containers, and responsive sidebar+content patterns",
    tier: "Fundamentals",
    path: "examples/03-layout-flexbox/index.ts",
    preview: [
      "┌─────┬─────────────────┐",
      "│     │    Content      │",
      "│ Nav │─────────────────│",
      "│     │    Main Area    │",
      "│     │                 │",
      "└─────┴─────────────────┘",
    ],
  },
  {
    id: "04",
    name: "Input Forms",
    description: "Interactive forms with InputRenderable, SelectRenderable, FocusManager, Tab navigation, form state management, and event handling",
    tier: "Fundamentals",
    path: "examples/04-input-forms/index.ts",
    preview: [
      "  Username: [__________]",
      "  Password: [••••••••••]",
      "  Role:     ▼ Admin",
      "  ┌────────┐ ┌────────┐",
      "  │ Submit │ │ Cancel │",
      "  └────────┘ └────────┘",
    ],
  },
  {
    id: "05",
    name: "Scrolling",
    description: "ScrollBoxRenderable with virtual scrolling performance for 10,000+ items, scrollTo/scrollBy methods, and dynamic selection tracking",
    tier: "Fundamentals",
    path: "examples/05-scrolling/index.ts",
    preview: [
      "┌────────────────────┬─┐",
      "│ Item 1             │▲│",
      "│ Item 2             │█│",
      "│ Item 3             │ │",
      "│ Item 4             │▼│",
      "└────────────────────┴─┘",
    ],
  },

  // Tier 2: Content Rendering (06-10)
  {
    id: "06",
    name: "Code Viewer",
    description: "Tree-sitter syntax highlighting for TypeScript, Python, Rust, Go with language switching, line numbers, and RGBA color handling",
    tier: "Content Rendering",
    path: "examples/06-code-viewer/index.ts",
    preview: [
      "  1│ function hello() {",
      "  2│   const msg = 'Hi';",
      "  3│   console.log(msg);",
      "  4│ }",
      "  ──────────────────────",
      "  TypeScript │ 4 lines",
    ],
  },
  {
    id: "07",
    name: "Diff Viewer",
    description: "Git-style diff rendering with unified/split view modes, line numbers, colored additions/deletions, and diff statistics",
    tier: "Content Rendering",
    path: "examples/07-diff-viewer/index.ts",
    preview: [
      "  @@ -1,3 +1,4 @@",
      "   const x = 1;",
      "  -const y = 2;",
      "  +const y = 3;",
      "  +const z = 4;",
      "  +2 -1 lines changed",
    ],
  },
  {
    id: "08",
    name: "Markdown Renderer",
    description: "Full markdown support with headers, emphasis, code blocks with syntax highlighting, tables, lists, and scrollable content",
    tier: "Content Rendering",
    path: "examples/08-markdown-renderer/index.ts",
    preview: [
      "  # Heading",
      "  ══════════",
      "  **Bold** and *italic*",
      "  • List item 1",
      "  • List item 2",
      "  ┃ > Blockquote",
    ],
  },
  {
    id: "09",
    name: "ASCII Art Fonts",
    description: "Large banner text with multiple fonts (block, tiny, shade, slick, huge), color gradients, and live text input preview",
    tier: "Content Rendering",
    path: "examples/09-ascii-art-fonts/index.ts",
    preview: [
      "  ██  ██ ██████ ██  ██",
      "  ██████   ██   ██  ██",
      "  ██  ██ ██████ ██████",
      "  ────────────────────",
      "  Font: Block │ Input",
    ],
  },
  {
    id: "10",
    name: "Hyperlinks",
    description: "OSC 8 clickable terminal links for inline URLs, standalone links, and terminal compatibility demonstration",
    tier: "Content Rendering",
    path: "examples/10-hyperlinks/index.ts",
    preview: [
      "  Click these links:",
      "  ──────────────────",
      "  → github.com",
      "  → docs.opentui.dev",
      "  → npmjs.com",
      "  [OSC 8 supported]",
    ],
  },

  // Tier 3: Interactivity (11-12)
  {
    id: "11",
    name: "Timeline Animations",
    description: "Animation framework with easing functions (linear, easeIn, bounce), color interpolation, sine waves, pulsing text, and property lerping",
    tier: "Interactivity",
    path: "examples/11-timeline-animations/index.ts",
    preview: [
      "  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁",
      "  ───────────────────",
      "  ● ──────○────── ●",
      "  ↑ Bounce   Linear ↑",
      "  ★ Pulsing Text ★",
    ],
  },
  {
    id: "12",
    name: "Mouse Interactions",
    description: "Full mouse support with click detection, hover effects, drag-and-drop, z-index layering, and visual feedback states",
    tier: "Interactivity",
    path: "examples/12-mouse-interactions/index.ts",
    preview: [
      "  ┌─────────┐",
      "  │ Drag me │ ← Hover",
      "  └─────────┘",
      "  ┌───┐  🖱️ Click!",
      "  │ ▣ │",
      "  └───┘",
    ],
  },

  // Tier 4: Graphics (13-17)
  {
    id: "13",
    name: "Framebuffer Graphics",
    description: "Direct pixel manipulation with FrameBufferRenderable, drawing primitives (lines, circles, rectangles), Bresenham algorithm, patterns and gradients",
    tier: "Graphics",
    path: "examples/13-framebuffer-graphics/index.ts",
    preview: [
      "  ░░▒▒▓▓██▓▓▒▒░░",
      "    ╱─────────╲",
      "   ╱           ╲",
      "  ●─────────────●",
      "  │  ◯  Shapes  │",
      "  └─────────────┘",
    ],
  },
  {
    id: "14",
    name: "3D Cube Shaders",
    description: "ASCII 3D visualization with rotation controls, wireframe/effect modes, and pre-rendered cube frame animation sequences",
    tier: "Graphics",
    path: "examples/14-3d-cube-shaders/index.ts",
    preview: [
      "      ╱────╲",
      "     ╱  ╱  ╱│",
      "    ├──┼──┤ │",
      "    │  │  │╱",
      "    └──┴──┘",
      "   [←→] Rotate",
    ],
  },
  {
    id: "15",
    name: "Physics 2D",
    description: "Physics simulation with gravity, velocity-based movement, elastic collisions, bouncing balls, and aspect ratio correction",
    tier: "Graphics",
    path: "examples/15-physics-2d/index.ts",
    preview: [
      "        ●",
      "          ↘",
      "  ●         ○",
      "    ↗    ↙",
      "  ──────────────",
      "  Gravity: 9.8",
    ],
  },
  {
    id: "16",
    name: "Sprite Animations",
    description: "Frame-by-frame sprite animation with entity management, explosion effects, sprite pooling, and boundary collision",
    tier: "Graphics",
    path: "examples/16-sprite-animations/index.ts",
    preview: [
      "     ★  ★",
      "  ◀━━▶     ✸",
      "            ✹",
      "  ★      ✺",
      "     ◀━━▶",
      "  FPS: 60",
    ],
  },
  {
    id: "17",
    name: "Image Viewer",
    description: "ASCII art image display with multiple render modes (color, grayscale, inverted, outline) and zoom controls",
    tier: "Graphics",
    path: "examples/17-image-viewer/index.ts",
    preview: [
      "  ┌──────────────────┐",
      "  │ ░░▒▒▓▓██▓▓▒▒░░   │",
      "  │ ▓▓░░    ░░▓▓     │",
      "  │ ██▓▓▒▒▒▒▓▓██     │",
      "  └──────────────────┘",
      "  [m] Mode  [+/-] Zoom",
    ],
  },

  // Tier 5: Applications (18-24)
  {
    id: "18",
    name: "Dashboard",
    description: "Real-time monitoring dashboard with multiple panels, ASCII charts, progress bars, live data updates, and color-coded status indicators",
    tier: "Applications",
    path: "examples/18-dashboard/index.ts",
    preview: [
      "┌─ CPU ────┐ ┌─ Memory ─┐",
      "│ 45%      │ │ 62%      │",
      "│ ████░░░░ │ │ ██████░░ │",
      "└──────────┘ └──────────┘",
      "● API ✓  ◐ Queue  ○ DB",
    ],
  },
  {
    id: "19",
    name: "File Explorer",
    description: "Tree-view file browser with recursive directory expansion, file preview, file type icons, and hierarchical navigation",
    tier: "Applications",
    path: "examples/19-file-explorer/index.ts",
    preview: [
      "  📁 src/",
      "   ├─ 📁 components/",
      "   │  └─ 📄 App.tsx",
      "   ├─ 📄 index.ts",
      "   └─ 📄 utils.ts",
      "  [↑↓] Navigate [→] Open",
    ],
  },
  {
    id: "20",
    name: "Chat Interface",
    description: "Messaging UI with aligned message bubbles, user avatars, auto-scroll conversation, timestamp formatting, and message input",
    tier: "Applications",
    path: "examples/20-chat-interface/index.ts",
    preview: [
      "  👤 Hey there!",
      "        Hello! 🤖",
      "  👤 How are you?",
      "      I'm great! 🤖",
      "  ────────────────────",
      "  Type message... [→]",
    ],
  },
  {
    id: "21",
    name: "Music Player",
    description: "Audio player UI with progress bar, playlist management, waveform visualizer, time formatting, and playback controls",
    tier: "Applications",
    path: "examples/21-music-player/index.ts",
    preview: [
      "  ♫ Now Playing",
      "  ─────────────────",
      "  Summer Vibes.mp3",
      "  ██████░░░░ 2:34",
      "  ⏮  ▶  ⏭  🔊 ▁▃▅▇",
    ],
  },
  {
    id: "22",
    name: "Kanban Board",
    description: "Project management board with keyboard-based drag-and-drop, task cards across columns, priority indicators, and task CRUD operations",
    tier: "Applications",
    path: "examples/22-kanban-board/index.ts",
    preview: [
      "│ To Do  │ Doing │ Done │",
      "├────────┼───────┼──────┤",
      "│┌─────┐ │┌────┐ │      │",
      "││Task1│ ││Task│ │ ✓    │",
      "│└─────┘ │└────┘ │      │",
      "[hjkl] Move  [Enter] Edit",
    ],
  },
  {
    id: "23",
    name: "Terminal Game",
    description: "Complete Snake game with game loop, collision detection, scoring system, speed progression, and direction buffering",
    tier: "Applications",
    path: "examples/23-terminal-game/index.ts",
    preview: [
      "  🐍 Snake Game",
      "┌────────────────────┐",
      "│    ●               │",
      "│    ■■■■■           │",
      "│                    │",
      "└────────────────────┘",
      "  Score: 50",
    ],
  },
  {
    id: "24",
    name: "Full App",
    description: "Complete application architecture with multi-view navigation, theme system, command palette, toast notifications, and modal overlays",
    tier: "Applications",
    path: "examples/24-full-app/index.ts",
    preview: [
      "┌─ Menu ─────────────┐",
      "│ Dashboard │ Users  │",
      "├───────────────────-┤",
      "│  ┌──────────────┐  │",
      "│  │ Modal Dialog │  │",
      "│  └──────────────┘  │",
    ],
  },

  // Tier 6: Showcase (25)
  {
    id: "25",
    name: "Nostromo Interface",
    description: "Dense 8-panel autonomous monitoring interface inspired by Alien (1979). Features 3D wireframe navigation, cryosleep pods with heartbeats, motion tracker with easter egg, scrolling hex telemetry, ASCII ship schematic, and more",
    tier: "Showcase",
    path: "examples/25-nostromo-interface/index.ts",
    preview: [
      "┌─ NAVIGATION ─┐┌─ LIFE SUPPORT ─┐",
      "│  ○ ╱──╲     ││ O2  ████████░░ │",
      "│   ╱    ╲    ││ CO2 ███████░░░ │",
      "│  ●──────    ││ TEMP██████░░░░ │",
      "├─ CRYOSLEEP ─┤├─ MOTION ──────┤",
      "│ ♡~ ♡~ ♡~ ♡~ ││    ╱ · ╲      │",
    ],
  },
];

// Persist state across launcher sessions
let currentTheme: Theme = theme;
let selectedIndex = 0;

async function runLauncherSession(): Promise<boolean> {
  let renderer: CliRenderer;
  try {
    renderer = await createCliRenderer({
      exitOnCtrlC: false, // We handle exit ourselves
    });
  } catch (err) {
    console.error("Failed to initialize terminal UI:", err);
    process.exit(1);
  }

  let searchQuery = "";
  let filteredExamples = [...examples];
  let searchFocused = false;

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: currentTheme.colors.bg,
  });

  // Header
  const header = new BoxRenderable(renderer, {
    id: "header",
    flexDirection: "column",
    padding: 2,
    alignItems: "center",
    backgroundColor: currentTheme.colors.bgAlt,
    border: ["bottom"],
    borderColor: currentTheme.colors.border,
  });

  const titleBox = new BoxRenderable(renderer, {
    id: "title-box",
    flexDirection: "column",
    alignItems: "center",
  });

  const titleAscii = new ASCIIFontRenderable(renderer, {
    id: "title-ascii",
    text: "OpenTUI",
    font: "block",
    color: [currentTheme.colors.accent2, currentTheme.colors.accent1],
  });

  const playgroundLabel = new TextRenderable(renderer, {
    id: "playground-label",
    content: "Examples Playground",
    fg: currentTheme.colors.accent2,
  });

  titleBox.add(titleAscii);
  titleBox.add(playgroundLabel);

  header.add(titleBox);

  // Search bar
  const searchBar = new BoxRenderable(renderer, {
    id: "search-bar",
    flexDirection: "row",
    padding: 1,
    gap: 1,
    border: ["bottom"],
    borderColor: currentTheme.colors.border,
  });

  const searchIcon = new TextRenderable(renderer, {
    id: "search-icon",
    content: "🔍",
    fg: currentTheme.colors.fgMuted,
  });

  const searchInput = new InputRenderable(renderer, {
    id: "search-input",
    flexGrow: 1,
    placeholder: "Search examples... (/ to focus)",
    backgroundColor: currentTheme.colors.bg,
    focusedBackgroundColor: currentTheme.colors.bgHighlight,
    textColor: currentTheme.colors.fg,
    placeholderColor: currentTheme.colors.fgMuted,
    cursorColor: currentTheme.colors.accent2,
    onKeyDown: (key) => {
      if (key.name === "escape") {
        searchInput.blur();
      }
    },
  });

  searchInput.on(InputRenderableEvents.CHANGE, (value: string) => {
    searchQuery = value;
    filterExamples();
  });

  searchInput.on(RenderableEvents.FOCUSED, () => {
    searchFocused = true;
  });

  searchInput.on(RenderableEvents.BLURRED, () => {
    searchFocused = false;
  });

  const resultCount = new TextRenderable(renderer, {
    id: "result-count",
    content: `${examples.length} examples`,
    fg: currentTheme.colors.fgMuted,
  });

  searchBar.add(searchIcon);
  searchBar.add(searchInput);
  searchBar.add(resultCount);

  // Content area
  const content = new BoxRenderable(renderer, {
    id: "content",
    flexGrow: 1,
    flexDirection: "row",
    overflow: "hidden",
  });

  // Examples list
  const listPanel = new BoxRenderable(renderer, {
    id: "list-panel",
    width: "50%",
    flexDirection: "column",
    border: ["right"],
    borderColor: currentTheme.colors.border,
    overflow: "hidden",
  });

  const listScroll = new ScrollBoxRenderable(renderer, {
    id: "list-scroll",
    width: "100%",
    height: "100%",
    scrollbarOptions: {
      visible: false,
    },
  });

  const listContent = new BoxRenderable(renderer, {
    id: "list-content",
    flexDirection: "column",
    padding: 1,
  });

  // Example items and section headers
  const listItems: TextRenderable[] = [];

  function createSectionHeader(tier: string): TextRenderable {
    return new TextRenderable(renderer, {
      id: `section-${tier.replace(/\s+/g, "-").toLowerCase()}`,
      content: t`${bold(fg(currentTheme.colors.accent5)(`── ${tier} ──`))}`,
      fg: currentTheme.colors.accent5,
      marginTop: 1,
      marginBottom: 0,
    });
  }

  function createExampleItem(example: Example, index: number): TextRenderable {
    const isSelected = index === selectedIndex;
    const prefix = isSelected ? "▶ " : "  ";
    const content = `${prefix}${example.id}. ${example.name}`;

    return new TextRenderable(renderer, {
      id: `example-${example.id}`,
      content: isSelected ? t`${bold(fg(currentTheme.colors.accent2)(content))}` : content,
      fg: isSelected ? undefined : currentTheme.colors.fg,
      bg: isSelected ? currentTheme.colors.bgHighlight : undefined,
      width: "100%",
    });
  }

  function filterExamples() {
    if (!searchQuery) {
      filteredExamples = [...examples];
    } else {
      const query = searchQuery.toLowerCase();
      filteredExamples = examples.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.tier.toLowerCase().includes(query) ||
          e.id.includes(query)
      );
    }
    selectedIndex = Math.min(selectedIndex, Math.max(0, filteredExamples.length - 1));
    renderList();
    updatePreview();
    resultCount.content = `${filteredExamples.length} examples`;
  }

  function renderList() {
    // Clear all items (headers + examples)
    listItems.forEach((item) => listContent.remove(item.id));
    listItems.length = 0;

    let currentTier = "";
    filteredExamples.forEach((example, i) => {
      // Add section header when tier changes
      if (example.tier !== currentTier) {
        currentTier = example.tier;
        const header = createSectionHeader(currentTier);
        listItems.push(header);
        listContent.add(header);
      }

      const item = createExampleItem(example, i);
      listItems.push(item);
      listContent.add(item);
    });
  }

  function scrollToSelection() {
    // Calculate scroll position accounting for section headers
    let scrollY = 0;
    let currentTier = "";
    for (let i = 0; i < selectedIndex && i < filteredExamples.length; i++) {
      if (filteredExamples[i].tier !== currentTier) {
        currentTier = filteredExamples[i].tier;
        scrollY++; // Account for section header
      }
      scrollY++; // Account for example item
    }
    // Account for the header of the selected item's section if it's the first in that section
    if (selectedIndex < filteredExamples.length && filteredExamples[selectedIndex].tier !== currentTier) {
      scrollY++; // Add one more for the new section header
    }
    listScroll.scrollTo({ x: 0, y: scrollY });
  }

  listScroll.add(listContent);
  listPanel.add(listScroll);

  // Preview panel
  const previewPanel = new BoxRenderable(renderer, {
    id: "preview-panel",
    width: "50%",
    flexDirection: "column",
    padding: 2,
    backgroundColor: currentTheme.colors.bgAlt,
  });

  const previewTitle = new TextRenderable(renderer, {
    id: "preview-title",
    content: t`${bold(fg(currentTheme.colors.accent5)("Preview"))}`,
    marginBottom: 1,
  });

  const previewName = new TextRenderable(renderer, {
    id: "preview-name",
    content: "",
    fg: currentTheme.colors.fg,
  });

  const previewDesc = new TextRenderable(renderer, {
    id: "preview-desc",
    content: "",
    fg: currentTheme.colors.fgMuted,
    marginBottom: 1,
  });

  const previewPath = new TextRenderable(renderer, {
    id: "preview-path",
    content: "",
    fg: currentTheme.colors.accent3,
    marginBottom: 2,
  });

  const previewHint = new TextRenderable(renderer, {
    id: "preview-hint",
    content: "Press Enter to launch",
    fg: currentTheme.colors.success,
  });

  // ASCII preview container
  const previewAscii = new BoxRenderable(renderer, {
    id: "preview-ascii",
    flexDirection: "column",
    marginTop: 1,
    padding: 1,
    backgroundColor: currentTheme.colors.bg,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.border,
  });

  // Track preview lines for cleanup
  let previewLines: TextRenderable[] = [];

  previewPanel.add(previewTitle);
  previewPanel.add(previewName);
  previewPanel.add(previewDesc);
  previewPanel.add(previewAscii);
  previewPanel.add(previewPath);
  previewPanel.add(previewHint);

  function updatePreview() {
    const example = filteredExamples[selectedIndex];

    if (example) {
      previewName.content = t`${bold(fg(currentTheme.colors.fg)(`${example.id}. ${example.name}`))}`;
      previewDesc.content = example.description;
      previewPath.content = `Path: ${example.path}`;

      // Clear old preview lines
      previewLines.forEach(line => previewAscii.remove(line.id));
      previewLines = [];

      // Render new preview lines
      if (example.preview && example.preview.length > 0) {
        example.preview.forEach((line, i) => {
          const textLine = new TextRenderable(renderer, {
            id: `preview-line-${i}`,
            content: line,
            fg: currentTheme.colors.accent3,
          });
          previewLines.push(textLine);
          previewAscii.add(textLine);
        });
      }
    } else {
      previewName.content = t`${bold(fg(currentTheme.colors.fg)("No example selected"))}`;
      previewDesc.content = "No examples match your search";
      previewPath.content = "";

      // Clear preview
      previewLines.forEach(line => previewAscii.remove(line.id));
      previewLines = [];
    }
  }

  content.add(listPanel);
  content.add(previewPanel);

  // Footer/shortcuts
  const footer = new BoxRenderable(renderer, {
    id: "footer",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
    backgroundColor: currentTheme.colors.bgHighlight,
    border: ["top"],
    borderColor: currentTheme.colors.border,
  });

  const shortcuts = [
    "↑/↓: Navigate",
    "/: Search",
    "Enter: Launch",
    "t: Theme",
    "q: Quit",
  ];

  const shortcutsBox = new BoxRenderable(renderer, {
    id: "shortcuts",
    flexDirection: "row",
    gap: 3,
  });

  // Track shortcut text renderables for theme updates
  const shortcutTexts: TextRenderable[] = [];
  shortcuts.forEach((shortcut, i) => {
    const text = new TextRenderable(renderer, {
      id: `shortcut-${i}`,
      content: shortcut,
      fg: currentTheme.colors.fgMuted,
    });
    shortcutTexts.push(text);
    shortcutsBox.add(text);
  });

  const themeDisplay = new TextRenderable(renderer, {
    id: "theme-display",
    content: `Theme: ${currentTheme.name}`,
    fg: currentTheme.colors.accent2,
  });

  footer.add(shortcutsBox);
  footer.add(themeDisplay);

  // Build tree
  main.add(header);
  main.add(searchBar);
  main.add(content);
  main.add(footer);
  renderer.root.add(main);

  // Initial render
  renderList();
  updatePreview();

  function updateTitleArt() {
    titleAscii.color = [currentTheme.colors.accent2, currentTheme.colors.accent1];
    playgroundLabel.fg = currentTheme.colors.accent2;
  }

  function applyTheme() {
    // Main container
    main.backgroundColor = currentTheme.colors.bg;

    // Header
    header.backgroundColor = currentTheme.colors.bgAlt;
    header.borderColor = currentTheme.colors.border;

    // Search bar
    searchBar.borderColor = currentTheme.colors.border;
    searchIcon.fg = currentTheme.colors.fgMuted;
    searchInput.backgroundColor = currentTheme.colors.bg;
    searchInput.focusedBackgroundColor = currentTheme.colors.bgHighlight;
    searchInput.textColor = currentTheme.colors.fg;
    searchInput.placeholderColor = currentTheme.colors.fgMuted;
    searchInput.cursorColor = currentTheme.colors.accent2;
    resultCount.fg = currentTheme.colors.fgMuted;

    // List panel
    listPanel.borderColor = currentTheme.colors.border;
    listScroll.scrollbarOptions = {
      visible: false,
    };

    // Preview panel
    previewPanel.backgroundColor = currentTheme.colors.bgAlt;
    previewTitle.content = t`${bold(fg(currentTheme.colors.accent5)("Preview"))}`;
    previewName.fg = currentTheme.colors.fg;
    previewDesc.fg = currentTheme.colors.fgMuted;
    previewPath.fg = currentTheme.colors.accent3;
    previewHint.fg = currentTheme.colors.success;

    // Preview ASCII container
    previewAscii.backgroundColor = currentTheme.colors.bg;
    previewAscii.borderColor = currentTheme.colors.border;
    previewLines.forEach(line => {
      line.fg = currentTheme.colors.accent3;
    });

    // Footer
    footer.backgroundColor = currentTheme.colors.bgHighlight;
    footer.borderColor = currentTheme.colors.border;
    themeDisplay.fg = currentTheme.colors.accent2;
    themeDisplay.content = `Theme: ${currentTheme.name}`;

    // Update footer shortcut text colors
    shortcutTexts.forEach((text) => {
      text.fg = currentTheme.colors.fgMuted;
    });

    // Re-render title art with new colors
    updateTitleArt();

    // Re-render list items with new theme
    renderList();
    updatePreview();
  }

  function cycleTheme() {
    const themeNames = listThemes();
    const currentEntry = Object.entries(themes).find(([_, thm]) => thm === currentTheme);
    const currentKey = currentEntry ? currentEntry[0] : "dracula";
    const currentIndex = themeNames.indexOf(currentKey);
    // Handle case where currentIndex is -1 (theme not found) by starting at index 0
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themeNames.length;
    currentTheme = themes[themeNames[nextIndex]];
    applyTheme();  // Apply theme to all components
  }

  // Return a promise that resolves when the launcher session ends
  // true = restart launcher, false = exit to shell
  return new Promise<boolean>((resolve) => {
    function launchExample() {
      const example = filteredExamples[selectedIndex];
      if (!example) return;

      // Clear screen and run example
      renderer.destroy();

      console.log(`\nLaunching: ${example.name}...\n`);

      const child = spawn("bun", ["run", example.path], {
        stdio: "inherit",
        cwd: process.cwd(),
      });

      child.on("close", () => {
        resolve(true); // Restart launcher when example exits
      });

      child.on("error", (err) => {
        // Log the actual error before falling back
        console.log(`Bun spawn error: ${err.message}`);
        console.log("Trying with npx tsx as fallback...");
        const fallback = spawn("npx", ["tsx", example.path], {
          stdio: "inherit",
          cwd: process.cwd(),
        });

        fallback.on("close", () => {
          resolve(true); // Restart launcher when example exits
        });

        fallback.on("error", () => {
          console.error("Failed to launch example. Make sure bun or tsx is installed.");
          process.exit(1);
        });
      });
    }

    // Handle keyboard
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
      // Global shortcuts
      if (key.name === "q" && !key.ctrl && !searchFocused) {
        renderer.destroy();
        resolve(false); // Exit to shell
        return;
      }

      // Ctrl+C exits to shell
      if (key.name === "c" && key.ctrl) {
        renderer.destroy();
        resolve(false); // Exit to shell
        return;
      }

      if (key.name === "t" && !searchFocused) {
        cycleTheme();
        return;
      }

      if (key.name === "/" && !searchFocused) {
        searchInput.focus();
        return;
      }

      if (key.name === "return" || key.name === "enter") {
        if (searchFocused) {
          searchInput.blur();
        } else {
          launchExample();
        }
        return;
      }

      // Navigation
      if (!searchFocused) {
        switch (key.name) {
          case "up":
          case "k":
            selectedIndex = Math.max(0, selectedIndex - 1);
            renderList();
            updatePreview();
            scrollToSelection();
            break;
          case "down":
          case "j":
            selectedIndex = Math.min(filteredExamples.length - 1, selectedIndex + 1);
            renderList();
            updatePreview();
            scrollToSelection();
            break;
          case "home":
            selectedIndex = 0;
            renderList();
            updatePreview();
            scrollToSelection();
            break;
          case "end":
            selectedIndex = filteredExamples.length - 1;
            renderList();
            updatePreview();
            scrollToSelection();
            break;
          case "pageup":
            selectedIndex = Math.max(0, selectedIndex - 5);
            renderList();
            updatePreview();
            scrollToSelection();
            break;
          case "pagedown":
            selectedIndex = Math.min(filteredExamples.length - 1, selectedIndex + 5);
            renderList();
            updatePreview();
            scrollToSelection();
            break;
        }
      }
    });
  }); // End of Promise
}

async function main() {
  while (true) {
    const shouldContinue = await runLauncherSession();
    if (!shouldContinue) break;
  }
}

main().catch(console.error);
