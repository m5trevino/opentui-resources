// zanels/panel.zig — Panel struct, PanelStyle, and panel-related constants.
//
// Panel.kind is a u8 tag the user assigns meaning to. The library never
// interprets it. Apps typically dispatch on it inside their content render
// callback (see render.zig). If you need type safety, define your own
// `PanelKind` enum and store `@intFromEnum(kind)` on Panel.kind.
//
// Panel intentionally has no `state` field — the library keeps zero
// per-panel state. Apps store state externally (e.g. in a parallel
// `[N]MyState` array indexed by panel index, or by wrapping Panel in a
// host struct with extra fields).
const opentui = @import("opentui");
const border = @import("border.zig");
const shared_edge = @import("shared_edge.zig");

pub const RGBA = opentui.RGBA;

// --- Layout caps (use slices for the per-frame data; these are advisory) ---
pub const MAX_PANELS: u8 = 16;
pub const MAX_PANEL_ID_LEN: u8 = 8;

/// A panel: a grid-positioned region with optional border, title, and style.
pub const Panel = struct {
    /// User-defined tag. The library never inspects this; your content
    /// renderer dispatches on it.
    kind: u8 = 0,
    /// Grid position and span (col,row are top-left in grid units).
    col: u16,
    row: u16,
    col_span: u16,
    row_span: u16,
    /// Group ID for theming (apps may render different groups in different palettes).
    group: u8 = 0,
    /// Stack z-order: panels at the same grid slot stack visually; the panel
    /// with the highest stack_z is on top.
    stack_z: u8 = 0,
    /// Optional short ID for panel linking (e.g. "main", "sb1").
    id: [MAX_PANEL_ID_LEN]u8 = .{0} ** MAX_PANEL_ID_LEN,
    id_len: u8 = 0,
    // --- Computed by layout.computeLayout (do not set manually) ---
    x: u16 = 0,
    y: u16 = 0,
    width: u16 = 0,
    height: u16 = 0,
    /// If false, the panel is skipped during render.
    visible: bool = true,
    /// If false, the panel is excluded from focus cycling. Apps that don't
    /// implement focus can ignore this; the library reads it via
    /// `RenderContext.isFocused` so it's purely advisory at the panel level.
    focusable: bool = true,
    /// Per-panel style overrides (border, title, colors).
    style: PanelStyle = .{},
    /// Computed shared-edge suppression info (populated by
    /// layout.computeSharedEdgeInfo, not persisted across frames).
    shared_edges: shared_edge.SharedEdgeInfo = .{},

    pub fn idSlice(self: *const Panel) []const u8 {
        return self.id[0..self.id_len];
    }

    /// Two panels occupy the same grid slot when their (col,row,col_span,row_span)
    /// match exactly. Used for stack detection.
    pub fn isSameSlot(self: *const Panel, other: *const Panel) bool {
        return self.col == other.col and self.row == other.row and
            self.col_span == other.col_span and self.row_span == other.row_span;
    }

    pub fn innerX(self: *const Panel) u16 {
        return self.x + 1;
    }

    pub fn innerY(self: *const Panel) u16 {
        return self.y + 1;
    }

    pub fn innerWidth(self: *const Panel) u16 {
        if (self.width < 2) return 0;
        return self.width - 2;
    }

    pub fn innerHeight(self: *const Panel) u16 {
        if (self.height < 2) return 0;
        return self.height - 2;
    }
};

/// Per-panel style overrides. Color indices index into STYLE_COLORS; index 0
/// always means "use the theme's default" rather than an actual color.
pub const PanelStyle = struct {
    border_style: border.BorderStyle = .rounded,
    border_color_idx: u8 = 0, // 0 = theme default, 1..STYLE_COLOR_COUNT = palette
    bg_color_idx: u8 = 0,
    focus_border_color_idx: u8 = 0,
    title: [32]u8 = .{0} ** 32,
    title_len: u8 = 0,
    // Spacer-style fill: index into SPACER_FILL_CHARS / SPACER_FILL_CODEPOINTS.
    fill_char_idx: u8 = 0,
    fill_fg_color_idx: u8 = 0,

    pub fn isDefault(self: *const PanelStyle) bool {
        return self.border_style == .rounded and
            self.border_color_idx == 0 and
            self.bg_color_idx == 0 and
            self.focus_border_color_idx == 0 and
            self.title_len == 0 and
            self.fill_char_idx == 0 and
            self.fill_fg_color_idx == 0;
    }
};

// --- Spacer fill character options (useful for "spacer" / placeholder panels) ---
pub const SPACER_FILL_COUNT: u8 = 12;
pub const SPACER_FILL_LABELS = [SPACER_FILL_COUNT][]const u8{
    "Full Block",
    "Horizontal",
    "Vertical",
    "Heavy Horiz",
    "Heavy Vert",
    "Double Horiz",
    "Double Vert",
    "Light Shade",
    "Medium Shade",
    "Dark Shade",
    "Dot",
    "Blank",
};
pub const SPACER_FILL_CHARS = [SPACER_FILL_COUNT][]const u8{
    "\xe2\x96\x88", // █ U+2588  Full Block
    "\xe2\x94\x80", // ─ U+2500  Box Drawings Light Horizontal
    "\xe2\x94\x82", // │ U+2502  Box Drawings Light Vertical
    "\xe2\x94\x81", // ━ U+2501  Box Drawings Heavy Horizontal
    "\xe2\x94\x83", // ┃ U+2503  Box Drawings Heavy Vertical
    "\xe2\x95\x90", // ═ U+2550  Box Drawings Double Horizontal
    "\xe2\x95\x91", // ║ U+2551  Box Drawings Double Vertical
    "\xe2\x96\x91", // ░ U+2591  Light Shade
    "\xe2\x96\x92", // ▒ U+2592  Medium Shade
    "\xe2\x96\x93", // ▓ U+2593  Dark Shade
    "\xc2\xb7", // · U+00B7  Middle Dot
    " ", // blank (space)
};
pub const SPACER_FILL_CODEPOINTS = [SPACER_FILL_COUNT]u21{
    0x2588, 0x2500, 0x2502, 0x2501, 0x2503, 0x2550,
    0x2551, 0x2591, 0x2592, 0x2593, 0x00B7, 0x0020,
};

// --- Color palette for panel-style pickers (index 0 = theme default sentinel) ---
pub const STYLE_COLOR_COUNT: u8 = 14;
pub const STYLE_COLOR_NAMES = [STYLE_COLOR_COUNT][]const u8{
    "Default", "Red",  "Green",  "Blue",    "Yellow",
    "Purple",  "Cyan", "Orange", "Pink",    "White",
    "Gray",    "Teal", "Lime",   "Magenta",
};
pub const STYLE_COLORS = [STYLE_COLOR_COUNT]RGBA{
    .{ 0, 0, 0, 0 }, // 0 = sentinel "use theme"
    .{ 224.0 / 255.0, 108.0 / 255.0, 117.0 / 255.0, 1.0 }, // #e06c75 red
    .{ 152.0 / 255.0, 195.0 / 255.0, 121.0 / 255.0, 1.0 }, // #98c379 green
    .{ 97.0 / 255.0, 175.0 / 255.0, 239.0 / 255.0, 1.0 }, // #61afef blue
    .{ 229.0 / 255.0, 192.0 / 255.0, 123.0 / 255.0, 1.0 }, // #e5c07b yellow
    .{ 198.0 / 255.0, 120.0 / 255.0, 221.0 / 255.0, 1.0 }, // #c678dd purple
    .{ 86.0 / 255.0, 182.0 / 255.0, 194.0 / 255.0, 1.0 }, // #56b6c2 cyan
    .{ 209.0 / 255.0, 154.0 / 255.0, 102.0 / 255.0, 1.0 }, // #d19a66 orange
    .{ 255.0 / 255.0, 150.0 / 255.0, 200.0 / 255.0, 1.0 }, // #ff96c8 pink
    .{ 220.0 / 255.0, 223.0 / 255.0, 228.0 / 255.0, 1.0 }, // #dcdfe4 white
    .{ 92.0 / 255.0, 99.0 / 255.0, 112.0 / 255.0, 1.0 }, // #5c6370 gray
    .{ 0.0, 150.0 / 255.0, 136.0 / 255.0, 1.0 }, // #009688 teal
    .{ 100.0 / 255.0, 221.0 / 255.0, 23.0 / 255.0, 1.0 }, // #64dd17 lime
    .{ 224.0 / 255.0, 64.0 / 255.0, 251.0 / 255.0, 1.0 }, // #e040fb magenta
};

/// Resolve a STYLE_COLORS index to an RGBA, falling back to the supplied
/// default when the index is 0 (the "use theme" sentinel) or out of range.
pub fn resolveStyleColor(idx: u8, default_color: RGBA) RGBA {
    if (idx == 0 or idx >= STYLE_COLOR_COUNT) return default_color;
    return STYLE_COLORS[idx];
}
