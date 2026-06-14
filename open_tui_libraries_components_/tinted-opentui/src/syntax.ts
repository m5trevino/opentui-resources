import { SyntaxStyle, type ThemeTokenStyle } from "@opentui/core";
import type { TintyOpenTUITheme } from "./types.js";

export function createSyntaxTheme(theme: TintyOpenTUITheme): ThemeTokenStyle[] {
  const { palette } = theme;

  return [
    {
      scope: ["comment", "punctuation.definition.comment"],
      style: { foreground: palette.base03, italic: true },
    },
    {
      scope: ["string", "string.quoted", "string.template"],
      style: { foreground: palette.base0B },
    },
    {
      scope: ["constant", "constant.numeric", "number", "boolean"],
      style: { foreground: palette.base09 },
    },
    {
      scope: ["keyword", "storage", "operator"],
      style: { foreground: palette.base0E },
    },
    {
      scope: ["function", "entity.name.function", "support.function", "method"],
      style: { foreground: palette.base0D },
    },
    {
      scope: ["type", "entity.name.type", "entity.name.class", "support.type"],
      style: { foreground: palette.base0A },
    },
    {
      scope: ["variable", "identifier", "property", "field"],
      style: { foreground: palette.base05 },
    },
    {
      scope: ["variable.parameter", "parameter"],
      style: { foreground: palette.base08 },
    },
    {
      scope: ["tag", "entity.name.tag"],
      style: { foreground: palette.base08 },
    },
    {
      scope: ["attribute", "entity.other.attribute-name"],
      style: { foreground: palette.base0A },
    },
    {
      scope: ["punctuation", "delimiter"],
      style: { foreground: palette.base04 },
    },
    {
      scope: ["markup.heading", "heading"],
      style: { foreground: palette.base0D, bold: true },
    },
    {
      scope: ["markup.bold", "strong"],
      style: { foreground: palette.base05, bold: true },
    },
    {
      scope: ["markup.italic", "emphasis"],
      style: { foreground: palette.base05, italic: true },
    },
    {
      scope: ["markup.link", "link"],
      style: { foreground: palette.base0C, underline: true },
    },
    {
      scope: ["diff.plus", "markup.inserted"],
      style: { foreground: palette.base0B },
    },
    {
      scope: ["diff.minus", "markup.deleted"],
      style: { foreground: palette.base08 },
    },
    {
      scope: ["diff.delta", "markup.changed"],
      style: { foreground: palette.base0A },
    },
  ];
}

export function createSyntaxStyle(theme: TintyOpenTUITheme): SyntaxStyle {
  return SyntaxStyle.fromTheme(createSyntaxTheme(theme));
}
