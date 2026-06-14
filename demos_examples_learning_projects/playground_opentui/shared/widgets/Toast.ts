/**
 * Toast Widget
 * Slide-in notification with auto-dismiss
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

export type ToastVariant = "success" | "warning" | "error" | "info";

export interface ToastOptions {
  theme: Theme;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  duration?: number; // ms, 0 = no auto-dismiss
}

interface ToastItem {
  id: number;
  container: BoxRenderable;
  timeout?: ReturnType<typeof setTimeout>;
}

export class Toast {
  private renderer: CliRenderer;
  private theme: Theme;
  private position: string;
  private duration: number;
  private container: BoxRenderable;
  private toasts: ToastItem[] = [];
  private nextId: number = 0;

  constructor(renderer: CliRenderer, options: ToastOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    this.position = options.position || "top-right";
    this.duration = options.duration ?? 3000;

    // Determine position
    const positionProps = this.getPositionProps();

    this.container = new BoxRenderable(renderer, {
      id: "toast-container",
      position: "absolute",
      ...positionProps,
      flexDirection: "column",
      gap: 1,
      zIndex: 200,
    });
  }

  private getPositionProps(): Record<string, number> {
    switch (this.position) {
      case "top-left":
        return { left: 2, top: 2 };
      case "bottom-left":
        return { left: 2, bottom: 2 };
      case "bottom-right":
        return { right: 2, bottom: 2 };
      case "top-right":
      default:
        return { right: 2, top: 2 };
    }
  }

  private getVariantColors(variant: ToastVariant): { bg: string; fg: string; icon: string } {
    switch (variant) {
      case "success":
        return {
          bg: this.theme.colors.success,
          fg: this.theme.colors.bg,
          icon: "✓",
        };
      case "warning":
        return {
          bg: this.theme.colors.warning,
          fg: this.theme.colors.bg,
          icon: "⚠",
        };
      case "error":
        return {
          bg: this.theme.colors.error,
          fg: this.theme.colors.bg,
          icon: "✕",
        };
      case "info":
      default:
        return {
          bg: this.theme.colors.info,
          fg: this.theme.colors.bg,
          icon: "ℹ",
        };
    }
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  show(message: string, variant: ToastVariant = "info"): number {
    const id = this.nextId++;
    const colors = this.getVariantColors(variant);

    const toastBox = new BoxRenderable(this.renderer, {
      id: `toast-${id}`,
      flexDirection: "row",
      gap: 1,
      padding: 1,
      backgroundColor: colors.bg,
      border: true,
      borderStyle: "rounded",
      borderColor: this.theme.colors.fg,
      minWidth: 30,
    });

    const iconText = new TextRenderable(this.renderer, {
      id: `toast-icon-${id}`,
      content: t`${bold(fg(colors.fg)(colors.icon))}`,
    });

    const messageText = new TextRenderable(this.renderer, {
      id: `toast-message-${id}`,
      content: message,
      fg: colors.fg,
    });

    toastBox.add(iconText);
    toastBox.add(messageText);
    this.container.add(toastBox);

    const toastItem: ToastItem = { id, container: toastBox };

    // Auto-dismiss
    if (this.duration > 0) {
      toastItem.timeout = setTimeout(() => {
        this.dismiss(id);
      }, this.duration);
    }

    this.toasts.push(toastItem);
    return id;
  }

  dismiss(id: number): void {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      const toast = this.toasts[index];
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }
      this.container.remove(toast.container.id);
      this.toasts.splice(index, 1);
    }
  }

  dismissAll(): void {
    this.toasts.forEach((toast) => {
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }
      this.container.remove(toast.container.id);
    });
    this.toasts = [];
  }

  success(message: string): number {
    return this.show(message, "success");
  }

  warning(message: string): number {
    return this.show(message, "warning");
  }

  error(message: string): number {
    return this.show(message, "error");
  }

  info(message: string): number {
    return this.show(message, "info");
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
  }
}
