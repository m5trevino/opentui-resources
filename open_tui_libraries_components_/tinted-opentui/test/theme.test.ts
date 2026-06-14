import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import {
  createThemeFromPalette,
  defaultPalette,
  defaultTheme,
  loadTheme,
  resolveThemePath,
  TINTY_OPENTUI_THEME_ENV,
} from "../src/index.js";

describe("tinty-opentui theme loading", () => {
  test("resolves tinty path from HOME by default", () => {
    expect(resolveThemePath({ env: {}, home: "/tmp/home" })).toBe(
      "/tmp/home/.local/share/tinted-theming/tinty/tinted-opentui-themes-file.json",
    );
  });

  test("uses env override before default path", () => {
    expect(
      resolveThemePath({
        env: { [TINTY_OPENTUI_THEME_ENV]: "/tmp/custom-theme.json" },
        home: "/tmp/home",
      }),
    ).toBe("/tmp/custom-theme.json");
  });

  test("falls back when no artifact exists", () => {
    const theme = loadTheme({ path: "/tmp/definitely-missing-tinty-opentui.json" });
    expect(theme.slug).toBe(defaultTheme.slug);
  });

  test("loads and normalizes a generated theme artifact", () => {
    const dir = mkdtempSync(join(tmpdir(), "tinty-opentui-"));
    const path = join(dir, "theme.json");

    writeFileSync(
      path,
      JSON.stringify({
        name: "Test",
        slug: "test",
        system: "base16",
        author: "Ada &lt;ada@example.com&gt;",
        palette: defaultPalette,
        tokens: { accent: "#ffffff" },
      }),
    );

    const theme = loadTheme({ path });
    expect(theme.name).toBe("Test");
    expect(theme.author).toBe("Ada <ada@example.com>");
    expect(theme.tokens.accent).toBe("#ffffff");
    expect(theme.components.box.borderColor).toBe(defaultPalette.base03);

    rmSync(dir, { recursive: true, force: true });
  });

  test("creates a complete theme from a base palette", () => {
    const theme = createThemeFromPalette({
      name: "Unit",
      slug: "unit",
      system: "base16",
      palette: defaultPalette,
    });

    expect(theme.palette.base00).toBe("#191724");
    expect(theme.tokens.background).toBe("#191724");
    expect(theme.components.select.selectedBackgroundColor).toBe(defaultPalette.base0D);
  });
});
