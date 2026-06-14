// Defines Fig props and font shapes for consumers and rendering.
// Encapsulates alignment and render options used by utilities in code.

export type FigAlign = "left" | "center" | "right";

export type FigFont =
  | string
  | {
    name: string;
    data?: string;
    path?: string;
  };

export interface FigProps {
  children: string;
  font?: FigFont;
  color?: string;
  align?: FigAlign;
  border?: boolean;
  padding?: number;
  width?: number | string;
}

export interface FigRenderOptions {
  align: FigAlign;
  border: boolean;
  padding: number;
  width: number;
}
