/**
 * Example 24: Full Application
 *
 * Demonstrates a complete application combining all concepts:
 * - Theme system
 * - Multiple views/screens
 * - Shared widgets (status bar, modal, toast)
 * - Full keyboard navigation
 * - Command palette
 */

import {
  TextRenderable,
  BoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { themes, type Theme, theme as defaultTheme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";
import { isCtrl, isEscape } from "@shared/utils/keymap";

type ViewType = "dashboard" | "tasks" | "settings" | "help";

createExampleApp(({ renderer, addTimeout }) => {
  // Application state
  let currentTheme: Theme = defaultTheme;
  let currentView: ViewType = "dashboard";
  let showCommandPalette = false;
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;
  let previousFocusView: ViewType | null = null;

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    backgroundColor: currentTheme.colors.bg,
  });

  // ==================== HEADER ====================
  const headerBar = new BoxRenderable(renderer, {
    id: "header",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
    backgroundColor: currentTheme.colors.bgAlt,
    border: ["bottom"],
    borderColor: currentTheme.colors.border,
  });

  const appTitle = new TextRenderable(renderer, {
    id: "app-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("OpenTUI Demo App"))}`,
  });

  const navTabs = new BoxRenderable(renderer, {
    id: "nav-tabs",
    flexDirection: "row",
    gap: 2,
  });

  const tabLabels: Record<ViewType, string> = {
    dashboard: "Dashboard",
    tasks: "Tasks",
    settings: "Settings",
    help: "Help",
  };

  const tabRenderables: Map<ViewType, TextRenderable> = new Map();

  (Object.keys(tabLabels) as ViewType[]).forEach((view) => {
    const isActive = view === currentView;
    const tabContent = ` ${tabLabels[view]} `;
    const tab = new TextRenderable(renderer, {
      id: `tab-${view}`,
      content: isActive ? t`${bold(tabContent)}` : tabContent,
      fg: isActive ? currentTheme.colors.bg : currentTheme.colors.fg,
      bg: isActive ? currentTheme.colors.accent2 : undefined,
    });
    tabRenderables.set(view, tab);
    navTabs.add(tab);
  });

  const shortcutHint = new TextRenderable(renderer, {
    id: "shortcut-hint",
    content: "Ctrl+P: Commands",
    fg: currentTheme.colors.fgMuted,
  });

  headerBar.add(appTitle);
  headerBar.add(navTabs);
  headerBar.add(shortcutHint);

  // ==================== CONTENT AREA ====================
  const contentArea = new BoxRenderable(renderer, {
    id: "content",
    flexGrow: 1,
    padding: 2,
    overflow: "hidden",
  });

  // View containers
  const dashboardView = new BoxRenderable(renderer, {
    id: "dashboard-view",
    flexDirection: "column",
    gap: 2,
    width: "100%",
    height: "100%",
  });

  const tasksView = new BoxRenderable(renderer, {
    id: "tasks-view",
    flexDirection: "column",
    gap: 1,
    width: "100%",
    height: "100%",
  });

  const settingsView = new BoxRenderable(renderer, {
    id: "settings-view",
    flexDirection: "column",
    gap: 2,
    width: "100%",
    height: "100%",
  });

  const helpView = new BoxRenderable(renderer, {
    id: "help-view",
    flexDirection: "column",
    gap: 1,
    width: "100%",
    height: "100%",
  });

  // ==================== DASHBOARD CONTENT ====================
  const dashTitle = new TextRenderable(renderer, {
    id: "dash-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("Welcome to the Dashboard"))}`,
  });

  const statsRow = new BoxRenderable(renderer, {
    id: "stats-row",
    flexDirection: "row",
    gap: 2,
  });

  const stats = [
    { label: "Active Tasks", value: "12", color: currentTheme.colors.accent3 },
    { label: "Completed", value: "48", color: currentTheme.colors.success },
    { label: "Pending", value: "5", color: currentTheme.colors.warning },
    { label: "Overdue", value: "2", color: currentTheme.colors.error },
  ];

  stats.forEach((stat, i) => {
    const card = new BoxRenderable(renderer, {
      id: `stat-card-${i}`,
      flexDirection: "column",
      padding: 1,
      border: true,
      borderStyle: "rounded",
      borderColor: currentTheme.colors.border,
      backgroundColor: currentTheme.colors.bgAlt,
      width: 20,
      alignItems: "center",
    });

    const label = new TextRenderable(renderer, {
      id: `stat-label-${i}`,
      content: stat.label,
      fg: currentTheme.colors.fgMuted,
    });

    const value = new TextRenderable(renderer, {
      id: `stat-value-${i}`,
      content: t`${bold(fg(stat.color)(stat.value))}`,
    });

    card.add(label);
    card.add(value);
    statsRow.add(card);
  });

  const recentActivity = new BoxRenderable(renderer, {
    id: "recent-activity",
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.border,
    backgroundColor: currentTheme.colors.bgAlt,
    width: 60,
  });

  const activityTitle = new TextRenderable(renderer, {
    id: "activity-title",
    content: t`${bold(fg(currentTheme.colors.accent5)("Recent Activity"))}`,
  });

  const activities = [
    "Task 'Fix login bug' completed",
    "New task 'Update docs' created",
    "Theme changed to Dracula",
    "Settings saved",
  ];

  recentActivity.add(activityTitle);
  activities.forEach((activity, i) => {
    const item = new TextRenderable(renderer, {
      id: `activity-${i}`,
      content: `  ${activity}`,
      fg: currentTheme.colors.fg,
    });
    recentActivity.add(item);
  });

  dashboardView.add(dashTitle);
  dashboardView.add(statsRow);
  dashboardView.add(recentActivity);

  // ==================== TASKS CONTENT ====================
  const tasksTitle = new TextRenderable(renderer, {
    id: "tasks-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("Task List"))}`,
  });

  const tasksList = new BoxRenderable(renderer, {
    id: "tasks-list",
    flexDirection: "column",
    gap: 1,
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.border,
    backgroundColor: currentTheme.colors.bgAlt,
  });

  const tasks = [
    { text: "Review pull requests", done: false, priority: "high" },
    { text: "Update documentation", done: false, priority: "medium" },
    { text: "Fix navigation bug", done: true, priority: "high" },
    { text: "Write unit tests", done: false, priority: "low" },
    { text: "Deploy to staging", done: true, priority: "medium" },
  ];

  tasks.forEach((task, i) => {
    const priorityColors: Record<string, string> = {
      high: currentTheme.colors.error,
      medium: currentTheme.colors.warning,
      low: currentTheme.colors.success,
    };

    const item = new TextRenderable(renderer, {
      id: `task-${i}`,
      content: `${task.done ? "  [x]" : "  [ ]"} [${task.priority.toUpperCase()}] ${task.text}`,
      fg: task.done ? currentTheme.colors.fgMuted : priorityColors[task.priority],
    });
    tasksList.add(item);
  });

  tasksView.add(tasksTitle);
  tasksView.add(tasksList);

  // ==================== SETTINGS CONTENT ====================
  const settingsTitle = new TextRenderable(renderer, {
    id: "settings-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("Settings"))}`,
  });

  const themeSection = new BoxRenderable(renderer, {
    id: "theme-section",
    flexDirection: "column",
    gap: 1,
  });

  const themeLabel = new TextRenderable(renderer, {
    id: "theme-label",
    content: "Theme:",
    fg: currentTheme.colors.fg,
  });

  const themeNames = Object.keys(themes);
  const themeSelect = new SelectRenderable(renderer, {
    id: "theme-select",
    width: 30,
    height: 6,
    options: themeNames.map((name) => ({
      name: themes[name].name,
      description: `Apply ${themes[name].name} theme`,
    })),
    backgroundColor: currentTheme.colors.bg,
    focusedBackgroundColor: currentTheme.colors.bgHighlight,
    selectedTextColor: currentTheme.colors.accent3,
    textColor: currentTheme.colors.fg,
  });

  themeSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index: number) => {
    const themeName = themeNames[index];
    currentTheme = themes[themeName];
    applyTheme();
    showToast(`Theme changed to ${currentTheme.name}`);
  });

  themeSection.add(themeLabel);
  themeSection.add(themeSelect);

  settingsView.add(settingsTitle);
  settingsView.add(themeSection);

  // ==================== HELP CONTENT ====================
  const helpTitle = new TextRenderable(renderer, {
    id: "help-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("Keyboard Shortcuts"))}`,
  });

  const shortcuts = [
    ["Ctrl+P", "Open command palette"],
    ["1-4", "Switch views"],
    ["Tab", "Navigate between elements"],
    ["Enter", "Select/activate"],
    ["Escape", "Close dialogs"],
    ["q", "Quit application"],
  ];

  const shortcutsBox = new BoxRenderable(renderer, {
    id: "shortcuts-box",
    flexDirection: "column",
    padding: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.border,
    backgroundColor: currentTheme.colors.bgAlt,
  });

  shortcuts.forEach(([key, desc], i) => {
    const row = new BoxRenderable(renderer, {
      id: `shortcut-row-${i}`,
      flexDirection: "row",
      gap: 2,
    });

    const keyText = new TextRenderable(renderer, {
      id: `shortcut-key-${i}`,
      content: t`${bold(fg(currentTheme.colors.accent3)(key.padEnd(10)))}`,
    });

    const descText = new TextRenderable(renderer, {
      id: `shortcut-desc-${i}`,
      content: desc,
      fg: currentTheme.colors.fg,
    });

    row.add(keyText);
    row.add(descText);
    shortcutsBox.add(row);
  });

  helpView.add(helpTitle);
  helpView.add(shortcutsBox);

  // ==================== STATUS BAR ====================
  const statusBar = new BoxRenderable(renderer, {
    id: "status-bar",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 1,
    backgroundColor: currentTheme.colors.bgHighlight,
    border: ["top"],
    borderColor: currentTheme.colors.border,
  });

  const statusLeft = new TextRenderable(renderer, {
    id: "status-left",
    content: `View: ${tabLabels[currentView]}`,
    fg: currentTheme.colors.fg,
  });

  const statusRight = new TextRenderable(renderer, {
    id: "status-right",
    content: `Theme: ${currentTheme.name} | Press q to exit`,
    fg: currentTheme.colors.fgMuted,
  });

  statusBar.add(statusLeft);
  statusBar.add(statusRight);

  // ==================== TOAST ====================
  const toastBox = new BoxRenderable(renderer, {
    id: "toast",
    position: "absolute",
    right: 2,
    top: 4,
    padding: 1,
    backgroundColor: currentTheme.colors.success,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.fg,
    visible: false,
  });

  const toastText = new TextRenderable(renderer, {
    id: "toast-text",
    content: "",
    fg: currentTheme.colors.bg,
  });

  toastBox.add(toastText);

  // ==================== COMMAND PALETTE ====================
  const commandPalette = new BoxRenderable(renderer, {
    id: "command-palette",
    position: "absolute",
    left: "20%",
    top: 5,
    width: "60%",
    backgroundColor: currentTheme.colors.bgAlt,
    border: true,
    borderStyle: "rounded",
    borderColor: currentTheme.colors.accent2,
    padding: 1,
    visible: false,
  });

  const paletteTitle = new TextRenderable(renderer, {
    id: "palette-title",
    content: t`${bold(fg(currentTheme.colors.accent2)("Command Palette (Ctrl+P to close)"))}`,
  });

  const commands = [
    { name: "Go to Dashboard", action: () => switchView("dashboard") },
    { name: "Go to Tasks", action: () => switchView("tasks") },
    { name: "Go to Settings", action: () => switchView("settings") },
    { name: "Go to Help", action: () => switchView("help") },
    { name: "Toggle Theme", action: () => cycleTheme() },
  ];

  const paletteList = new SelectRenderable(renderer, {
    id: "palette-list",
    width: "100%",
    height: 6,
    options: commands.map((cmd) => ({ name: cmd.name, description: "" })),
    backgroundColor: currentTheme.colors.bg,
    focusedBackgroundColor: currentTheme.colors.bgHighlight,
    selectedTextColor: currentTheme.colors.accent3,
    textColor: currentTheme.colors.fg,
  });

  paletteList.on(SelectRenderableEvents.ITEM_SELECTED, (index: number) => {
    commands[index].action();
    toggleCommandPalette();
  });

  commandPalette.add(paletteTitle);
  commandPalette.add(paletteList);

  // ==================== BUILD TREE ====================
  contentArea.add(dashboardView);
  contentArea.add(tasksView);
  contentArea.add(settingsView);
  contentArea.add(helpView);

  main.add(headerBar);
  main.add(contentArea);
  main.add(statusBar);
  main.add(toastBox);
  main.add(commandPalette);
  renderer.root.add(main);

  // ==================== FUNCTIONS ====================
  function switchView(view: ViewType) {
    currentView = view;

    // Update tabs
    tabRenderables.forEach((tab, v) => {
      const isActive = v === currentView;
      const tabContent = ` ${tabLabels[v]} `;
      tab.content = isActive ? t`${bold(tabContent)}` : tabContent;
      tab.fg = isActive ? currentTheme.colors.bg : currentTheme.colors.fg;
      tab.bg = isActive ? currentTheme.colors.accent2 : undefined;
    });

    // Show/hide views
    dashboardView.visible = view === "dashboard";
    tasksView.visible = view === "tasks";
    settingsView.visible = view === "settings";
    helpView.visible = view === "help";

    // Update status
    statusLeft.content = `View: ${tabLabels[view]}`;

    // Focus theme select if on settings
    if (view === "settings") {
      themeSelect.focus();
    }
  }

  function applyTheme() {
    main.backgroundColor = currentTheme.colors.bg;
    headerBar.backgroundColor = currentTheme.colors.bgAlt;
    headerBar.borderColor = currentTheme.colors.border;
    statusBar.backgroundColor = currentTheme.colors.bgHighlight;
    statusBar.borderColor = currentTheme.colors.border;
    statusRight.content = `Theme: ${currentTheme.name} | Press q to exit`;
    statusRight.fg = currentTheme.colors.fgMuted;
    // Re-render current view to apply colors
    switchView(currentView);
  }

  function cycleTheme() {
    const themeNames = Object.keys(themes);
    const currentEntry = Object.entries(themes).find(([_, t]) => t === currentTheme);
    const currentKey = currentEntry ? currentEntry[0] : "dracula";
    const currentIndex = themeNames.indexOf(currentKey);
    // Handle case where currentIndex is -1 (theme not found) by starting at index 0
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themeNames.length;
    currentTheme = themes[themeNames[nextIndex]];
    applyTheme();
    showToast(`Theme: ${currentTheme.name}`);
  }

  function showToast(message: string) {
    toastText.content = t`${bold(fg(currentTheme.colors.bg)(message))}`;
    toastBox.visible = true;

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastBox.visible = false;
    }, 2000);
    addTimeout(toastTimeout);
  }

  function toggleCommandPalette() {
    showCommandPalette = !showCommandPalette;
    commandPalette.visible = showCommandPalette;
    if (showCommandPalette) {
      // Store previous view for focus restoration
      previousFocusView = currentView;
      paletteList.focus();
    } else {
      // Restore focus to settings select if we were on settings
      if (previousFocusView === "settings") {
        themeSelect.focus();
      }
      previousFocusView = null;
    }
  }

  // Initial view
  switchView("dashboard");

  // ==================== KEYBOARD HANDLING ====================
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    // Global shortcuts
    if (isCtrl(key, "p")) {
      toggleCommandPalette();
      return;
    }

    if (isEscape(key)) {
      if (showCommandPalette) {
        toggleCommandPalette();
      }
      return;
    }

    // View switching with number keys
    if (!showCommandPalette) {
      switch (key.name) {
        case "1":
          switchView("dashboard");
          break;
        case "2":
          switchView("tasks");
          break;
        case "3":
          switchView("settings");
          break;
        case "4":
          switchView("help");
          break;
        case "t":
          cycleTheme();
          break;
      }
    }
  });
}, {
  onKeyPress: (key) => {
    // Let q through only if command palette is not showing
    // The default q handler will handle exit
    return false;
  },
});
