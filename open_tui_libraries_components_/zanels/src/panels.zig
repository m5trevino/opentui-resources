// zanels — A reusable panel/layout/border library for opentui terminal UIs.
//
// Panels are positioned on a grid (default 10×10) with (col, row, col_span,
// row_span). The library computes pixel rects, optionally merges shared
// borders between adjacent panels with proper junction characters, and
// dispatches per-panel content rendering through a user callback.
//
// Quick start:
//
//   const zanels = @import("zanels");
//
//   var panels: [4]zanels.Panel = .{ ... };
//   var edges:  [4]zanels.SharedEdge = .{ ... };
//
//   zanels.computeLayout(&panels, term_w, term_h,
//                        zanels.DEFAULT_GRID_COLS, zanels.DEFAULT_GRID_ROWS);
//   zanels.computeSharedEdgeInfo(&panels, panels.len, &edges, edges.len);
//
//   // Per frame:
//   zanels.renderAll(buf, .{
//       .panels = &panels,
//       .panel_count = panels.len,
//       .shared_edges = &edges,
//       .shared_edge_count = edges.len,
//       .rctx = my_render_context,
//       .render_content = renderContent,
//       .content_ctx = &my_app,
//   });
//
// The library never allocates and stores no panel state — you own the
// panel slice and the shared-edge slice.

const panel_mod = @import("panel.zig");
const border_mod = @import("border.zig");
const shared_edge_mod = @import("shared_edge.zig");
const layout_mod = @import("layout.zig");
const render_mod = @import("render.zig");
const theme_mod = @import("theme.zig");

// --- Re-exports: types ---
pub const Panel = panel_mod.Panel;
pub const PanelStyle = panel_mod.PanelStyle;
pub const MAX_PANELS = panel_mod.MAX_PANELS;
pub const MAX_PANEL_ID_LEN = panel_mod.MAX_PANEL_ID_LEN;

pub const BorderStyle = border_mod.BorderStyle;
pub const BorderWeight = border_mod.BorderWeight;
pub const BORDER_CHARS = border_mod.BORDER_CHARS;
pub const BORDER_STYLE_COUNT = border_mod.BORDER_STYLE_COUNT;
pub const BORDER_STYLE_NAMES = border_mod.BORDER_STYLE_NAMES;

pub const SharedEdge = shared_edge_mod.SharedEdge;
pub const SharedEdgeInfo = shared_edge_mod.SharedEdgeInfo;
pub const SharedRange = shared_edge_mod.SharedRange;
pub const AdjacentEdge = shared_edge_mod.AdjacentEdge;
pub const MAX_SHARED_EDGES = shared_edge_mod.MAX_SHARED_EDGES;
pub const MAX_ADJACENT_EDGES = shared_edge_mod.MAX_ADJACENT_EDGES;
pub const MAX_SHARED_RANGES_PER_SIDE = shared_edge_mod.MAX_SHARED_RANGES_PER_SIDE;

pub const Theme = theme_mod.Theme;
pub const default_theme = theme_mod.default_theme;

pub const RenderContext = render_mod.RenderContext;
pub const RenderContentFn = render_mod.RenderContentFn;
pub const RenderOptions = render_mod.RenderOptions;

// --- Re-exports: constants ---
pub const DEFAULT_GRID_COLS = layout_mod.DEFAULT_GRID_COLS;
pub const DEFAULT_GRID_ROWS = layout_mod.DEFAULT_GRID_ROWS;
pub const MIN_GRID = layout_mod.MIN_GRID;
pub const MAX_GRID = layout_mod.MAX_GRID;

pub const STYLE_COLOR_COUNT = panel_mod.STYLE_COLOR_COUNT;
pub const STYLE_COLOR_NAMES = panel_mod.STYLE_COLOR_NAMES;
pub const STYLE_COLORS = panel_mod.STYLE_COLORS;
pub const SPACER_FILL_COUNT = panel_mod.SPACER_FILL_COUNT;
pub const SPACER_FILL_LABELS = panel_mod.SPACER_FILL_LABELS;
pub const SPACER_FILL_CHARS = panel_mod.SPACER_FILL_CHARS;
pub const SPACER_FILL_CODEPOINTS = panel_mod.SPACER_FILL_CODEPOINTS;

// --- Re-exports: layout functions ---
pub const computeLayout = layout_mod.computeLayout;
pub const computeSharedEdgeInfo = layout_mod.computeSharedEdgeInfo;
pub const updateSharedEdges = layout_mod.updateSharedEdges;
pub const discoverEdges = layout_mod.discoverEdges;
pub const regionOverlaps = layout_mod.regionOverlaps;
pub const cellOccupant = layout_mod.cellOccupant;
pub const hasOverlap = layout_mod.hasOverlap;

// --- Re-exports: border drawing ---
pub const borderWeight = border_mod.borderWeight;
pub const resolveJunction = border_mod.resolveJunction;
pub const drawBorderBox = border_mod.drawBorderBox;
pub const drawStyledBorderBox = border_mod.drawStyledBorderBox;
pub const drawSharedBorderBox = border_mod.drawSharedBorderBox;
pub const resolveStyleColor = panel_mod.resolveStyleColor;

// --- Re-exports: rendering ---
pub const drawAllBorders = render_mod.drawAllBorders;
pub const drawSharedEdges = render_mod.drawSharedEdges;
pub const renderAll = render_mod.renderAll;

// Tests live in their own file; reference here so `zig build test` picks
// them up via the public root.
test {
    _ = @import("panel.zig");
    _ = @import("border.zig");
    _ = @import("shared_edge.zig");
    _ = @import("layout.zig");
    _ = @import("render.zig");
    _ = @import("theme.zig");
}
