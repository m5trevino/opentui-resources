// Renders FIGlet text inside OpenTUI boxes with alignment and padding.
// Resolves fonts and formats output efficiently per terminal size changes.

import { useMemo } from "react";
import { useTerminalDimensions } from "@opentui/react";
import figlet from "figlet";
import { resolveFont } from "./font";
import type { FigProps } from "./types";
import { cleanText, clampWidth, formatFig, resolveInputWidth } from "./utils";

export function Fig({
  children,
  font,
  color,
  align = "left",
  border = false,
  padding = 0,
  width,
}: FigProps) {
  const size = useTerminalDimensions();
  const body = useMemo(() => {
    const target = resolveInputWidth(width, size.width);
    const pad = Math.max(0, Math.floor(padding));
    const inner = clampWidth(target - (border ? 2 : 0) - pad * 2);
    const text = cleanText(children);

    if (!text) {
      return "";
    }

    try {
      return formatFig(
        figlet.textSync(text, {
          font: resolveFont(font),
          width: inner,
          whitespaceBreak: true,
        }),
        {
          align,
          border,
          padding: pad,
          width: inner,
        },
      );
    } catch {
      try {
        return formatFig(
          figlet.textSync(text, {
            font: "Standard",
            width: inner,
            whitespaceBreak: true,
          }),
          {
            align,
            border,
            padding: pad,
            width: inner,
          },
        );
      } catch {
        return formatFig(text, { align, border, padding: pad, width: inner });
      }
    }
  }, [align, border, children, font, padding, size.width, width]);

  const lines = body ? body.split("\n") : [""];
  return (
    <box flexDirection="column">
      {lines.map((line, index) =>
        color ? (
          <text key={`${index}`} fg={color}>
            {line || " "}
          </text>
        ) : (
          <text key={`${index}`}>{line || " "}</text>
        ),
      )}
    </box>
  );
}
