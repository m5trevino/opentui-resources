/**
 * Header Widget
 * Displays a title with optional right-side content
 */

import {
  BoxRenderable,
  TextRenderable,
  type CliRenderer,
  t,
  bold,
  fg,
} from "@opentui/core";
import type { Theme } from "../themes/index";

export interface HeaderOptions {
  theme: Theme;
  /** Main title text */
  title: string;
  /** Optional content on the right side (e.g., counter, mode indicator) */
  rightContent?: string;
  /** Color for the title (default: theme.colors.accent2) */
  titleColor?: string;
  /** Color for the right content (default: theme.colors.fgMuted) */
  rightColor?: string;
  /** Custom ID for the container */
  id?: string;
  /** Bottom padding (default: 0) */
  paddingBottom?: number;
}

/**
 * Creates a header with title and optional right content.
 *
 * @example
 * ```typescript
 * const header = createHeader(renderer, {
 *   theme,
 *   title: "Code Viewer",
 *   rightContent: "Language: TypeScript",
 * });
 * main.add(header.container);
 *
 * // Update right content later:
 * header.setRightContent("Language: Python");
 * ```
 */
export function createHeader(
  renderer: CliRenderer,
  options: HeaderOptions
): Header {
  return new Header(renderer, options);
}

export class Header {
  private container: BoxRenderable;
  private titleText: TextRenderable;
  private rightText: TextRenderable;
  private theme: Theme;
  private titleColor: string;
  private rightColor: string;

  constructor(renderer: CliRenderer, options: HeaderOptions) {
    this.theme = options.theme;
    this.titleColor = options.titleColor || options.theme.colors.accent2;
    this.rightColor = options.rightColor || options.theme.colors.fgMuted;
    const { id = "header", paddingBottom = 0 } = options;

    this.container = new BoxRenderable(renderer, {
      id,
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      paddingBottom,
    });

    this.titleText = new TextRenderable(renderer, {
      id: `${id}-title`,
      content: t`${bold(fg(this.titleColor)(options.title))}`,
    });

    this.rightText = new TextRenderable(renderer, {
      id: `${id}-right`,
      content: options.rightContent || "",
      fg: this.rightColor,
    });

    this.container.add(this.titleText);
    this.container.add(this.rightText);
  }

  setTitle(title: string): void {
    this.titleText.content = t`${bold(fg(this.titleColor)(title))}`;
  }

  setRightContent(content: string): void {
    this.rightText.content = content;
  }

  setTitleColor(color: string): void {
    this.titleColor = color;
    // Re-render with new color - extract current text
    const currentTitle = this.titleText.content;
    this.titleText.content = t`${bold(fg(color)(String(currentTitle)))}`;
  }

  setRightColor(color: string): void {
    this.rightColor = color;
    this.rightText.fg = color;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.titleColor = theme.colors.accent2;
    this.rightColor = theme.colors.fgMuted;
    this.rightText.fg = this.rightColor;
  }

  getContainer(): BoxRenderable {
    return this.container;
  }
}
