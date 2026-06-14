/**
 * Focus navigation utilities for OpenTUI examples
 */

import type { Renderable } from "@opentui/core";

export class FocusManager {
  private focusableItems: Renderable[] = [];
  private currentIndex: number = -1;

  /**
   * Check if currentIndex points to a valid focusable item
   */
  private hasValidCurrent(): boolean {
    return this.currentIndex >= 0 && this.currentIndex < this.focusableItems.length;
  }

  /**
   * Blur the currently focused item if there is one
   */
  private blurCurrent(): void {
    if (this.hasValidCurrent()) {
      this.focusableItems[this.currentIndex].blur();
    }
  }

  register(item: Renderable): void {
    if (!this.focusableItems.includes(item)) {
      this.focusableItems.push(item);
    }
  }

  unregister(item: Renderable): void {
    const index = this.focusableItems.indexOf(item);
    if (index !== -1) {
      this.focusableItems.splice(index, 1);
      if (this.currentIndex >= this.focusableItems.length) {
        this.currentIndex = this.focusableItems.length - 1;
      }
    }
  }

  clear(): void {
    this.focusableItems = [];
    this.currentIndex = -1;
  }

  focusNext(): Renderable | null {
    if (this.focusableItems.length === 0) return null;

    this.blurCurrent();
    this.currentIndex = (this.currentIndex + 1) % this.focusableItems.length;
    const next = this.focusableItems[this.currentIndex];
    next.focus();
    return next;
  }

  focusPrev(): Renderable | null {
    if (this.focusableItems.length === 0) return null;

    this.blurCurrent();
    this.currentIndex =
      this.currentIndex <= 0
        ? this.focusableItems.length - 1
        : this.currentIndex - 1;
    const prev = this.focusableItems[this.currentIndex];
    prev.focus();
    return prev;
  }

  focusFirst(): Renderable | null {
    if (this.focusableItems.length === 0) return null;

    this.blurCurrent();
    this.currentIndex = 0;
    const first = this.focusableItems[0];
    first.focus();
    return first;
  }

  focusLast(): Renderable | null {
    if (this.focusableItems.length === 0) return null;

    this.blurCurrent();
    this.currentIndex = this.focusableItems.length - 1;
    const last = this.focusableItems[this.currentIndex];
    last.focus();
    return last;
  }

  focusIndex(index: number): Renderable | null {
    if (index < 0 || index >= this.focusableItems.length) return null;

    this.blurCurrent();
    this.currentIndex = index;
    const item = this.focusableItems[index];
    item.focus();
    return item;
  }

  getCurrent(): Renderable | null {
    return this.hasValidCurrent() ? this.focusableItems[this.currentIndex] : null;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCount(): number {
    return this.focusableItems.length;
  }
}
