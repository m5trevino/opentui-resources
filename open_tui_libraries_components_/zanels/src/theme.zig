// zanels/theme.zig — Generic color theme used by the border renderer.
//
// Apps that need extra slots (mention colors, channel labels, etc.) should
// define their own theme struct that contains a Theme inside it (or
// matches the generic field names) and select what to pass to the
// renderer's themeForPanel callback.
const opentui = @import("opentui");
pub const RGBA = opentui.RGBA;

pub const Theme = struct {
    background: RGBA,
    text: RGBA,
    text_dim: RGBA,
    border: RGBA,
    border_active: RGBA,
    accent: RGBA,
};

/// A reasonable monochrome default. Useful for examples and tests.
pub const default_theme: Theme = .{
    .background = .{ 0.05, 0.05, 0.07, 1.0 }, // near-black
    .text = .{ 0.86, 0.87, 0.89, 1.0 }, // light gray
    .text_dim = .{ 0.45, 0.47, 0.50, 1.0 }, // mid gray
    .border = .{ 0.36, 0.39, 0.44, 1.0 }, // soft slate
    .border_active = .{ 0.38, 0.69, 0.94, 1.0 }, // accent blue
    .accent = .{ 0.38, 0.69, 0.94, 1.0 },
};
