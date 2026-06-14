/**
 * StatusBar Widget
 * Reusable status bar with left/center/right sections
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  t,
  bold,
  fg,
  bg,
} from "@opentui/core";
import type { Theme } from "../themes/index";
import { extractPlainText } from "../utils/text-utils";

export interface StatusBarOptions {
  theme: Theme;
  left?: string;
  center?: string;
  right?: string;
  mode?: string;
  showTime?: boolean;
}

export class StatusBar {
  private container: BoxRenderable;
  private leftText: TextRenderable;
  private centerText: TextRenderable;
  private rightText: TextRenderable;
  private modeText: TextRenderable;
  private timeText: TextRenderable;
  private theme: Theme;
  private timeInterval: ReturnType<typeof setInterval> | null = null;

  constructor(renderer: CliRenderer, options: StatusBarOptions) {
    this.theme = options.theme;

    this.container = new BoxRenderable(renderer, {
      id: "status-bar",
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 1,
      backgroundColor: this.theme.colors.bgHighlight,
      border: ["top"],
      borderColor: this.theme.colors.border,
    });

    // Left section
    const leftSection = new BoxRenderable(renderer, {
      id: "status-left",
      flexDirection: "row",
      gap: 2,
    });

    this.modeText = new TextRenderable(renderer, {
      id: "status-mode",
      content: options.mode ? t`${bold(fg(this.theme.colors.bg)(` ${options.mode} `))}` : "",
      bg: this.theme.colors.accent2,
    });

    this.leftText = new TextRenderable(renderer, {
      id: "status-left-text",
      content: options.left || "",
      fg: this.theme.colors.fg,
    });

    leftSection.add(this.modeText);
    leftSection.add(this.leftText);

    // Center section
    this.centerText = new TextRenderable(renderer, {
      id: "status-center",
      content: options.center || "",
      fg: this.theme.colors.fgMuted,
    });

    // Right section
    const rightSection = new BoxRenderable(renderer, {
      id: "status-right",
      flexDirection: "row",
      gap: 2,
    });

    this.rightText = new TextRenderable(renderer, {
      id: "status-right-text",
      content: options.right || "",
      fg: this.theme.colors.fgMuted,
    });

    this.timeText = new TextRenderable(renderer, {
      id: "status-time",
      content: options.showTime ? this.formatTime() : "",
      fg: this.theme.colors.fgMuted,
    });

    rightSection.add(this.rightText);
    rightSection.add(this.timeText);

    this.container.add(leftSection);
    this.container.add(this.centerText);
    this.container.add(rightSection);

    if (options.showTime) {
      this.startTimeClock();
    }
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  private startTimeClock(): void {
    this.timeInterval = setInterval(() => {
      this.timeText.content = this.formatTime();
    }, 1000);
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  setLeft(text: string): void {
    this.leftText.content = text;
  }

  setCenter(text: string): void {
    this.centerText.content = text;
  }

  setRight(text: string): void {
    this.rightText.content = text;
  }

  setMode(mode: string, color?: string): void {
    const bgColor = color || this.theme.colors.accent2;
    this.modeText.content = mode ? t`${bold(fg(this.theme.colors.bg)(` ${mode} `))}` : "";
    this.modeText.bg = bgColor;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.container.backgroundColor = theme.colors.bgHighlight;
    this.container.borderColor = theme.colors.border;
    // Re-render mode text with new theme colors
    const plainText = extractPlainText(this.modeText.content);
    if (plainText) {
      this.modeText.content = t`${bold(fg(theme.colors.bg)(plainText))}`;
    }
    this.modeText.bg = theme.colors.accent2;
    this.leftText.fg = theme.colors.fg;
    this.centerText.fg = theme.colors.fgMuted;
    this.rightText.fg = theme.colors.fgMuted;
    this.timeText.fg = theme.colors.fgMuted;
  }

  destroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
