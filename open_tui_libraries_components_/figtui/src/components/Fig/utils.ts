// Formats FIGlet output with alignment padding width and borders safely.
// Provides text cleaning and width calculations for rendering in terminal.

import type { FigAlign, FigRenderOptions } from "./types";

const MIN_WIDTH = 1;

export function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function contentWidth(value: string): number {
  return cleanText(value)
    .split("\n")
    .reduce((width, line) => Math.max(width, line.length), 0);
}

export function clampWidth(width: number): number {
  return Math.max(MIN_WIDTH, Math.floor(Number.isFinite(width) ? width : MIN_WIDTH));
}

export function resolveInputWidth(width: number | string | undefined, terminalWidth: number): number {
  const available = clampWidth(terminalWidth - 3);

  if (typeof width === "number") {
    return clampWidth(Math.min(width, available));
  }

  if (typeof width === "string" && width.trim().endsWith("%")) {
    return clampWidth(Math.min((terminalWidth * Number(width.trim().slice(0, -1))) / 100, available));
  }

  return available;
}

export function formatFig(value: string, options: FigRenderOptions): string {
  return withBorder(withPadding(alignLines(cleanText(value).split("\n"), options.align, options.width), options.padding), options.border);
}

function alignLines(lines: string[], align: FigAlign, width: number): string[] {
  const target = Math.max(clampWidth(width), contentWidth(lines.join("\n")));

  return lines.map((line) => {
    const gap = Math.max(0, target - line.length);

    if (align === "right") {
      return `${" ".repeat(gap)}${line}`;
    }

    if (align === "center") {
      return `${" ".repeat(Math.floor(gap / 2))}${line}${" ".repeat(Math.ceil(gap / 2))}`;
    }

    return `${line}${" ".repeat(gap)}`;
  });
}

function withPadding(lines: string[], padding: number): string[] {
  const size = Math.max(0, Math.floor(padding));

  if (!size) {
    return lines;
  }

  const blank = " ".repeat(contentWidth(lines.join("\n")) + size * 2);

  return [
    ...Array.from({ length: size }, () => blank),
    ...lines.map((line) => `${" ".repeat(size)}${line}${" ".repeat(size)}`),
    ...Array.from({ length: size }, () => blank),
  ];
}

function withBorder(lines: string[], border: boolean): string {
  if (!border) {
    return lines.join("\n");
  }

  const width = contentWidth(lines.join("\n"));
  const rule = "-".repeat(width);

  return [`+${rule}+`, ...lines.map((line) => `|${line}${" ".repeat(width - line.length)}|`), `+${rule}+`].join("\n");
}
