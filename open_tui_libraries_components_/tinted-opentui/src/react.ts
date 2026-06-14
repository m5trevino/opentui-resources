import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyRendererTheme, type ApplyRendererThemeOptions } from "./renderer.js";
import { defaultTheme } from "./theme.js";
import { loadTheme, type LoadThemeOptions } from "./load.js";
import { watchTheme, type StopWatchingTheme } from "./watch.js";
import type { TintyOpenTUITheme } from "./types.js";
import type { CliRenderer } from "@opentui/core";

export const TintedOpenTUIContext = createContext<TintyOpenTUITheme>(defaultTheme);

export interface TintedOpenTUIProviderProps extends LoadThemeOptions {
  children: ReactNode;
  theme?: TintyOpenTUITheme;
  watch?: boolean;
  renderer?: Pick<CliRenderer, "setBackgroundColor" | "setCursorColor">;
  rendererOptions?: ApplyRendererThemeOptions;
  onError?: (error: unknown) => void;
}

export function TintedOpenTUIProvider({
  children,
  theme: providedTheme,
  watch = false,
  renderer,
  rendererOptions,
  onError,
  ...loadOptions
}: TintedOpenTUIProviderProps) {
  const [theme, setTheme] = useState<TintyOpenTUITheme>(() => {
    if (providedTheme) return providedTheme;
    try {
      return loadTheme(loadOptions);
    } catch (error) {
      onError?.(error);
      return defaultTheme;
    }
  });

  useEffect(() => {
    if (providedTheme) {
      setTheme(providedTheme);
    }
  }, [providedTheme]);

  useEffect(() => {
    if (!watch || providedTheme) return undefined;

    return watchTheme({
      ...loadOptions,
      onChange: setTheme,
      ...(onError ? { onError } : {}),
    });
  }, [watch, providedTheme, loadOptions.path, loadOptions.home, loadOptions.env, onError]);

  useEffect(() => {
    if (renderer) {
      applyRendererTheme(renderer, theme, rendererOptions);
    }
  }, [renderer, rendererOptions, theme]);

  return createElement(TintedOpenTUIContext.Provider, { value: theme }, children);
}

export function useTintedTheme(): TintyOpenTUITheme {
  return useContext(TintedOpenTUIContext);
}

export interface UseTintedThemeWatcherOptions extends LoadThemeOptions {
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export function useTintedThemeWatcher(
  options: UseTintedThemeWatcherOptions = {},
): TintyOpenTUITheme {
  const { enabled = true, onError, ...loadOptions } = options;
  const [theme, setTheme] = useState<TintyOpenTUITheme>(() => {
    try {
      return loadTheme(loadOptions);
    } catch (error) {
      onError?.(error);
      return defaultTheme;
    }
  });

  const watchOptions = useMemo(
    () => ({
      ...loadOptions,
      onChange: setTheme,
      ...(onError ? { onError } : {}),
    }),
    [loadOptions.path, loadOptions.home, loadOptions.env, onError],
  );

  useEffect((): StopWatchingTheme | undefined => {
    if (!enabled) return undefined;
    return watchTheme(watchOptions);
  }, [enabled, watchOptions]);

  return theme;
}
