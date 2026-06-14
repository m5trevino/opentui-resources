/**
 * Example 07: Diff Viewer
 *
 * Demonstrates DiffRenderable for git-style diff rendering:
 * - Unified and split view modes
 * - Addition and deletion highlighting
 * - Line numbers
 * - Diff statistics
 */

import {
  TextRenderable,
  BoxRenderable,
  DiffRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { createTwoFilesPatch } from "diff";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

/**
 * Generate a unified diff string from old and new content
 */
function generateUnifiedDiff(
  filename: string,
  oldContent: string,
  newContent: string
): string {
  return createTwoFilesPatch(
    `a/${filename}`,
    `b/${filename}`,
    oldContent,
    newContent
  );
}

createExampleApp(({ renderer }) => {
  // Sample diff content
  const diffs = [
    {
      name: "config.ts",
      oldContent: `export const config = {
  port: 3000,
  host: 'localhost',
  debug: false,
  timeout: 5000,
};`,
      newContent: `export const config = {
  port: 8080,
  host: '0.0.0.0',
  debug: true,
  timeout: 10000,
  maxConnections: 100,
};`,
    },
    {
      name: "utils.ts",
      oldContent: `function formatDate(date) {
  return date.toISOString();
}

function parseDate(str) {
  return new Date(str);
}`,
      newContent: `function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function parseDate(str: string): Date {
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date string');
  }
  return parsed;
}`,
    },
    {
      name: "api.ts",
      oldContent: `async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}`,
      newContent: `async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
  }

  return res.json() as Promise<T>;
}`,
    },
  ];

  let currentDiffIndex = 0;
  let viewMode: "unified" | "split" = "unified";

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
    title: "Diff Viewer",
    rightContent: `Mode: ${viewMode}`,
    rightColor: theme.colors.accent5,
  });

  // File tabs
  const tabs = new BoxRenderable(renderer, {
    id: "tabs",
    flexDirection: "row",
    gap: 1,
  });

  const tabRenderables: TextRenderable[] = [];

  diffs.forEach((diff, i) => {
    const isActive = i === currentDiffIndex;
    const tab = new TextRenderable(renderer, {
      id: `tab-${i}`,
      content: isActive
        ? t`${bold(fg(theme.colors.bg)(` ${diff.name} `))}`
        : ` ${diff.name} `,
      fg: isActive ? undefined : theme.colors.fg,
      bg: isActive ? theme.colors.accent2 : theme.colors.bgHighlight,
    });
    tabRenderables.push(tab);
    tabs.add(tab);
  });

  // Stats
  const stats = new TextRenderable(renderer, {
    id: "stats",
    content: "",
    fg: theme.colors.fgMuted,
  });

  // Diff container
  const diffContainer = new BoxRenderable(renderer, {
    id: "diff-container",
    flexGrow: 1,
    width: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    padding: 1,
    overflow: "hidden",
  });

  const currentDiff = diffs[currentDiffIndex];
  const diffView = new DiffRenderable(renderer, {
    id: "diff-view",
    diff: generateUnifiedDiff(
      currentDiff.name,
      currentDiff.oldContent,
      currentDiff.newContent
    ),
    view: viewMode,
    showLineNumbers: true,
    addedSignColor: theme.colors.success,
    addedBg: "#2a4d3a",
    removedSignColor: theme.colors.error,
    removedBg: "#4d2a2a",
    lineNumberFg: theme.colors.fgMuted,
    width: "100%",
  });

  diffContainer.add(diffView);

  function calculateStats(oldText: string, newText: string) {
    const oldLines = oldText.split("\n").length;
    const newLines = newText.split("\n").length;
    const added = Math.max(0, newLines - oldLines);
    const removed = Math.max(0, oldLines - newLines);
    return { added, removed, oldLines, newLines };
  }

  function updateDiff() {
    const currentDiffData = diffs[currentDiffIndex];
    const { added, removed } = calculateStats(
      currentDiffData.oldContent,
      currentDiffData.newContent
    );

    // Update diff view
    diffView.diff = generateUnifiedDiff(
      currentDiffData.name,
      currentDiffData.oldContent,
      currentDiffData.newContent
    );
    diffView.view = viewMode;

    // Update mode indicator
    header.setRightContent(`Mode: ${viewMode}`);

    // Update stats
    stats.content = `+${added} additions, -${removed} deletions`;

    // Update tabs
    tabRenderables.forEach((tab, i) => {
      const isActive = i === currentDiffIndex;
      tab.content = isActive
        ? t`${bold(fg(theme.colors.bg)(` ${diffs[i].name} `))}`
        : ` ${diffs[i].name} `;
      tab.fg = isActive ? undefined : theme.colors.fg;
      tab.bg = isActive ? theme.colors.accent2 : theme.colors.bgHighlight;
    });
  }

  // Instructions
  const keyBar = createKeyBindingBar(
    renderer,
    [
      { key: "←/→", action: "Switch file" },
      { key: "m", action: "Toggle mode" },
      { key: "1-3", action: "Direct select" },
      { key: "q", action: "Exit" },
    ],
    { theme }
  );

  // Build component tree
  main.add(header.getContainer());
  main.add(tabs);
  main.add(stats);
  main.add(diffContainer);
  main.add(keyBar);
  renderer.root.add(main);

  // Initialize
  updateDiff();

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    switch (key.name) {
      case "left":
        currentDiffIndex = (currentDiffIndex - 1 + diffs.length) % diffs.length;
        updateDiff();
        break;
      case "right":
        currentDiffIndex = (currentDiffIndex + 1) % diffs.length;
        updateDiff();
        break;
      case "m":
        viewMode = viewMode === "unified" ? "split" : "unified";
        updateDiff();
        break;
      case "1":
      case "2":
      case "3":
        const idx = parseInt(key.name) - 1;
        if (idx < diffs.length) {
          currentDiffIndex = idx;
          updateDiff();
        }
        break;
    }
  });
});
