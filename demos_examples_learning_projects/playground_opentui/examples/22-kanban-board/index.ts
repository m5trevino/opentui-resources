/**
 * Example 21: Kanban Board
 *
 * Demonstrates a draggable kanban-style task board:
 * - Multiple columns (Todo, In Progress, Done)
 * - Task cards with details
 * - Moving tasks between columns
 * - Keyboard navigation
 */

import {
  TextRenderable,
  BoxRenderable,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { createHeader } from "@shared/widgets/Header";
import { createKeyBindingBar } from "@shared/widgets/KeyBindingBar";

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignee?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

createExampleApp(({ renderer }) => {
  // Board state
  const columns: Column[] = [
    {
      id: "todo",
      title: "[TODO] To Do",
      color: theme.colors.accent5,
      tasks: [
        { id: 1, title: "Design homepage", description: "Create mockups for new design", priority: "high", assignee: "Alice" },
        { id: 2, title: "Write tests", description: "Add unit tests for API", priority: "medium", assignee: "Bob" },
        { id: 3, title: "Update docs", description: "Document new features", priority: "low" },
      ],
    },
    {
      id: "progress",
      title: "[WIP] In Progress",
      color: theme.colors.accent3,
      tasks: [
        { id: 4, title: "Fix login bug", description: "Auth flow broken", priority: "high", assignee: "Charlie" },
        { id: 5, title: "Refactor code", description: "Clean up utils", priority: "medium", assignee: "Alice" },
      ],
    },
    {
      id: "done",
      title: "[OK] Done",
      color: theme.colors.success,
      tasks: [
        { id: 6, title: "Setup CI/CD", description: "Configure pipelines", priority: "high", assignee: "Bob" },
        { id: 7, title: "Add logging", description: "Implement error tracking", priority: "medium" },
      ],
    },
  ];

  let selectedColumnIndex = 0;
  let selectedTaskIndex = 0;
  let isMovingTask = false;

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
    title: "Kanban Board",
    rightContent: "Navigate Mode",
    rightColor: theme.colors.fgMuted,
  });

  // Board container
  const board = new BoxRenderable(renderer, {
    id: "board",
    flexDirection: "row",
    flexGrow: 1,
    gap: 2,
    marginTop: 1,
  });

  // Create column renderables
  interface ColumnUI {
    container: BoxRenderable;
    titleText: TextRenderable;
    taskContainer: BoxRenderable;
    taskCards: BoxRenderable[];
    countText: TextRenderable;
  }

  const columnUIs: ColumnUI[] = [];

  function getPriorityIcon(priority: string): string {
    switch (priority) {
      case "high":
        return "[!]";
      case "medium":
        return "[~]";
      case "low":
        return "[.]";
      default:
        return "[ ]";
    }
  }

  function createTaskCard(task: Task, isSelected: boolean, columnColor: string): BoxRenderable {
    const card = new BoxRenderable(renderer, {
      id: `task-${task.id}`,
      flexDirection: "column",
      padding: 1,
      marginBottom: 1,
      border: true,
      borderStyle: isSelected ? "double" : "rounded",
      borderColor: isSelected ? theme.colors.accent1 : theme.colors.border,
      backgroundColor: isSelected ? theme.colors.bgHighlight : theme.colors.bg,
      width: "100%",
    });

    const cardHeader = new BoxRenderable(renderer, {
      id: `task-header-${task.id}`,
      flexDirection: "row",
      justifyContent: "space-between",
    });

    const cardTitle = new TextRenderable(renderer, {
      id: `task-title-${task.id}`,
      content: t`${bold(fg(isSelected ? theme.colors.accent1 : theme.colors.fg)(task.title))}`,
    });

    const priorityIcon = new TextRenderable(renderer, {
      id: `task-priority-${task.id}`,
      content: getPriorityIcon(task.priority),
    });

    cardHeader.add(cardTitle);
    cardHeader.add(priorityIcon);

    const cardDesc = new TextRenderable(renderer, {
      id: `task-desc-${task.id}`,
      content: task.description.substring(0, 25) + (task.description.length > 25 ? "..." : ""),
      fg: theme.colors.fgMuted,
    });

    card.add(cardHeader);
    card.add(cardDesc);

    if (task.assignee) {
      const assigneeText = new TextRenderable(renderer, {
        id: `task-assignee-${task.id}`,
        content: `@ ${task.assignee}`,
        fg: theme.colors.accent3,
      });
      card.add(assigneeText);
    }

    return card;
  }

  columns.forEach((column, colIndex) => {
    const colContainer = new BoxRenderable(renderer, {
      id: `col-${column.id}`,
      flexGrow: 1,
      flexDirection: "column",
      border: true,
      borderStyle: "rounded",
      borderColor: colIndex === selectedColumnIndex ? column.color : theme.colors.border,
      backgroundColor: theme.colors.bgAlt,
      padding: 1,
      minWidth: 25,
    });

    const colHeader = new BoxRenderable(renderer, {
      id: `col-header-${column.id}`,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 1,
    });

    const colTitle = new TextRenderable(renderer, {
      id: `col-title-${column.id}`,
      content: t`${bold(fg(column.color)(column.title))}`,
    });

    const colCount = new TextRenderable(renderer, {
      id: `col-count-${column.id}`,
      content: `(${column.tasks.length})`,
      fg: theme.colors.fgMuted,
    });

    colHeader.add(colTitle);
    colHeader.add(colCount);

    const taskContainer = new BoxRenderable(renderer, {
      id: `col-tasks-${column.id}`,
      flexDirection: "column",
      flexGrow: 1,
    });

    colContainer.add(colHeader);
    colContainer.add(taskContainer);
    board.add(colContainer);

    columnUIs.push({
      container: colContainer,
      titleText: colTitle,
      taskContainer,
      taskCards: [],
      countText: colCount,
    });
  });

  function renderBoard() {
    columns.forEach((column, colIndex) => {
      const ui = columnUIs[colIndex];
      const isColSelected = colIndex === selectedColumnIndex;

      // Update column border
      ui.container.borderColor = isColSelected ? column.color : theme.colors.border;

      // Update count
      ui.countText.content = `(${column.tasks.length})`;

      // Clear existing cards
      ui.taskCards.forEach((card) => ui.taskContainer.remove(card.id));
      ui.taskCards = [];

      // Create new cards
      column.tasks.forEach((task, taskIndex) => {
        const isTaskSelected = isColSelected && taskIndex === selectedTaskIndex;
        const card = createTaskCard(task, isTaskSelected, column.color);
        ui.taskCards.push(card);
        ui.taskContainer.add(card);
      });

      // Add empty state if no tasks
      if (column.tasks.length === 0) {
        const emptyText = new TextRenderable(renderer, {
          id: `col-empty-${column.id}`,
          content: "(No tasks)",
          fg: theme.colors.fgMuted,
        });
        const emptyCard = new BoxRenderable(renderer, {
          id: `col-empty-card-${column.id}`,
          padding: 1,
        });
        emptyCard.add(emptyText);
        ui.taskCards.push(emptyCard);
        ui.taskContainer.add(emptyCard);
      }
    });

    // Update mode indicator
    header.setRightContent(isMovingTask ? "[MOVE] Moving Task - Press Enter to drop, Esc to cancel" : "Navigate Mode");
    header.setRightColor(isMovingTask ? theme.colors.warning : theme.colors.fgMuted);
  }

  // Selected task info
  const taskInfo = new BoxRenderable(renderer, {
    id: "task-info",
    flexDirection: "column",
    padding: 1,
    marginTop: 1,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  const taskInfoTitle = new TextRenderable(renderer, {
    id: "task-info-title",
    content: t`${bold(fg(theme.colors.accent5)("Selected Task Details"))}`,
  });

  const taskInfoContent = new TextRenderable(renderer, {
    id: "task-info-content",
    content: "",
    fg: theme.colors.fg,
  });

  taskInfo.add(taskInfoTitle);
  taskInfo.add(taskInfoContent);

  function updateTaskInfo() {
    const column = columns[selectedColumnIndex];
    const task = column.tasks[selectedTaskIndex];

    if (task) {
      taskInfoContent.content = `Title: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nAssignee: ${task.assignee || "Unassigned"}\nColumn: ${column.title}`;
    } else {
      taskInfoContent.content = "No task selected";
    }
  }

  // Instructions
  const instructions = createKeyBindingBar(
    renderer,
    [
      { key: "left/right", action: "Columns" },
      { key: "up/down", action: "Tasks" },
      { key: "Enter", action: "Move task" },
      { key: "n", action: "New task" },
      { key: "d", action: "Delete" },
      { key: "q", action: "Exit" },
    ],
    { theme, id: "instructions", gap: 2 }
  );
  instructions.marginTop = 1;

  // Build tree
  main.add(header.getContainer());
  main.add(board);
  main.add(taskInfo);
  main.add(instructions);
  renderer.root.add(main);

  // Initial render
  renderBoard();
  updateTaskInfo();

  let movingTask: Task | null = null;
  let sourceColumnIndex = 0;

  // Handle keyboard
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    const currentColumn = columns[selectedColumnIndex];
    const maxTaskIndex = Math.max(0, currentColumn.tasks.length - 1);

    switch (key.name) {
      case "left":
      case "h":
        if (isMovingTask) {
          // Move to previous column - allow inserting at end of list
          selectedColumnIndex = (selectedColumnIndex - 1 + columns.length) % columns.length;
          selectedTaskIndex = Math.min(selectedTaskIndex, columns[selectedColumnIndex].tasks.length);
        } else {
          selectedColumnIndex = (selectedColumnIndex - 1 + columns.length) % columns.length;
          selectedTaskIndex = Math.min(selectedTaskIndex, Math.max(0, columns[selectedColumnIndex].tasks.length - 1));
        }
        renderBoard();
        updateTaskInfo();
        break;

      case "right":
      case "l":
        if (isMovingTask) {
          // Move to next column - allow inserting at end of list
          selectedColumnIndex = (selectedColumnIndex + 1) % columns.length;
          selectedTaskIndex = Math.min(selectedTaskIndex, columns[selectedColumnIndex].tasks.length);
        } else {
          selectedColumnIndex = (selectedColumnIndex + 1) % columns.length;
          selectedTaskIndex = Math.min(selectedTaskIndex, Math.max(0, columns[selectedColumnIndex].tasks.length - 1));
        }
        renderBoard();
        updateTaskInfo();
        break;

      case "up":
      case "k":
        if (!isMovingTask) {
          selectedTaskIndex = Math.max(0, selectedTaskIndex - 1);
          renderBoard();
          updateTaskInfo();
        }
        break;

      case "down":
      case "j":
        if (!isMovingTask) {
          selectedTaskIndex = Math.min(maxTaskIndex, selectedTaskIndex + 1);
          renderBoard();
          updateTaskInfo();
        }
        break;

      case "return":
      case "enter":
        if (isMovingTask && movingTask) {
          // Drop the task
          const targetColumn = columns[selectedColumnIndex];
          const insertIndex = Math.min(selectedTaskIndex, targetColumn.tasks.length);
          targetColumn.tasks.splice(insertIndex, 0, movingTask);
          selectedTaskIndex = insertIndex;
          isMovingTask = false;
          movingTask = null;
          renderBoard();
          updateTaskInfo();
        } else if (currentColumn.tasks.length > 0) {
          // Start moving the task
          movingTask = currentColumn.tasks[selectedTaskIndex];
          sourceColumnIndex = selectedColumnIndex;
          currentColumn.tasks.splice(selectedTaskIndex, 1);
          isMovingTask = true;
          renderBoard();
        }
        break;

      case "escape":
        if (isMovingTask && movingTask) {
          // Cancel move - return task to original position
          columns[sourceColumnIndex].tasks.push(movingTask);
          selectedColumnIndex = sourceColumnIndex;
          selectedTaskIndex = columns[sourceColumnIndex].tasks.length - 1;
          isMovingTask = false;
          movingTask = null;
          renderBoard();
          updateTaskInfo();
        }
        break;

      case "d":
        if (!isMovingTask && currentColumn.tasks.length > 0) {
          currentColumn.tasks.splice(selectedTaskIndex, 1);
          selectedTaskIndex = Math.min(selectedTaskIndex, Math.max(0, currentColumn.tasks.length - 1));
          renderBoard();
          updateTaskInfo();
        }
        break;

      case "n":
        if (!isMovingTask) {
          const newTask: Task = {
            id: Date.now(),
            title: "New Task",
            description: "Task description",
            priority: "medium",
          };
          currentColumn.tasks.push(newTask);
          selectedTaskIndex = currentColumn.tasks.length - 1;
          renderBoard();
          updateTaskInfo();
        }
        break;
    }
  });
}, {
  // Custom key handler to prevent q from exiting when moving a task
  onKeyPress: (key) => {
    // Prevent q-to-exit when moving a task (let it fall through to default handling when not moving)
    return false;
  },
});
