/**
 * Example 04: Input Forms
 *
 * Demonstrates interactive input components:
 * - InputRenderable for text input
 * - SelectRenderable for dropdown/menu selection
 * - Focus management between inputs
 * - Event handling (change, submit, select)
 */

import {
  TextRenderable,
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  SelectRenderable,
  SelectRenderableEvents,
  type KeyEvent,
  t,
  bold,
  fg,
} from "@opentui/core";
import { theme } from "@shared/themes";
import { createExampleApp } from "@shared/utils/example-app";
import { FocusManager } from "@shared/utils/focus-manager";

createExampleApp(({ renderer }) => {
  const focusManager = new FocusManager();

  // Form state
  const formState = {
    name: "",
    email: "",
    role: "",
  };

  // Main container
  const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    padding: 2,
    gap: 1,
  });

  // Title
  const title = new TextRenderable(renderer, {
    id: "title",
    content: t`${bold(fg(theme.colors.accent2)("Input Forms Example"))}`,
  });

  const subtitle = new TextRenderable(renderer, {
    id: "subtitle",
    content: "Use Tab/Shift+Tab to navigate, Ctrl+S or Enter to submit",
    fg: theme.colors.fgMuted,
  });

  // Form container
  const form = new BoxRenderable(renderer, {
    id: "form",
    flexDirection: "column",
    gap: 2,
    padding: 2,
    width: 50,
    border: true,
    borderStyle: "rounded",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgAlt,
  });

  // Name input
  const nameGroup = new BoxRenderable(renderer, {
    id: "name-group",
    flexDirection: "column",
    gap: 0,
  });

  const nameLabel = new TextRenderable(renderer, {
    id: "name-label",
    content: "Name:",
    fg: theme.colors.fg,
  });

  const nameInput = new InputRenderable(renderer, {
    id: "name-input",
    width: 40,
    placeholder: "Enter your name...",
    backgroundColor: theme.colors.bg,
    focusedBackgroundColor: theme.colors.bgHighlight,
    textColor: theme.colors.fg,
    placeholderColor: theme.colors.fgMuted,
  });

  nameInput.on(InputRenderableEvents.CHANGE, (value: string) => {
    formState.name = value;
  });

  nameGroup.add(nameLabel);
  nameGroup.add(nameInput);
  focusManager.register(nameInput);

  // Email input
  const emailGroup = new BoxRenderable(renderer, {
    id: "email-group",
    flexDirection: "column",
    gap: 0,
  });

  const emailLabel = new TextRenderable(renderer, {
    id: "email-label",
    content: "Email:",
    fg: theme.colors.fg,
  });

  const emailInput = new InputRenderable(renderer, {
    id: "email-input",
    width: 40,
    placeholder: "Enter your email...",
    backgroundColor: theme.colors.bg,
    focusedBackgroundColor: theme.colors.bgHighlight,
    textColor: theme.colors.fg,
    placeholderColor: theme.colors.fgMuted,
  });

  emailInput.on(InputRenderableEvents.CHANGE, (value: string) => {
    formState.email = value;
  });

  emailGroup.add(emailLabel);
  emailGroup.add(emailInput);
  focusManager.register(emailInput);

  // Role select
  const roleGroup = new BoxRenderable(renderer, {
    id: "role-group",
    flexDirection: "column",
    gap: 0,
  });

  const roleLabel = new TextRenderable(renderer, {
    id: "role-label",
    content: "Role:",
    fg: theme.colors.fg,
  });

  const roleSelect = new SelectRenderable(renderer, {
    id: "role-select",
    width: 40,
    height: 6,
    options: [
      { name: "Developer", description: "Software development" },
      { name: "Designer", description: "UI/UX design" },
      { name: "Manager", description: "Project management" },
      { name: "DevOps", description: "Infrastructure & deployment" },
      { name: "QA Engineer", description: "Quality assurance" },
    ],
    backgroundColor: theme.colors.bg,
    focusedBackgroundColor: theme.colors.bgHighlight,
    selectedTextColor: theme.colors.accent3,
    textColor: theme.colors.fg,
    wrapSelection: true,
    showScrollIndicator: true,
  });

  roleSelect.on(
    SelectRenderableEvents.ITEM_SELECTED,
    (index: number, option: { name: string }) => {
      formState.role = option.name;
      updateStatus(`Selected role: ${option.name}`);
    }
  );

  roleGroup.add(roleLabel);
  roleGroup.add(roleSelect);
  focusManager.register(roleSelect);

  // Status display
  const statusBox = new BoxRenderable(renderer, {
    id: "status-box",
    flexDirection: "column",
    gap: 0,
    padding: 1,
    marginTop: 1,
    width: 50,
    border: true,
    borderStyle: "single",
    borderColor: theme.colors.border,
  });

  const statusTitle = new TextRenderable(renderer, {
    id: "status-title",
    content: t`${bold(fg(theme.colors.accent5)("Form Status:"))}`,
  });

  const statusText = new TextRenderable(renderer, {
    id: "status-text",
    content: "Fill out the form above...",
    fg: theme.colors.fgMuted,
  });

  statusBox.add(statusTitle);
  statusBox.add(statusText);

  function updateStatus(message: string) {
    statusText.content = message;
  }

  function submitForm() {
    const summary = `Name: ${formState.name || "(empty)"}, Email: ${formState.email || "(empty)"}, Role: ${formState.role || "(not selected)"}`;
    updateStatus(`Form submitted! ${summary}`);
  }

  // Instructions
  const instructions = new BoxRenderable(renderer, {
    id: "instructions",
    flexDirection: "column",
    marginTop: 1,
  });

  const keyBindings = [
    "Tab / Shift+Tab - Navigate fields",
    "Enter - Select item / Submit form",
    "↑/↓ or j/k - Navigate dropdown options",
    "Ctrl+S - Submit form",
    "q or Ctrl+C - Exit",
  ];

  keyBindings.forEach((binding, i) => {
    const text = new TextRenderable(renderer, {
      id: `instruction-${i}`,
      content: binding,
      fg: theme.colors.fgMuted,
    });
    instructions.add(text);
  });

  // Build component tree
  form.add(nameGroup);
  form.add(emailGroup);
  form.add(roleGroup);

  main.add(title);
  main.add(subtitle);
  main.add(form);
  main.add(statusBox);
  main.add(instructions);
  renderer.root.add(main);

  // Focus first input
  focusManager.focusFirst();

  // Handle keyboard navigation
  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    if (key.name === "tab") {
      if (key.shift) {
        focusManager.focusPrev();
      } else {
        focusManager.focusNext();
      }
      return;
    }

    if (key.ctrl && key.name === "s") {
      submitForm();
      return;
    }

    // Enter submits form when on text inputs (not on select)
    if (
      (key.name === "return" || key.name === "enter") &&
      focusManager.getCurrent() !== roleSelect
    ) {
      submitForm();
      return;
    }
  });
});
