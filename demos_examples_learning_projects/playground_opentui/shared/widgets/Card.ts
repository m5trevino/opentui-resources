/**
 * Card Widget
 * Styled container with optional title and footer
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
import { extractPlainText } from "../utils/text-utils";

type DimensionValue = number | "auto" | `${number}%`;

export interface CardOptions {
  theme: Theme;
  title?: string;
  width?: DimensionValue;
  height?: DimensionValue;
  footer?: string;
  accentColor?: string;
}

export class Card {
  private renderer: CliRenderer;
  private theme: Theme;
  private container: BoxRenderable;
  private header?: BoxRenderable;
  private titleText?: TextRenderable;
  private contentArea: BoxRenderable;
  private footer?: BoxRenderable;
  private footerText?: TextRenderable;
  private accentColor: string;

  constructor(renderer: CliRenderer, options: CardOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    this.accentColor = options.accentColor || this.theme.colors.accent2;

    this.container = new BoxRenderable(renderer, {
      id: "card",
      flexDirection: "column",
      width: options.width || "auto",
      height: options.height || "auto",
      backgroundColor: this.theme.colors.bgAlt,
      border: true,
      borderStyle: "rounded",
      borderColor: this.theme.colors.border,
      overflow: "hidden",
    });

    // Title/header
    if (options.title) {
      this.header = new BoxRenderable(renderer, {
        id: "card-header",
        padding: 1,
        backgroundColor: this.theme.colors.bgHighlight,
        border: ["bottom"],
        borderColor: this.theme.colors.border,
      });

      this.titleText = new TextRenderable(renderer, {
        id: "card-title",
        content: t`${bold(fg(this.accentColor)(options.title))}`,
      });

      this.header.add(this.titleText);
      this.container.add(this.header);
    }

    // Content area
    this.contentArea = new BoxRenderable(renderer, {
      id: "card-content",
      flexGrow: 1,
      padding: 1,
      flexDirection: "column",
    });

    this.container.add(this.contentArea);

    // Footer
    if (options.footer) {
      this.footer = new BoxRenderable(renderer, {
        id: "card-footer",
        padding: 1,
        backgroundColor: this.theme.colors.bgHighlight,
        border: ["top"],
        borderColor: this.theme.colors.border,
      });

      this.footerText = new TextRenderable(renderer, {
        id: "card-footer-text",
        content: options.footer,
        fg: this.theme.colors.fgMuted,
      });

      this.footer.add(this.footerText);
      this.container.add(this.footer);
    }
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  getContentArea(): BoxRenderable {
    return this.contentArea;
  }

  setTitle(title: string): void {
    if (this.titleText) {
      this.titleText.content = t`${bold(fg(this.accentColor)(title))}`;
    }
  }

  setFooter(footer: string): void {
    if (this.footerText) {
      this.footerText.content = footer;
    }
  }

  setAccentColor(color: string): void {
    this.accentColor = color;
    // Re-render title with new accent color
    if (this.titleText) {
      const plainText = extractPlainText(this.titleText.content);
      if (plainText) {
        this.titleText.content = t`${bold(fg(color)(plainText))}`;
      }
    }
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.container.backgroundColor = theme.colors.bgAlt;
    this.container.borderColor = theme.colors.border;
    if (this.header) {
      this.header.backgroundColor = theme.colors.bgHighlight;
      this.header.borderColor = theme.colors.border;
    }
    if (this.footer) {
      this.footer.backgroundColor = theme.colors.bgHighlight;
      this.footer.borderColor = theme.colors.border;
    }
    if (this.footerText) {
      this.footerText.fg = theme.colors.fgMuted;
    }
  }
}
