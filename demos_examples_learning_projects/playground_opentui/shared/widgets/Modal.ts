/**
 * Modal Widget
 * Centered overlay dialog with title and content
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

export interface ModalOptions {
  theme: Theme;
  title: string;
  width?: number;
  height?: number;
  showClose?: boolean;
}

export class Modal {
  private overlay: BoxRenderable;
  private container: BoxRenderable;
  private titleBar: BoxRenderable;
  private titleText: TextRenderable;
  private closeButton: TextRenderable;
  private contentArea: BoxRenderable;
  private theme: Theme;
  private visible: boolean = false;
  private onClose?: () => void;

  constructor(renderer: CliRenderer, options: ModalOptions) {
    this.theme = options.theme;

    // Full screen overlay
    this.overlay = new BoxRenderable(renderer, {
      id: "modal-overlay",
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      visible: false,
      zIndex: 100,
    });

    // Modal container
    this.container = new BoxRenderable(renderer, {
      id: "modal-container",
      width: options.width || 50,
      height: options.height || 20,
      flexDirection: "column",
      backgroundColor: this.theme.colors.bgAlt,
      border: true,
      borderStyle: "rounded",
      borderColor: this.theme.colors.accent2,
    });

    // Title bar
    this.titleBar = new BoxRenderable(renderer, {
      id: "modal-title-bar",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 1,
      backgroundColor: this.theme.colors.bgHighlight,
      border: ["bottom"],
      borderColor: this.theme.colors.border,
    });

    this.titleText = new TextRenderable(renderer, {
      id: "modal-title",
      content: t`${bold(fg(this.theme.colors.fg)(options.title))}`,
    });

    this.closeButton = new TextRenderable(renderer, {
      id: "modal-close",
      content: options.showClose !== false ? " ✕ " : "",
      fg: this.theme.colors.error,
    });

    this.titleBar.add(this.titleText);
    this.titleBar.add(this.closeButton);

    // Content area
    this.contentArea = new BoxRenderable(renderer, {
      id: "modal-content",
      flexGrow: 1,
      padding: 1,
      overflow: "hidden",
    });

    this.container.add(this.titleBar);
    this.container.add(this.contentArea);
    this.overlay.add(this.container);
  }

  getOverlay(): BoxRenderable {
    return this.overlay;
  }

  getContentArea(): BoxRenderable {
    return this.contentArea;
  }

  setTitle(title: string): void {
    this.titleText.content = t`${bold(fg(this.theme.colors.fg)(title))}`;
  }

  setOnClose(callback: () => void): void {
    this.onClose = callback;
  }

  show(): void {
    this.visible = true;
    this.overlay.visible = true;
  }

  hide(): void {
    this.visible = false;
    this.overlay.visible = false;
    this.onClose?.();
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

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.container.backgroundColor = theme.colors.bgAlt;
    this.container.borderColor = theme.colors.accent2;
    this.titleBar.backgroundColor = theme.colors.bgHighlight;
    this.titleBar.borderColor = theme.colors.border;
    // Re-render title with new theme colors (bold styling)
    const plainText = extractPlainText(this.titleText.content);
    if (plainText) {
      this.titleText.content = t`${bold(fg(theme.colors.fg)(plainText))}`;
    }
    this.closeButton.fg = theme.colors.error;
  }
}
