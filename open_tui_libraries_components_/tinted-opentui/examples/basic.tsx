import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { TintedOpenTUIProvider, useTintedTheme } from "tinty-opentui/react";

function Demo() {
  const theme = useTintedTheme();

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.tokens.background,
        padding: 1,
      }}
    >
      <box
        border
        borderColor={theme.components.box.borderColor}
        focusedBorderColor={theme.components.box.focusedBorderColor}
        backgroundColor={theme.components.box.backgroundColor}
        padding={1}
      >
        <text fg={theme.tokens.text}>
          {theme.name} via tinty-opentui
        </text>
        <text fg={theme.tokens.textMuted}>
          Run tinty apply base16-rose-pine, then restart or enable watch mode.
        </text>
      </box>
    </box>
  );
}

const renderer = await createCliRenderer({
  backgroundColor: "black",
});

createRoot(renderer).render(
  <TintedOpenTUIProvider renderer={renderer} watch>
    <Demo />
  </TintedOpenTUIProvider>,
);
