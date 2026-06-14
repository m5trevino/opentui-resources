# Tinty OpenTUI

[Tinted Theming] color schemes and runtime helpers for [OpenTUI] apps.
It lets `tinty apply <scheme>` produce a JSON artifact that any OpenTUI app
can load and use for renderer colors, component defaults, and syntax styles.

## Install

```sh
bun add tinty-opentui @opentui/core
```

For React OpenTUI apps:

```sh
bun add tinty-opentui @opentui/core @opentui/react react
```

## Tinty

Add this to `~/.config/tinted-theming/tinty/config.toml`:

```toml
[[items]]
name = "tinted-opentui"
path = "https://github.com/possibilities/tinted-opentui"
themes-dir = "themes"
supported-systems = ["base16", "base24"]
```

Then run:

```sh
tinty install
tinty apply base16-rose-pine
```

Tinty will maintain this symlink:

```text
~/.local/share/tinted-theming/tinty/tinted-opentui-themes-file.json
```

Set `TINTY_OPENTUI_THEME=/path/to/theme.json` if an app should load a
different artifact.

## Core Usage

```ts
import { createCliRenderer } from "@opentui/core";
import { applyRendererTheme, createSyntaxStyle, loadTheme } from "tinty-opentui";

const theme = loadTheme();
const renderer = await createCliRenderer();

applyRendererTheme(renderer, theme);

const syntaxStyle = createSyntaxStyle(theme);

// Pass these into OpenTUI renderables.
theme.components.box;
theme.components.input;
theme.components.select;
syntaxStyle;
```

`loadTheme()` falls back to a built-in Rose Pine theme when the tinty artifact
does not exist. Invalid JSON or invalid color data throws a
`TintyOpenTUIThemeError`.

## React Usage

```tsx
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { TintedOpenTUIProvider, useTintedTheme } from "tinty-opentui/react";

function App() {
  const theme = useTintedTheme();

  return (
    <box backgroundColor={theme.tokens.background}>
      <text fg={theme.tokens.text}>Tinted OpenTUI</text>
    </box>
  );
}

const renderer = await createCliRenderer();

createRoot(renderer).render(
  <TintedOpenTUIProvider renderer={renderer} watch>
    <App />
  </TintedOpenTUIProvider>,
);
```

`watch` is opt-in. Without it, apps load the tinty artifact at startup.

## Theme Shape

Each generated JSON file includes:

- `palette`: raw `base00` through `base0F` colors.
- `tokens`: semantic colors such as `background`, `text`, `accent`,
  `selectionBg`, and `cursor`.
- `components`: default color props for common OpenTUI renderables including
  `box`, `text`, `input`, `textarea`, `select`, `tabSelect`, `scrollbar`,
  `markdown`, and `code`.

## Build

```sh
bun install
bun run generate
bun test
bun run typecheck
bun run build
```

Regenerate themes after template changes:

```sh
bun run generate
```

`bun run generate` uses `TINTED_SCHEMES_DIR` when set, otherwise it uses the
local tinty schemes checkout at
`~/.local/share/tinted-theming/tinty/repos/schemes` when available.

[Tinted Theming]: https://github.com/tinted-theming/home
[OpenTUI]: https://github.com/anomalyco/opentui
