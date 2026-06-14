/**
 * Cozy Visualizer Module for Music Player
 * 16 bars, single row, warm gradient colors (amber → orange → rose)
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import type { Theme } from "@shared/themes/index";
import { lerp } from "@shared/utils/animation-presets";

const BAR_COUNT = 16;

// Block characters from empty to full
const BLOCKS = [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

// Warm color palette (amber → orange → rose)
const WARM_COLORS = [
  "#f59e0b", // amber-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#ec4899", // pink-500
];

export interface VisualizerOptions {
  theme: Theme;
}

export class Visualizer {
  private renderer: CliRenderer;
  private theme: Theme;
  private container: BoxRenderable;
  private barText: TextRenderable;
  private targetHeights: number[];
  private currentHeights: number[];
  private phase: number = 0;

  constructor(renderer: CliRenderer, options: VisualizerOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    this.targetHeights = Array(BAR_COUNT).fill(0);
    this.currentHeights = Array(BAR_COUNT).fill(0);

    // Create container for visualizer
    this.container = new BoxRenderable(renderer, {
      id: "visualizer-container",
      flexDirection: "row",
      width: "100%",
      justifyContent: "center",
      paddingTop: 1,
    });

    // Single row of bars
    this.barText = new TextRenderable(renderer, {
      id: "viz-bars",
      content: " ".repeat(BAR_COUNT),
      fg: WARM_COLORS[0],
    });

    this.container.add(this.barText);
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  /**
   * Update visualizer animation
   */
  update(isPlaying: boolean): void {
    if (!isPlaying) {
      // Fade to silent state smoothly
      for (let i = 0; i < BAR_COUNT; i++) {
        this.currentHeights[i] = lerp(this.currentHeights[i], 0, 0.15);
      }
    } else {
      // Generate animated wave pattern
      this.phase += 0.15;

      for (let i = 0; i < BAR_COUNT; i++) {
        // Combine multiple sine waves for organic motion
        const wave1 = Math.sin(this.phase + i * 0.3) * 0.5 + 0.5;
        const wave2 = Math.sin(this.phase * 1.4 + i * 0.2) * 0.35 + 0.5;
        const wave3 = Math.sin(this.phase * 0.8 + i * 0.5) * 0.25 + 0.5;

        // Average waves
        const target = (wave1 + wave2 + wave3) / 3;
        this.targetHeights[i] = target;

        // Smooth interpolation
        this.currentHeights[i] = lerp(
          this.currentHeights[i],
          this.targetHeights[i],
          0.25
        );
      }
    }

    this.render();
  }

  /**
   * Render the visualizer bars
   */
  private render(): void {
    let barContent = "";

    for (let bar = 0; bar < BAR_COUNT; bar++) {
      const height = this.currentHeights[bar];
      // Map height (0-1) to block index (0-8)
      const blockIndex = Math.floor(height * (BLOCKS.length - 1));
      barContent += BLOCKS[Math.max(0, Math.min(blockIndex, BLOCKS.length - 1))];
    }

    this.barText.content = barContent;

    // Use warm gradient color based on average intensity
    const avgHeight = this.currentHeights.reduce((a, b) => a + b, 0) / BAR_COUNT;
    const colorIndex = Math.min(
      Math.floor(avgHeight * WARM_COLORS.length),
      WARM_COLORS.length - 1
    );
    this.barText.fg = WARM_COLORS[colorIndex];
  }

  /**
   * Update theme colors
   */
  setTheme(theme: Theme): void {
    this.theme = theme;
    // Keep using warm colors regardless of theme
    this.render();
  }

  /**
   * Reset visualizer to initial state
   */
  reset(): void {
    this.phase = 0;
    this.targetHeights.fill(0);
    this.currentHeights.fill(0);
    this.render();
  }
}
