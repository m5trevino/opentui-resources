import { BoxProps } from "@opentui/react";

export function BoxPanel({
  title,
  children,
  ...props
}: BoxProps & { title?: string }) {
  return (
    <box border title={title} padding={1} {...props}>
      {children}
    </box>
  );
}
