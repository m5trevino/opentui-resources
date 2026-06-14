import { existsSync, watch } from "node:fs";
import { basename, dirname } from "node:path";
import { loadTheme, resolveThemePath, type LoadThemeOptions } from "./load.js";
import type { TintyOpenTUITheme } from "./types.js";

export interface WatchThemeOptions extends LoadThemeOptions {
  onChange: (theme: TintyOpenTUITheme) => void;
  onError?: (error: unknown) => void;
  debounceMs?: number;
  immediate?: boolean;
  persistent?: boolean;
}

export type StopWatchingTheme = () => void;

export function watchTheme(options: WatchThemeOptions): StopWatchingTheme {
  const themePath = resolveThemePath(options);
  const targetPath = existsSync(themePath) ? themePath : dirname(themePath);
  const filename = basename(themePath);
  const debounceMs = options.debounceMs ?? 25;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const emit = () => {
    try {
      options.onChange(loadTheme({ ...options, path: themePath }));
    } catch (error) {
      options.onError?.(error);
    }
  };

  if (options.immediate ?? true) {
    emit();
  }

  if (!existsSync(targetPath)) {
    options.onError?.(new Error(`theme watch path does not exist: ${targetPath}`));
    return () => {
      if (timer) clearTimeout(timer);
    };
  }

  const watcher = watch(
    targetPath,
    { persistent: options.persistent ?? false },
    (_event, changedFilename) => {
      if (targetPath !== themePath && changedFilename && changedFilename.toString() !== filename) {
        return;
      }

      if (timer) clearTimeout(timer);
      timer = setTimeout(emit, debounceMs);
    },
  );

  return () => {
    if (timer) clearTimeout(timer);
    watcher.close();
  };
}
