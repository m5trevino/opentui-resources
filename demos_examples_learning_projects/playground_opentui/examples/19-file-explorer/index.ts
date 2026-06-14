/**
 * Example 18: File Explorer
 *
 * Demonstrates a tree-view file browser:
 * - Directory tree navigation
 * - File icons and types
 * - Preview panel
 * - Keyboard navigation
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

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
  expanded?: boolean;
  size?: string;
  modified?: string;
  content?: string;
}

createExampleApp(({ renderer }) => {
  // Sample file tree
  const fileTree: FileNode = {
    name: "project",
    type: "directory",
    expanded: true,
    children: [
      {
        name: "src",
        type: "directory",
        expanded: true,
        children: [
          {
            name: "index.ts",
            type: "file",
            size: "2.4 KB",
            modified: "2024-01-15",
            content: 'import { App } from "./app";\n\nconst app = new App();\napp.start();',
          },
          {
            name: "app.ts",
            type: "file",
            size: "5.1 KB",
            modified: "2024-01-14",
            content: 'export class App {\n  start() {\n    console.log("Starting...");\n  }\n}',
          },
          {
            name: "components",
            type: "directory",
            expanded: false,
            children: [
              { name: "Button.tsx", type: "file", size: "1.2 KB", modified: "2024-01-10" },
              { name: "Input.tsx", type: "file", size: "0.8 KB", modified: "2024-01-10" },
              { name: "Modal.tsx", type: "file", size: "2.1 KB", modified: "2024-01-12" },
            ],
          },
          {
            name: "utils",
            type: "directory",
            expanded: false,
            children: [
              { name: "helpers.ts", type: "file", size: "3.2 KB", modified: "2024-01-08" },
              { name: "constants.ts", type: "file", size: "0.5 KB", modified: "2024-01-05" },
            ],
          },
        ],
      },
      {
        name: "tests",
        type: "directory",
        expanded: false,
        children: [
          { name: "app.test.ts", type: "file", size: "1.8 KB", modified: "2024-01-14" },
          { name: "utils.test.ts", type: "file", size: "2.3 KB", modified: "2024-01-09" },
        ],
      },
      {
        name: "package.json",
        type: "file",
        size: "1.1 KB",
        modified: "2024-01-15",
        content: '{\n  "name": "project",\n  "version": "1.0.0",\n  "main": "src/index.ts"\n}',
      },
      {
        name: "tsconfig.json",
        type: "file",
        size: "0.4 KB",
        modified: "2024-01-01",
        content: '{\n  "compilerOptions": {\n    "target": "ES2022"\n  }\n}',
      },
      {
        name: "README.md",
        type: "file",
        size: "2.8 KB",
        modified: "2024-01-15",
        content: "# Project\n\nA sample project for demonstration.\n\n## Usage\n\n```bash\nnpm start\n```",
      },
      { name: ".gitignore", type: "file", size: "0.1 KB", modified: "2024-01-01" },
    ],
  };

  // Flatten tree for navigation
  interface FlatNode {
    node: FileNode;
    depth: number;
    path: string;
    isLast: boolean; // Is this the last child of its parent?
    parentIsLasts: boolean[]; // Track ancestors' isLast status for drawing │
  }

  function flattenTree(
    node: FileNode,
    depth: number = 0,
    path: string = "",
    isLast: boolean = true,
    parentIsLasts: boolean[] = []
  ): FlatNode[] {
    const result: FlatNode[] = [];
    const currentPath = path ? `${path}/${node.name}` : node.name;

    result.push({ node, depth, path: currentPath, isLast, parentIsLasts });

    if (node.type === "directory" && node.expanded && node.children) {
      const childCount = node.children.length;
      node.children.forEach((child, i) => {
        const childIsLast = i === childCount - 1;
        result.push(
          ...flattenTree(
            child,
            depth + 1,
            currentPath,
            childIsLast,
            [...parentIsLasts, isLast]
          )
        );
      });
    }

    return result;
  }

  let flatNodes = flattenTree(fileTree);
  let selectedIndex = 0;

  // File type icons with emojis
  function getIcon(node: FileNode): string {
    if (node.type === "directory") {
      return node.expanded ? "📂" : "📁";
    }

    const ext = node.name.split(".").pop()?.toLowerCase();
    const name = node.name.toLowerCase();

    // Config files by name
    if (
      name.startsWith(".") ||
      name.endsWith("config.js") ||
      name.endsWith("config.ts") ||
      name.endsWith("rc")
    ) {
      return "⚙️";
    }

    switch (ext) {
      case "ts":
      case "tsx":
        return "🔷";
      case "js":
      case "jsx":
        return "🟡";
      case "json":
        return "📋";
      case "md":
        return "📝";
      case "css":
      case "scss":
      case "less":
        return "🎨";
      case "html":
        return "🌐";
      default:
        return "📄";
    }
  }

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
    title: "File Explorer",
    rightContent: "project",
  });

  const pathDisplay = header;

  // Content area (tree + preview)
  const content = new BoxRenderable(renderer, {
    id: "content",
    flexGrow: 1,
    flexDirection: "row",
    gap: 2,
    marginTop: 1,
  });

  // Tree panel
  const treePanel = new BoxRenderable(renderer, {
    id: "tree-panel",
    width: 40,
    height: "100%",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    overflow: "hidden",
  });

  const treeScroll = new ScrollBoxRenderable(renderer, {
    id: "tree-scroll",
    width: "100%",
    height: "100%",
    scrollbarOptions: { visible: true },
  });

  const treeContent = new BoxRenderable(renderer, {
    id: "tree-content",
    flexDirection: "column",
    padding: 1,
  });

  // Create tree item renderables
  const treeItems: TextRenderable[] = [];

  function renderTree() {
    // Clear existing items
    treeItems.forEach((item) => (item.content = ""));

    flatNodes = flattenTree(fileTree);

    flatNodes.forEach((flatNode, i) => {
      const { node, depth, isLast, parentIsLasts } = flatNode;
      const icon = getIcon(node);
      const name = node.name;
      const isSelected = i === selectedIndex;

      // Build tree prefix with connectors
      let prefix = "";
      if (depth > 0) {
        // Draw vertical lines for ancestors
        for (let d = 0; d < depth - 1; d++) {
          prefix += parentIsLasts[d + 1] ? "    " : "│   ";
        }
        // Draw connector for current node
        prefix += isLast ? "└── " : "├── ";
      }

      const line = `${prefix}${icon} ${name}`;

      if (!treeItems[i]) {
        const item = new TextRenderable(renderer, {
          id: `tree-item-${i}`,
          content: line,
          fg: isSelected ? theme.colors.bg : theme.colors.fg,
          bg: isSelected ? theme.colors.accent2 : undefined,
        });
        treeItems.push(item);
        treeContent.add(item);
      } else {
        treeItems[i].content = line;
        treeItems[i].fg = isSelected ? theme.colors.bg : theme.colors.fg;
        treeItems[i].bg = isSelected ? theme.colors.accent2 : undefined;
      }
    });

    // Update path display
    pathDisplay.setRightContent(flatNodes[selectedIndex]?.path || "");
  }

  treeScroll.add(treeContent);
  treePanel.add(treeScroll);

  // Preview panel
  const previewPanel = new BoxRenderable(renderer, {
    id: "preview-panel",
    flexGrow: 1,
    flexDirection: "column",
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
    padding: 1,
  });

  const previewTitle = new TextRenderable(renderer, {
    id: "preview-title",
    content: t`${bold(fg(theme.colors.accent5)("Preview"))}`,
  });

  const previewInfo = new BoxRenderable(renderer, {
    id: "preview-info",
    flexDirection: "row",
    gap: 3,
    marginBottom: 1,
  });

  const previewSize = new TextRenderable(renderer, {
    id: "preview-size",
    content: "",
    fg: theme.colors.fgMuted,
  });

  const previewModified = new TextRenderable(renderer, {
    id: "preview-modified",
    content: "",
    fg: theme.colors.fgMuted,
  });

  previewInfo.add(previewSize);
  previewInfo.add(previewModified);

  const previewContent = new TextRenderable(renderer, {
    id: "preview-content",
    content: "Select a file to preview",
    fg: theme.colors.fgMuted,
  });

  previewPanel.add(previewTitle);
  previewPanel.add(previewInfo);
  previewPanel.add(previewContent);

  content.add(treePanel);
  content.add(previewPanel);

  function updatePreview() {
    const selected = flatNodes[selectedIndex]?.node;
    if (!selected) return;

    previewTitle.content = t`${bold(fg(theme.colors.accent5)(`Preview: ${selected.name}`))}`;

    if (selected.type === "directory") {
      previewSize.content = `Items: ${selected.children?.length || 0}`;
      previewModified.content = "";
      previewContent.content = selected.expanded
        ? `Directory contents:\n${selected.children?.map((c) => `  ${getIcon(c)} ${c.name}`).join("\n") || "Empty"}`
        : "Press Enter to expand";
      previewContent.fg = theme.colors.fgMuted;
    } else {
      previewSize.content = `Size: ${selected.size || "Unknown"}`;
      previewModified.content = `Modified: ${selected.modified || "Unknown"}`;
      previewContent.content = selected.content || "(No preview available)";
      previewContent.fg = theme.colors.fg;
    }
  }

  // Instructions
  const instructions = createKeyBindingBar(
    renderer,
    [
      { key: "up/k", action: "Up" },
      { key: "down/j", action: "Down" },
      { key: "PgUp/PgDn", action: "Page" },
      { key: "Home/End", action: "Jump" },
      { key: "Enter", action: "Toggle" },
      { key: "left/h", action: "Collapse" },
      { key: "right/l", action: "Expand" },
      { key: "q", action: "Exit" },
    ],
    { theme, id: "instructions", gap: 2 }
  );
  instructions.marginTop = 1;

  // Build tree
  main.add(header.getContainer());
  main.add(content);
  main.add(instructions);
  renderer.root.add(main);

  // Initial render
  renderTree();
  updatePreview();

  // Toggle directory expansion
  function toggleDirectory(node: FileNode) {
    if (node.type === "directory") {
      node.expanded = !node.expanded;
      renderTree();
      updatePreview();
    }
  }

  function scrollToSelection() {
    treeScroll.scrollTo({ x: 0, y: selectedIndex });
  }

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    const maxIndex = flatNodes.length - 1;

    switch (key.name) {
      case "up":
      case "k":
        selectedIndex = Math.max(0, selectedIndex - 1);
        renderTree();
        updatePreview();
        scrollToSelection();
        break;
      case "down":
      case "j":
        selectedIndex = Math.min(maxIndex, selectedIndex + 1);
        renderTree();
        updatePreview();
        scrollToSelection();
        break;
      case "pageup":
        selectedIndex = Math.max(0, selectedIndex - 10);
        renderTree();
        updatePreview();
        scrollToSelection();
        break;
      case "pagedown":
        selectedIndex = Math.min(maxIndex, selectedIndex + 10);
        renderTree();
        updatePreview();
        scrollToSelection();
        break;
      case "home":
        selectedIndex = 0;
        renderTree();
        updatePreview();
        treeScroll.scrollTo({ x: 0, y: 0 });
        break;
      case "end":
        selectedIndex = maxIndex;
        renderTree();
        updatePreview();
        scrollToSelection();
        break;
      case "return":
      case "enter":
        const selected = flatNodes[selectedIndex]?.node;
        if (selected) {
          toggleDirectory(selected);
        }
        break;
      case "left":
      case "h":
        const leftNode = flatNodes[selectedIndex]?.node;
        if (leftNode?.type === "directory" && leftNode.expanded) {
          leftNode.expanded = false;
          renderTree();
          updatePreview();
        }
        break;
      case "right":
      case "l":
        const rightNode = flatNodes[selectedIndex]?.node;
        if (rightNode?.type === "directory" && !rightNode.expanded) {
          rightNode.expanded = true;
          renderTree();
          updatePreview();
        }
        break;
    }
  });
});
