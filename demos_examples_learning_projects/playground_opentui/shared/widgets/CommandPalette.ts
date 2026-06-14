/**
 * CommandPalette Widget
 * Ctrl+P style command palette with fuzzy search
 */

import {
  BoxRenderable,
  TextRenderable,
  InputRenderable,
  InputRenderableEvents,
  type CliRenderer,
  type KeyEvent,
} from "@opentui/core";
import type { Theme } from "../themes/index";

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export interface CommandPaletteOptions {
  theme: Theme;
  commands: Command[];
  placeholder?: string;
  maxResults?: number;
}

export class CommandPalette {
  private renderer: CliRenderer;
  private theme: Theme;
  private commands: Command[];
  private filteredCommands: Command[];
  private overlay: BoxRenderable;
  private container: BoxRenderable;
  private searchInput: InputRenderable;
  private resultsList: BoxRenderable;
  private resultItems: TextRenderable[] = [];
  private selectedIndex: number = 0;
  private visible: boolean = false;
  private maxResults: number;
  private query: string = "";

  constructor(renderer: CliRenderer, options: CommandPaletteOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    this.commands = options.commands;
    this.filteredCommands = [...options.commands];
    this.maxResults = options.maxResults || 10;

    // Overlay
    this.overlay = new BoxRenderable(renderer, {
      id: "command-palette-overlay",
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: 5,
      zIndex: 150,
      visible: false,
    });

    // Container
    this.container = new BoxRenderable(renderer, {
      id: "command-palette-container",
      width: 60,
      flexDirection: "column",
      backgroundColor: this.theme.colors.bgAlt,
      border: true,
      borderStyle: "rounded",
      borderColor: this.theme.colors.accent2,
    });

    // Search input container
    const searchContainer = new BoxRenderable(renderer, {
      id: "command-palette-search",
      padding: 1,
      border: ["bottom"],
      borderColor: this.theme.colors.border,
    });

    const searchIcon = new TextRenderable(renderer, {
      id: "command-palette-icon",
      content: "🔍 ",
      fg: this.theme.colors.fgMuted,
    });

    this.searchInput = new InputRenderable(renderer, {
      id: "command-palette-input",
      flexGrow: 1,
      placeholder: options.placeholder || "Type a command...",
      backgroundColor: this.theme.colors.bg,
      focusedBackgroundColor: this.theme.colors.bgHighlight,
      textColor: this.theme.colors.fg,
      placeholderColor: this.theme.colors.fgMuted,
    });

    this.searchInput.on(InputRenderableEvents.CHANGE, (value: string) => {
      this.query = value;
      this.filterCommands();
    });

    searchContainer.add(searchIcon);
    searchContainer.add(this.searchInput);

    // Results list
    this.resultsList = new BoxRenderable(renderer, {
      id: "command-palette-results",
      flexDirection: "column",
      maxHeight: this.maxResults * 2 + 2,
      overflow: "hidden",
    });

    this.container.add(searchContainer);
    this.container.add(this.resultsList);
    this.overlay.add(this.container);

    this.renderResults();
  }

  private fuzzyMatch(query: string, text: string): boolean {
    if (!query) return true;
    query = query.toLowerCase();
    text = text.toLowerCase();

    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) {
        qi++;
      }
    }
    return qi === query.length;
  }

  private filterCommands(): void {
    if (!this.query) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(
        (cmd) =>
          this.fuzzyMatch(this.query, cmd.label) ||
          this.fuzzyMatch(this.query, cmd.description || "") ||
          this.fuzzyMatch(this.query, cmd.category || "")
      );
    }
    this.selectedIndex = 0;
    this.renderResults();
  }

  private renderResults(): void {
    // Clear existing items
    this.resultItems.forEach((item) => this.resultsList.remove(item.id));
    this.resultItems = [];

    const visibleCommands = this.filteredCommands.slice(0, this.maxResults);

    if (visibleCommands.length === 0) {
      const noResults = new TextRenderable(this.renderer, {
        id: "command-palette-no-results",
        content: "  No commands found",
        fg: this.theme.colors.fgMuted,
        padding: 1,
      });
      this.resultItems.push(noResults);
      this.resultsList.add(noResults);
      return;
    }

    visibleCommands.forEach((cmd, i) => {
      const isSelected = i === this.selectedIndex;
      const shortcutText = cmd.shortcut ? ` [${cmd.shortcut}]` : "";

      const item = new TextRenderable(this.renderer, {
        id: `command-palette-item-${i}`,
        content: `${isSelected ? "▶ " : "  "}${cmd.label}${shortcutText}`,
        fg: isSelected ? this.theme.colors.accent2 : this.theme.colors.fg,
        bg: isSelected ? this.theme.colors.bgHighlight : undefined,
        padding: 1,
      });

      this.resultItems.push(item);
      this.resultsList.add(item);

      if (cmd.description) {
        const desc = new TextRenderable(this.renderer, {
          id: `command-palette-desc-${i}`,
          content: `    ${cmd.description}`,
          fg: this.theme.colors.fgMuted,
        });
        this.resultItems.push(desc);
        this.resultsList.add(desc);
      }
    });
  }

  getOverlay(): BoxRenderable {
    return this.overlay;
  }

  show(): void {
    this.visible = true;
    this.query = "";
    this.searchInput.clear();
    this.filteredCommands = [...this.commands];
    this.selectedIndex = 0;
    this.renderResults();
    this.overlay.visible = true;
    this.searchInput.focus();
  }

  hide(): void {
    this.visible = false;
    this.overlay.visible = false;
  }

  toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  moveUp(): void {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.filteredCommands.length) %
      this.filteredCommands.length;
    this.renderResults();
  }

  moveDown(): void {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.filteredCommands.length;
    this.renderResults();
  }

  execute(): void {
    if (this.filteredCommands.length === 0) return;
    const cmd = this.filteredCommands[this.selectedIndex];
    this.hide();
    cmd.action();
  }

  handleKeyPress(key: KeyEvent): boolean {
    if (!this.visible) return false;

    switch (key.name) {
      case "escape":
        this.hide();
        return true;
      case "up":
        this.moveUp();
        return true;
      case "down":
        this.moveDown();
        return true;
      case "return":
      case "enter":
        this.execute();
        return true;
    }
    return false;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.container.backgroundColor = theme.colors.bgAlt;
    this.container.borderColor = theme.colors.accent2;
    this.searchInput.backgroundColor = theme.colors.bg;
    this.searchInput.focusedBackgroundColor = theme.colors.bgHighlight;
    this.searchInput.textColor = theme.colors.fg;
    this.searchInput.placeholderColor = theme.colors.fgMuted;
    this.renderResults();
  }
}
