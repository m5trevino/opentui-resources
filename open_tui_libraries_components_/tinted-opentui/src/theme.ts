import {
  BASE_SLOTS,
  type BasePalette,
  type DeepPartial,
  type OpenTUIComponentTheme,
  type OpenTUITokens,
  type TintyOpenTUITheme,
} from "./types.js";

const HEX_COLOR_RE = /^#?[0-9a-fA-F]{6}$/;

export class TintyOpenTUIThemeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TintyOpenTUIThemeError";
  }
}

export const defaultPalette: BasePalette = {
  base00: "#191724",
  base01: "#1f1d2e",
  base02: "#26233a",
  base03: "#6e6a86",
  base04: "#908caa",
  base05: "#e0def4",
  base06: "#e0def4",
  base07: "#524f67",
  base08: "#eb6f92",
  base09: "#f6c177",
  base0A: "#ebbcba",
  base0B: "#31748f",
  base0C: "#9ccfd8",
  base0D: "#c4a7e7",
  base0E: "#f6c177",
  base0F: "#524f67",
};

export function normalizeHexColor(value: unknown, label: string): string {
  if (typeof value !== "string" || !HEX_COLOR_RE.test(value)) {
    throw new TintyOpenTUIThemeError(`${label} must be a 6-digit hex color`);
  }

  const hex = value.startsWith("#") ? value : `#${value}`;
  return hex.toLowerCase();
}

export function normalizePalette(palette: unknown): BasePalette {
  if (!isRecord(palette)) {
    throw new TintyOpenTUIThemeError("theme.palette must be an object");
  }

  const normalized: Partial<BasePalette> = {};
  for (const slot of BASE_SLOTS) {
    normalized[slot] = normalizeHexColor(palette[slot], `theme.palette.${slot}`);
  }

  return normalized as BasePalette;
}

export function createTokens(palette: BasePalette): OpenTUITokens {
  return {
    background: palette.base00,
    surface: palette.base01,
    surfaceAlt: palette.base02,
    surfaceRaised: palette.base02,
    border: palette.base03,
    borderFocused: palette.base0D,
    text: palette.base05,
    textMuted: palette.base04,
    textSubtle: palette.base03,
    textInverse: palette.base00,
    accent: palette.base0D,
    accentText: palette.base00,
    success: palette.base0B,
    warning: palette.base0A,
    danger: palette.base08,
    info: palette.base0C,
    selectionBg: palette.base02,
    selectionFg: palette.base05,
    cursor: palette.base0D,
    scrollbarTrack: palette.base01,
    scrollbarThumb: palette.base03,
  };
}

export function createComponentTheme(tokens: OpenTUITokens): OpenTUIComponentTheme {
  return {
    renderer: {
      backgroundColor: tokens.background,
      cursorColor: tokens.cursor,
    },
    box: {
      backgroundColor: tokens.background,
      borderColor: tokens.border,
      focusedBorderColor: tokens.borderFocused,
    },
    text: {
      fg: tokens.text,
      bg: tokens.background,
      selectionBg: tokens.selectionBg,
      selectionFg: tokens.selectionFg,
    },
    input: {
      backgroundColor: tokens.surface,
      textColor: tokens.text,
      focusedBackgroundColor: tokens.surfaceAlt,
      focusedTextColor: tokens.text,
      placeholderColor: tokens.textMuted,
      selectionBg: tokens.border,
      selectionFg: tokens.text,
      cursorColor: tokens.cursor,
    },
    textarea: {
      backgroundColor: tokens.surface,
      textColor: tokens.text,
      focusedBackgroundColor: tokens.surfaceAlt,
      focusedTextColor: tokens.text,
      placeholderColor: tokens.textMuted,
      selectionBg: tokens.border,
      selectionFg: tokens.text,
      cursorColor: tokens.cursor,
    },
    select: {
      backgroundColor: tokens.background,
      textColor: tokens.text,
      focusedBackgroundColor: tokens.surface,
      focusedTextColor: tokens.text,
      selectedBackgroundColor: tokens.accent,
      selectedTextColor: tokens.accentText,
      descriptionColor: tokens.textMuted,
      selectedDescriptionColor: tokens.accentText,
    },
    tabSelect: {
      backgroundColor: tokens.background,
      textColor: tokens.textMuted,
      focusedBackgroundColor: tokens.surface,
      focusedTextColor: tokens.text,
      selectedBackgroundColor: tokens.accent,
      selectedTextColor: tokens.accentText,
      selectedDescriptionColor: tokens.accentText,
    },
    scrollbar: {
      trackOptions: {
        backgroundColor: tokens.scrollbarTrack,
        foregroundColor: tokens.scrollbarThumb,
      },
      arrowOptions: {
        foregroundColor: tokens.textMuted,
        backgroundColor: tokens.scrollbarTrack,
      },
    },
    markdown: {
      fg: tokens.text,
      bg: tokens.background,
      borderColor: tokens.border,
    },
    code: {
      fg: tokens.text,
      bg: tokens.background,
      selectionBg: tokens.selectionBg,
      selectionFg: tokens.selectionFg,
    },
  };
}

export function createThemeFromPalette(input: {
  name: string;
  slug: string;
  system: string;
  author?: string;
  variant?: string;
  palette: BasePalette;
  tokens?: Partial<OpenTUITokens>;
  components?: DeepPartial<OpenTUIComponentTheme>;
}): TintyOpenTUITheme {
  const palette = normalizePalette(input.palette);
  const tokens = mergeDeep(createTokens(palette), input.tokens);
  const components = mergeDeep(createComponentTheme(tokens), input.components);

  return {
    schemaVersion: 1,
    name: input.name,
    slug: input.slug,
    system: input.system,
    ...(input.author ? { author: input.author } : {}),
    ...(input.variant ? { variant: input.variant } : {}),
    palette,
    tokens,
    components,
  };
}

export function normalizeTheme(raw: unknown): TintyOpenTUITheme {
  if (!isRecord(raw)) {
    throw new TintyOpenTUIThemeError("theme file must contain a JSON object");
  }

  const palette = normalizePalette(raw.palette);
  const author = asOptionalString(raw.author);
  const variant = asOptionalString(raw.variant);
  const name = decodeHtmlEntities(
    asOptionalString(raw.name) ?? asOptionalString(raw.slug) ?? "Tinted OpenTUI",
  );

  return createThemeFromPalette({
    name,
    slug: asOptionalString(raw.slug) ?? "unknown",
    system: asOptionalString(raw.system) ?? "base16",
    ...(author ? { author: decodeHtmlEntities(author) } : {}),
    ...(variant ? { variant } : {}),
    palette,
    ...(isRecord(raw.tokens) ? { tokens: raw.tokens as Partial<OpenTUITokens> } : {}),
    ...(isRecord(raw.components)
      ? { components: raw.components as DeepPartial<OpenTUIComponentTheme> }
      : {}),
  });
}

export const defaultTheme: TintyOpenTUITheme = createThemeFromPalette({
  name: "Rose Pine",
  slug: "rose-pine",
  system: "base16",
  author: "Emilia Dunfelt <edun@dunfelt.se>",
  palette: defaultPalette,
});

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => {
    switch (entity) {
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&#39;":
        return "'";
      default:
        return entity;
    }
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeDeep<T extends object>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;

    const baseValue = result[key];
    if (isRecord(baseValue) && isRecord(value)) {
      result[key] = mergeDeep(baseValue, value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
