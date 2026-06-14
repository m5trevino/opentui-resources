/**
 * TabBar Widget
 * Horizontal tab navigation component
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

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

export interface TabBarOptions {
  theme: Theme;
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
}

export class TabBar {
  private renderer: CliRenderer;
  private theme: Theme;
  private container: BoxRenderable;
  private tabs: TabItem[];
  private tabRenderables: Map<string, TextRenderable> = new Map();
  private activeTab: string;
  private onChange?: (tabId: string) => void;

  constructor(renderer: CliRenderer, options: TabBarOptions) {
    this.renderer = renderer;
    this.theme = options.theme;
    this.tabs = options.tabs;
    this.activeTab = options.activeTab || options.tabs[0]?.id || "";
    this.onChange = options.onChange;

    this.container = new BoxRenderable(renderer, {
      id: "tab-bar",
      flexDirection: "row",
      gap: 1,
      padding: 1,
      backgroundColor: this.theme.colors.bgAlt,
      border: ["bottom"],
      borderColor: this.theme.colors.border,
    });

    this.renderTabs();
  }

  private renderTabs(): void {
    this.tabs.forEach((tab) => {
      const isActive = tab.id === this.activeTab;
      const content = tab.icon ? `${tab.icon} ${tab.label}` : tab.label;
      const displayContent = ` ${content} `;

      const tabText = new TextRenderable(this.renderer, {
        id: `tab-${tab.id}`,
        content: isActive
          ? t`${bold(fg(this.theme.colors.bg)(displayContent))}`
          : t`${fg(this.theme.colors.fg)(displayContent)}`,
        bg: isActive ? this.theme.colors.accent2 : undefined,
      });

      this.tabRenderables.set(tab.id, tabText);
      this.container.add(tabText);
    });
  }

  getContainer(): BoxRenderable {
    return this.container;
  }

  setActiveTab(tabId: string): void {
    if (this.activeTab === tabId) return;
    if (!this.tabs.find((t) => t.id === tabId)) return;

    this.activeTab = tabId;
    this.updateTabs();
    this.onChange?.(tabId);
  }

  getActiveTab(): string {
    return this.activeTab;
  }

  nextTab(): void {
    const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTab);
    const nextIndex = (currentIndex + 1) % this.tabs.length;
    this.setActiveTab(this.tabs[nextIndex].id);
  }

  previousTab(): void {
    const currentIndex = this.tabs.findIndex((t) => t.id === this.activeTab);
    const prevIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
    this.setActiveTab(this.tabs[prevIndex].id);
  }

  private updateTabs(): void {
    this.tabs.forEach((tab) => {
      const tabText = this.tabRenderables.get(tab.id);
      if (tabText) {
        const isActive = tab.id === this.activeTab;
        const content = tab.icon ? `${tab.icon} ${tab.label}` : tab.label;
        const displayContent = ` ${content} `;

        tabText.content = isActive
          ? t`${bold(fg(this.theme.colors.bg)(displayContent))}`
          : t`${fg(this.theme.colors.fg)(displayContent)}`;
        tabText.bg = isActive ? this.theme.colors.accent2 : undefined;
      }
    });
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.container.backgroundColor = theme.colors.bgAlt;
    this.container.borderColor = theme.colors.border;
    this.updateTabs();
  }
}
