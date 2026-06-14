export const BASE_SLOTS = [
  "base00",
  "base01",
  "base02",
  "base03",
  "base04",
  "base05",
  "base06",
  "base07",
  "base08",
  "base09",
  "base0A",
  "base0B",
  "base0C",
  "base0D",
  "base0E",
  "base0F",
] as const;

export type BaseSlot = (typeof BASE_SLOTS)[number];
export type BasePalette = Record<BaseSlot, string>;
export type TintedSystem = "base16" | "base24" | (string & {});

export interface OpenTUITokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderFocused: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  accent: string;
  accentText: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  selectionBg: string;
  selectionFg: string;
  cursor: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
}

export interface RendererTheme {
  backgroundColor: string;
  cursorColor: string;
}

export interface BoxTheme {
  backgroundColor: string;
  borderColor: string;
  focusedBorderColor: string;
}

export interface TextTheme {
  fg: string;
  bg: string;
  selectionBg: string;
  selectionFg: string;
}

export interface InputTheme {
  backgroundColor: string;
  textColor: string;
  focusedBackgroundColor: string;
  focusedTextColor: string;
  placeholderColor: string;
  selectionBg: string;
  selectionFg: string;
  cursorColor: string;
}

export interface SelectTheme {
  backgroundColor: string;
  textColor: string;
  focusedBackgroundColor: string;
  focusedTextColor: string;
  selectedBackgroundColor: string;
  selectedTextColor: string;
  descriptionColor: string;
  selectedDescriptionColor: string;
}

export interface TabSelectTheme {
  backgroundColor: string;
  textColor: string;
  focusedBackgroundColor: string;
  focusedTextColor: string;
  selectedBackgroundColor: string;
  selectedTextColor: string;
  selectedDescriptionColor: string;
}

export interface ScrollbarTheme {
  trackOptions: {
    backgroundColor: string;
    foregroundColor: string;
  };
  arrowOptions: {
    foregroundColor: string;
    backgroundColor: string;
  };
}

export interface MarkdownTheme {
  fg: string;
  bg: string;
  borderColor: string;
}

export interface CodeTheme {
  fg: string;
  bg: string;
  selectionBg: string;
  selectionFg: string;
}

export interface OpenTUIComponentTheme {
  renderer: RendererTheme;
  box: BoxTheme;
  text: TextTheme;
  input: InputTheme;
  textarea: InputTheme;
  select: SelectTheme;
  tabSelect: TabSelectTheme;
  scrollbar: ScrollbarTheme;
  markdown: MarkdownTheme;
  code: CodeTheme;
}

export interface TintyOpenTUITheme {
  schemaVersion: 1;
  name: string;
  slug: string;
  system: TintedSystem;
  author?: string;
  variant?: string;
  palette: BasePalette;
  tokens: OpenTUITokens;
  components: OpenTUIComponentTheme;
}

export type PartialTintyOpenTUITheme = Partial<
  Omit<TintyOpenTUITheme, "palette" | "tokens" | "components">
> & {
  palette?: Partial<BasePalette>;
  tokens?: Partial<OpenTUITokens>;
  components?: DeepPartial<OpenTUIComponentTheme>;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
