# zanels

A reusable panel/layout/border library for terminal UIs built on
[opentui](https://github.com/anomalyco/opentui)'s Zig package.

- **Grid-based proportional layout** — panels declare `(col, row, col_span,
  row_span)` against a virtual grid (default 10×10); pixel positions are
  computed proportionally to terminal size. No flexbox, no Yoga.
- **Shared-edge border rendering with junction detection** — when two
  panels share an edge, the renderer picks the right junction character
  (├ ┤ ┬ ┴ ┼) instead of double-drawing borders. Handles all border
  styles (rounded / single / double / heavy / wavy / dotted / dashed /
  stars / ascii / none) with light↔heavy↔double weight mixing.
- **Two-pass render dispatch** — the library draws every panel's border
  with shared-edge awareness, then invokes a user callback once per
  visible panel for content rendering.
- **Zero allocations** — the library never allocates. You own the panel
  slice and shared-edges slice.

## Status

Early — extracted from [shussh](https://github.com/jettptacek/shush)'s
in-tree panel system. API will move before 1.0.

## Quick start

```zig
const std = @import("std");
const opentui = @import("opentui");
const zanels = @import("zanels");

var panels = [_]zanels.Panel{
    .{ .col = 0, .row = 0, .col_span = 5, .row_span = 10 },
    .{ .col = 5, .row = 0, .col_span = 5, .row_span = 10 },
};
var edges = [_]zanels.SharedEdge{
    .{ .panel_a = 0, .panel_b = 1, .orientation = .vertical },
};

// Once per resize:
zanels.computeLayout(&panels, term_w, term_h,
                     zanels.DEFAULT_GRID_COLS, zanels.DEFAULT_GRID_ROWS);
zanels.computeSharedEdgeInfo(&panels, panels.len, &edges, edges.len);

// Per frame:
zanels.renderAll(buf, .{
    .panels = &panels,
    .panel_count = panels.len,
    .shared_edges = &edges,
    .shared_edge_count = edges.len,
    .rctx = my_render_context,           // see RenderContext below
    .render_content = renderContent,     // your switch (panel.kind) lives here
    .content_ctx = &my_app,
});
```

`Panel.kind` is a `u8` you assign meaning to. Dispatch on it inside your
content callback. If you want type-safe dispatch, define your own enum and
store `@intFromEnum(...)` on `kind`.

## RenderContext

The library asks the host for a few things via a vtable struct:

```zig
pub const RenderContext = struct {
    ctx: *const anyopaque,
    isFocused: *const fn (ctx: *const anyopaque, panel: *const Panel) bool,
    themeForPanel: *const fn (ctx: *const anyopaque, panel: *const Panel) *const Theme,
    stackCount: *const fn (ctx: *const anyopaque, panel_idx: u8) u8,
    stackPosition: *const fn (ctx: *const anyopaque, panel_idx: u8) u8,
};
```

Implement small free functions on your app struct that cast `ctx` back
and forward to your real methods.

## Module layout

| File              | Purpose                                                     |
|-------------------|-------------------------------------------------------------|
| `src/panels.zig`  | Public root — re-exports everything                         |
| `src/panel.zig`   | `Panel`, `PanelStyle`, color palette, spacer fill chars     |
| `src/border.zig`  | `BorderStyle`, `BORDER_CHARS`, junction resolution, primitives |
| `src/shared_edge.zig` | `SharedEdge`, `SharedEdgeInfo`, `SharedRange`           |
| `src/layout.zig`  | `computeLayout`, shared-edge pixel computation              |
| `src/render.zig`  | `RenderContext`, `drawAllBorders`, `renderAll`              |
| `src/theme.zig`   | Generic `Theme` struct (background / text / border / accent)|

## Build

```sh
zig build
zig build test
```

Add to a downstream project's `build.zig.zon`:

```zig
.dependencies = .{
    .zanels = .{ .path = "../zanels" },
    // or .url = "..." once published
},
```

…and in `build.zig`:

```zig
const zanels_dep = b.dependency("zanels", .{ .target = target, .optimize = optimize });
my_module.addImport("zanels", zanels_dep.module("zanels"));
```

## License

MIT (matching shussh).
