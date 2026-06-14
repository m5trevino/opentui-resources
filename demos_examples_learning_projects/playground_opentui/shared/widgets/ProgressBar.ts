/**
 * ProgressBar Widget
 * Animated progress bar with determinate/indeterminate modes
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import type { Theme } from "../themes/index";

export interface ProgressBarOptions {
  theme: Theme;
  width?: number;
  showPercentage?: boolean;
  indeterminate?: boolean;
}

export class ProgressBar {
  private renderer: CliRenderer;
  private theme: Theme;
  private width: number;
  private showPercentage: boolean;
  private indeterminate: boolean;
  private container: BoxRenderable;
  private barContainer: BoxRenderable;
  private barFill: TextRenderable;
  private percentText: TextRenderable;
  private progress: number = 0;
  private animationInterval: ReturnType<typeof setInterval> | null = null;
  private indeterminatePosition: number = 0;

  constructor(renderer: CliRenderer, options: ProgressBarOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    // Ensure width is at least 1 to avoid empty progress bars
    this.width = Math.max(1, options.width || 40);
    this.showPercentage = options.showPercentage !== false;
    this.indeterminate = options.indeterminate || false;

    this.container = new BoxRenderable(renderer, {
      id: "progress-container",
      flexDirection: "row",
      gap: 2,
      alignItems: "center",
    });

    this.barContainer = new BoxRenderable(renderer, {
      id: "progress-bar-container",
      width: this.width,
      height: 1,
      backgroundColor: this.theme.colors.bgHighlight,
    });

    this.barFill = new TextRenderable(renderer, {
      id: "progress-fill",
      content: "",
      fg: this.theme.colors.accent2,
    });

    this.percentText = new TextRenderable(renderer, {
      id: "progress-percent",
      content: this.showPercentage ? "0%" : "",
      fg: this.theme.colors.fgMuted,
      width: 4,
    });

    this.barContainer.add(this.barFill);
    this.container.add(this.barContainer);

    if (this.showPercentage) {
      this.container.add(this.percentText);
    }

    if (this.indeterminate) {
      this.startIndeterminateAnimation();
    } else {
      this.updateBar();
    }
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  setProgress(value: number): void {
    this.progress = Math.max(0, Math.min(100, value));
    if (!this.indeterminate) {
      this.updateBar();
    }
  }

  getProgress(): number {
    return this.progress;
  }

  setIndeterminate(value: boolean): void {
    this.indeterminate = value;
    if (value) {
      this.startIndeterminateAnimation();
    } else {
      this.stopIndeterminateAnimation();
      this.updateBar();
    }
  }

  private updateBar(): void {
    const filledWidth = Math.floor((this.progress / 100) * this.width);
    const emptyWidth = this.width - filledWidth;

    this.barFill.content = "█".repeat(filledWidth) + "░".repeat(emptyWidth);

    if (this.showPercentage) {
      this.percentText.content = `${Math.round(this.progress)}%`;
    }
  }

  private startIndeterminateAnimation(): void {
    this.stopIndeterminateAnimation();

    this.animationInterval = setInterval(() => {
      const indicatorWidth = 8;
      const barWidth = this.width;

      // Create sliding indicator
      const bar = Array(barWidth).fill("░");
      for (let i = 0; i < indicatorWidth; i++) {
        const pos = (this.indeterminatePosition + i) % barWidth;
        bar[pos] = "█";
      }

      this.barFill.content = bar.join("");

      if (this.showPercentage) {
        this.percentText.content = "...";
      }

      this.indeterminatePosition = (this.indeterminatePosition + 1) % barWidth;
    }, 100);
  }

  private stopIndeterminateAnimation(): void {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }

  setColor(color: string): void {
    this.barFill.fg = color;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.barContainer.backgroundColor = theme.colors.bgHighlight;
    this.barFill.fg = theme.colors.accent2;
    this.percentText.fg = theme.colors.fgMuted;
  }

  destroy(): void {
    this.stopIndeterminateAnimation();
  }
}
