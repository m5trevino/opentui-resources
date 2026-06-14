import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultTheme, normalizeTheme, TintyOpenTUIThemeError } from "./theme.js";
import type { TintyOpenTUITheme } from "./types.js";

export const TINTY_OPENTUI_THEME_ENV = "TINTY_OPENTUI_THEME";
export const TINTY_OPENTUI_RELATIVE_THEME_PATH =
  ".local/share/tinted-theming/tinty/tinted-opentui-themes-file.json";

export interface ResolveThemePathOptions {
  path?: string | URL;
  env?: NodeJS.ProcessEnv;
  home?: string;
}

export interface LoadThemeOptions extends ResolveThemePathOptions {
  fallback?: TintyOpenTUITheme | false;
}

export function resolveThemePath(options: ResolveThemePathOptions = {}): string {
  const env = options.env ?? process.env;
  const home = options.home ?? env.HOME ?? "";
  const configuredPath =
    options.path ?? env[TINTY_OPENTUI_THEME_ENV] ?? `~/${TINTY_OPENTUI_RELATIVE_THEME_PATH}`;

  if (configuredPath instanceof URL) {
    return fileURLToPath(configuredPath);
  }

  return expandHome(configuredPath, home);
}

export function loadTheme(options: LoadThemeOptions = {}): TintyOpenTUITheme {
  const themePath = resolveThemePath(options);
  if (!existsSync(themePath)) {
    if (options.fallback === false) {
      throw new TintyOpenTUIThemeError(`theme file not found: ${themePath}`);
    }
    return options.fallback ?? defaultTheme;
  }

  const json = readFileSync(themePath, "utf8");
  try {
    return normalizeTheme(JSON.parse(json));
  } catch (error) {
    if (error instanceof TintyOpenTUIThemeError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new TintyOpenTUIThemeError(`failed to parse ${themePath}: ${message}`);
  }
}

export function getThemeDirectory(options: ResolveThemePathOptions = {}): string {
  return dirname(resolveThemePath(options));
}

function expandHome(path: string, home: string): string {
  if (path === "~") return home;
  if (path.startsWith("~/")) return resolve(home, path.slice(2));
  return resolve(path);
}
