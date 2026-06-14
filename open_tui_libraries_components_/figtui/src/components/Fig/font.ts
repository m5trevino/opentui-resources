// Resolves FIGlet fonts from names paths or inline data sources.
// Caches parsed fonts to avoid repeated registration and IO work.

import { existsSync, readFileSync } from "node:fs";
import { basename, isAbsolute, resolve } from "node:path";
import figlet from "figlet";
import type { FigFont } from "./types";

const parsed = new Map<string, string>();
const pathCache = new Map<string, string>();

export function resolveFont(font: FigFont | undefined): string {
  if (!font) {
    return "Standard";
  }

  if (typeof font === "string") {
    return looksLikePath(font) ? registerPathFont(font) : font;
  }

  if (font.data) {
    return registerFont(font.name, font.data);
  }

  if (font.path) {
    return registerPathFont(font.path, font.name);
  }

  return font.name;
}

function registerPathFont(path: string, name?: string): string {
  const file = findFontFile(path);

  if (!file) {
    return name || "Standard";
  }

  if (pathCache.has(file)) {
    return pathCache.get(file) as string;
  }

  const data = readFileSync(file, "utf8");
  const fontName = registerFont(name || fontNameFromPath(file, data), data);
  pathCache.set(file, fontName);
  return fontName;
}

function registerFont(name: string, data: string): string {
  const key = `${name}:${hash(data)}`;

  if (parsed.has(key)) {
    return parsed.get(key) as string;
  }

  figlet.parseFont(name, data);
  parsed.set(key, name);
  return name;
}

function findFontFile(path: string): string | undefined {
  const trimmed = path.trim();
  const plain = trimmed.replace(/^\.?[\\/]/, "");
  const candidates = isAbsolute(trimmed)
    ? [trimmed]
    : [resolve(process.cwd(), trimmed), resolve(process.cwd(), plain), resolve(process.cwd(), "src", plain)];

  return candidates.find((candidate) => existsSync(candidate));
}

function looksLikePath(font: string): boolean {
  return /\.flf$/i.test(font) || font.includes("/") || font.includes("\\");
}

function fontNameFromPath(path: string, data: string): string {
  return `Fig_${basename(path, ".flf").replace(/\W+/g, "_")}_${hash(data)}`;
}

function hash(value: string): string {
  let code = 0;

  for (let index = 0; index < value.length; index += 1) {
    code = Math.imul(31, code) + value.charCodeAt(index);
  }

  return (code >>> 0).toString(36);
}
