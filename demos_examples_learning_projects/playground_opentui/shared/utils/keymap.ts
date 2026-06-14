/**
 * Keyboard shortcut helpers for OpenTUI examples
 */

import type { KeyEvent } from "@opentui/core";

export interface KeyBinding {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

export class KeymapManager {
  private bindings: Map<string, KeyBinding> = new Map();

  private getBindingKey(
    key: string,
    ctrl?: boolean,
    shift?: boolean,
    meta?: boolean
  ): string {
    const parts: string[] = [];
    if (ctrl) parts.push("ctrl");
    if (meta) parts.push("meta");
    if (shift) parts.push("shift");
    parts.push(key.toLowerCase());
    return parts.join("+");
  }

  register(binding: KeyBinding): void {
    const key = this.getBindingKey(
      binding.key,
      binding.ctrl,
      binding.shift,
      binding.meta
    );
    this.bindings.set(key, binding);
  }

  registerAll(bindings: KeyBinding[]): void {
    for (const binding of bindings) {
      this.register(binding);
    }
  }

  handle(event: KeyEvent): boolean {
    const key = this.getBindingKey(
      event.name,
      event.ctrl,
      event.shift,
      event.meta
    );
    const binding = this.bindings.get(key);
    if (binding) {
      binding.action();
      return true;
    }
    return false;
  }

  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }

  formatBindings(): string[] {
    return this.getBindings().map((b) => {
      const parts: string[] = [];
      if (b.ctrl) parts.push("Ctrl");
      if (b.meta) parts.push("Meta");
      if (b.shift) parts.push("Shift");
      parts.push(b.key.toUpperCase());
      return `${parts.join("+")} - ${b.description}`;
    });
  }
}

export function isKey(event: KeyEvent, key: string): boolean {
  return event.name.toLowerCase() === key.toLowerCase();
}

export function isCtrl(event: KeyEvent, key: string): boolean {
  return event.ctrl && isKey(event, key);
}

export function isShift(event: KeyEvent, key: string): boolean {
  return event.shift && isKey(event, key);
}

export function isCtrlShift(event: KeyEvent, key: string): boolean {
  return event.ctrl && event.shift && isKey(event, key);
}

export function isEscape(event: KeyEvent): boolean {
  return isKey(event, "escape");
}

export function isEnter(event: KeyEvent): boolean {
  return isKey(event, "return") || isKey(event, "enter");
}

export function isArrowUp(event: KeyEvent): boolean {
  return isKey(event, "up");
}

export function isArrowDown(event: KeyEvent): boolean {
  return isKey(event, "down");
}

export function isArrowLeft(event: KeyEvent): boolean {
  return isKey(event, "left");
}

export function isArrowRight(event: KeyEvent): boolean {
  return isKey(event, "right");
}

export function isTab(event: KeyEvent): boolean {
  return isKey(event, "tab");
}

export function isBackTab(event: KeyEvent): boolean {
  return event.shift && isKey(event, "tab");
}
