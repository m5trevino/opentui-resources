// zanels/border.zig — Border styles, junction resolution, and bordered-box
// drawing primitives. Together with shared_edge.zig and render.zig this
// implements the shared-edge border system: when two panels share an edge,
// the renderer draws the right junction character (├ ┤ ┬ ┴ ┼) and per-arm
// light/heavy mixings, instead of double-drawing borders.
const std = @import("std");
const opentui = @import("opentui");
const shared_edge = @import("shared_edge.zig");

pub const OptimizedBuffer = opentui.OptimizedBuffer;
pub const RGBA = opentui.RGBA;

/// Border styles for panels.
pub const BorderStyle = enum(u8) {
    rounded = 0, // ╭╮╰╯─│  (default)
    single = 1, // ┌┐└┘─│
    double = 2, // ╔╗╚╝═║
    heavy = 3, // ┏┓┗┛━┃
    wavy = 4, // ╭╮╰╯~│
    dotted = 5, // ····
    dashed = 6, // ┌┐└┘╌╎
    stars = 7, // ******
    ascii = 8, // ++-|
    none = 9, // no border
};
pub const BORDER_STYLE_COUNT: u8 = 10;
pub const BORDER_STYLE_NAMES = [BORDER_STYLE_COUNT][]const u8{
    "Rounded", "Single", "Double", "Heavy", "Wavy",
    "Dotted",  "Dashed", "Stars",  "ASCII", "None",
};

// Border character sets:
//   [0] top-left corner     [1] top-right corner
//   [2] bottom-left corner  [3] bottom-right corner
//   [4] horizontal          [5] vertical
//   [6] left-T ├            [7] right-T ┤
//   [8] top-T ┬             [9] bottom-T ┴
//   [10] cross ┼
// Index matches BorderStyle enum value.
pub const BORDER_CHARS = [BORDER_STYLE_COUNT][11]u32{
    //                    TL      TR      BL      BR      H       V       ├       ┤       ┬       ┴       ┼
    .{ 0x256D, 0x256E, 0x2570, 0x256F, 0x2500, 0x2502, 0x251C, 0x2524, 0x252C, 0x2534, 0x253C }, // rounded ╭╮╰╯─│├┤┬┴┼
    .{ 0x250C, 0x2510, 0x2514, 0x2518, 0x2500, 0x2502, 0x251C, 0x2524, 0x252C, 0x2534, 0x253C }, // single  ┌┐└┘─│├┤┬┴┼
    .{ 0x2554, 0x2557, 0x255A, 0x255D, 0x2550, 0x2551, 0x2560, 0x2563, 0x2566, 0x2569, 0x256C }, // double  ╔╗╚╝═║╠╣╦╩╬
    .{ 0x250F, 0x2513, 0x2517, 0x251B, 0x2501, 0x2503, 0x2523, 0x252B, 0x2533, 0x253B, 0x254B }, // heavy   ┏┓┗┛━┃┣┫┳┻╋
    .{ 0x256D, 0x256E, 0x2570, 0x256F, 0x007E, 0x2502, 0x251C, 0x2524, 0x252C, 0x2534, 0x253C }, // wavy    ╭╮╰╯~│├┤┬┴┼
    .{ 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7, 0x00B7 }, // dotted  ···········
    .{ 0x250C, 0x2510, 0x2514, 0x2518, 0x254C, 0x254E, 0x251C, 0x2524, 0x252C, 0x2534, 0x253C }, // dashed  ┌┐└┘╌╎├┤┬┴┼
    .{ 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A, 0x002A }, // stars   ***********
    .{ 0x002B, 0x002B, 0x002B, 0x002B, 0x002D, 0x007C, 0x002B, 0x002B, 0x002B, 0x002B, 0x002B }, // ascii   ++--||+++++
    .{ 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020, 0x0020 }, // none    (spaces)
};

/// Border weight families for determining junction character compatibility.
/// Styles within the same family use matching line weights and share junction chars.
pub const BorderWeight = enum(u8) {
    light = 0, // rounded, single, wavy, dashed — all use ─│ (U+2500/U+2502)
    heavy = 1, // heavy — uses ━┃ (U+2501/U+2503)
    double = 2, // double — uses ═║ (U+2550/U+2551)
    special = 3, // dotted, stars, ascii, none — no structured junctions
};

/// Map a BorderStyle to its weight family for junction resolution.
pub fn borderWeight(style: BorderStyle) BorderWeight {
    return switch (style) {
        .rounded, .single, .wavy, .dashed => .light,
        .heavy => .heavy,
        .double => .double,
        .dotted, .stars, .ascii, .none => .special,
    };
}

/// Resolve a junction character given the weight of each individual arm.
///
/// Unicode box-drawing has full per-arm mixed chars for light↔heavy transitions.
/// For light↔double, only uniform-axis chars exist (up+down share weight, left+right share weight).
/// When double is involved and arms on the same axis differ, we fall back to the heavier weight.
///
/// Junction types and arm mapping:
///   ├ [6]: up + down + right     (no left arm)
///   ┤ [7]: up + down + left      (no right arm)
///   ┬ [8]: left + right + down   (no up arm)
///   ┴ [9]: left + right + up     (no down arm)
///   ┼ [10]: up + down + left + right
///
/// For T-junctions, the missing arm's weight is ignored (pass .light or same as its opposite).
pub fn resolveJunction(up: BorderWeight, down: BorderWeight, left: BorderWeight, right: BorderWeight, junction: u8) u32 {
    const u = if (up == .special) BorderWeight.light else up;
    const d = if (down == .special) BorderWeight.light else down;
    const l = if (left == .special) BorderWeight.light else left;
    const r = if (right == .special) BorderWeight.light else right;

    if (u == .double or d == .double or l == .double or r == .double) {
        const v_w: BorderWeight = if (u == .double or d == .double) .double else if (u == .heavy or d == .heavy) .heavy else .light;
        const h_w: BorderWeight = if (l == .double or r == .double) .double else if (l == .heavy or r == .heavy) .heavy else .light;
        return resolveAxisJunction(h_w, v_w, junction);
    }

    return resolveHeavyLightJunction(u, d, l, r, junction);
}

fn resolveAxisJunction(h_weight: BorderWeight, v_weight: BorderWeight, junction: u8) u32 {
    const hw: BorderWeight = if (h_weight == .special) .light else h_weight;
    const vw: BorderWeight = if (v_weight == .special) .light else v_weight;

    if (hw == vw) {
        return switch (hw) {
            .light => BORDER_CHARS[@intFromEnum(BorderStyle.single)][junction],
            .heavy => BORDER_CHARS[@intFromEnum(BorderStyle.heavy)][junction],
            .double => BORDER_CHARS[@intFromEnum(BorderStyle.double)][junction],
            .special => BORDER_CHARS[@intFromEnum(BorderStyle.single)][junction],
        };
    }

    const idx = junction - 6; // 0=├, 1=┤, 2=┬, 3=┴, 4=┼

    if (hw == .light and vw == .double) {
        return ([5]u32{ 0x255E, 0x2561, 0x2565, 0x2568, 0x256B })[idx];
    }
    if (hw == .double and vw == .light) {
        return ([5]u32{ 0x255F, 0x2562, 0x2564, 0x2567, 0x256A })[idx];
    }
    if (hw == .light and vw == .heavy) {
        return ([5]u32{ 0x251E, 0x2526, 0x2530, 0x2538, 0x2542 })[idx];
    }
    if (hw == .heavy and vw == .light) {
        return ([5]u32{ 0x251D, 0x2525, 0x252F, 0x2537, 0x253F })[idx];
    }
    return BORDER_CHARS[@intFromEnum(BorderStyle.single)][junction];
}

fn resolveHeavyLightJunction(up: BorderWeight, down: BorderWeight, left: BorderWeight, right: BorderWeight, junction: u8) u32 {
    const uh: u1 = if (up == .heavy) 1 else 0;
    const dh: u1 = if (down == .heavy) 1 else 0;
    const lh: u1 = if (left == .heavy) 1 else 0;
    const rh: u1 = if (right == .heavy) 1 else 0;

    return switch (junction) {
        6 => { // ├: up, down, right
            const idx: u3 = @as(u3, uh) << 2 | @as(u3, dh) << 1 | @as(u3, rh);
            return ([8]u32{ 0x251C, 0x251D, 0x251F, 0x2522, 0x251E, 0x2521, 0x2520, 0x2523 })[idx];
        },
        7 => { // ┤: up, down, left
            const idx: u3 = @as(u3, uh) << 2 | @as(u3, dh) << 1 | @as(u3, lh);
            return ([8]u32{ 0x2524, 0x2525, 0x2527, 0x252A, 0x2526, 0x2529, 0x2528, 0x252B })[idx];
        },
        8 => { // ┬: left, right, down
            const idx: u3 = @as(u3, lh) << 2 | @as(u3, rh) << 1 | @as(u3, dh);
            return ([8]u32{ 0x252C, 0x2530, 0x252E, 0x2532, 0x252D, 0x2531, 0x252F, 0x2533 })[idx];
        },
        9 => { // ┴: left, right, up
            const idx: u3 = @as(u3, lh) << 2 | @as(u3, rh) << 1 | @as(u3, uh);
            return ([8]u32{ 0x2534, 0x2538, 0x2536, 0x253A, 0x2535, 0x2539, 0x2537, 0x253B })[idx];
        },
        10 => { // ┼: up, down, left, right
            const idx: u4 = @as(u4, uh) << 3 | @as(u4, dh) << 2 | @as(u4, lh) << 1 | @as(u4, rh);
            return ([16]u32{
                0x253C, 0x253E, 0x253D, 0x253F,
                0x2541, 0x2546, 0x2545, 0x2548,
                0x2540, 0x2544, 0x2543, 0x2547,
                0x2542, 0x254A, 0x2549, 0x254B,
            })[idx];
        },
        else => BORDER_CHARS[@intFromEnum(BorderStyle.single)][junction],
    };
}

/// Draw a bordered box with a configurable border style and title.
pub fn drawStyledBorderBox(
    buf: *OptimizedBuffer,
    x: u16,
    y: u16,
    w: u16,
    h: u16,
    border_color: RGBA,
    bg_color: RGBA,
    title: ?[]const u8,
    title_color: RGBA,
    style: BorderStyle,
) void {
    if (w < 2 or h < 2) return;

    const ux: u32 = @intCast(x);
    const uy: u32 = @intCast(y);
    const uw: u32 = @intCast(w);
    const uh: u32 = @intCast(h);
    const chars = BORDER_CHARS[@intFromEnum(style)];

    buf.fillRect(ux, uy, uw, uh, bg_color) catch {};

    buf.drawChar(chars[0], ux, uy, border_color, bg_color, 0) catch {};
    buf.drawChar(chars[1], ux + uw - 1, uy, border_color, bg_color, 0) catch {};
    buf.drawChar(chars[2], ux, uy + uh - 1, border_color, bg_color, 0) catch {};
    buf.drawChar(chars[3], ux + uw - 1, uy + uh - 1, border_color, bg_color, 0) catch {};

    var i: u32 = 1;
    while (i < uw - 1) : (i += 1) {
        buf.drawChar(chars[4], ux + i, uy, border_color, bg_color, 0) catch {};
        buf.drawChar(chars[4], ux + i, uy + uh - 1, border_color, bg_color, 0) catch {};
    }

    i = 1;
    while (i < uh - 1) : (i += 1) {
        buf.drawChar(chars[5], ux, uy + i, border_color, bg_color, 0) catch {};
        buf.drawChar(chars[5], ux + uw - 1, uy + i, border_color, bg_color, 0) catch {};
    }

    if (title) |t| {
        if (t.len > 0 and w > 4) {
            const max_title = @min(t.len, @as(usize, w - 4));
            buf.drawText(t[0..max_title], ux + 2, uy, title_color, bg_color, 0) catch {};
        }
    }
}

/// Draw a bordered box with the default rounded style.
pub fn drawBorderBox(
    buf: *OptimizedBuffer,
    x: u16,
    y: u16,
    w: u16,
    h: u16,
    border_color: RGBA,
    bg_color: RGBA,
    title: ?[]const u8,
    title_color: RGBA,
) void {
    drawStyledBorderBox(buf, x, y, w, h, border_color, bg_color, title, title_color, .rounded);
}

/// Draw a bordered box with shared-edge awareness. The caller passes a
/// SharedEdgeInfo precomputed by layout.computeSharedEdgeInfo, which tells
/// us which pixels on each edge are "shared" with a neighbor (and which
/// panel is "primary" — the one that draws the merged line).
pub fn drawSharedBorderBox(
    buf: *OptimizedBuffer,
    x: u16,
    y: u16,
    w: u16,
    h: u16,
    border_color: RGBA,
    bg_color: RGBA,
    title: ?[]const u8,
    title_color: RGBA,
    style: BorderStyle,
    sei: *const shared_edge.SharedEdgeInfo,
) void {
    if (w < 2 or h < 2) return;

    const ux: u32 = @intCast(x);
    const uy: u32 = @intCast(y);
    const uw: u32 = @intCast(w);
    const uh: u32 = @intCast(h);
    const chars = BORDER_CHARS[@intFromEnum(style)];
    const bot_y: u32 = uy + uh - 1;
    const right_x: u32 = ux + uw - 1;

    // Fill background — only the interior (not border cells). Prevents
    // overwriting neighbor panels' borders when this panel has been extended
    // by 1 for shared edge overlap.
    if (uw > 2 and uh > 2) {
        buf.fillRect(ux + 1, uy + 1, uw - 2, uh - 2, bg_color) catch {};
    }

    // --- Corners --- each checks two edges; pick junction by alignment with neighbor.
    {
        const top_s = sei.isTopShared(@intCast(ux));
        const left_s = sei.isLeftShared(@intCast(uy));
        const top_p = sei.isTopPrimary(@intCast(ux));
        const left_p = sei.isLeftPrimary(@intCast(uy));
        if (top_s and left_s) {
            buf.drawChar(chars[10], ux, uy, border_color, bg_color, 0) catch {};
        } else if (top_s) {
            if (top_p) {
                buf.drawChar(chars[0], ux, uy, border_color, bg_color, 0) catch {};
            } else if (sei.topNeighborStartsAt(@intCast(ux))) {
                buf.drawChar(chars[6], ux, uy, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[8], ux, uy, border_color, bg_color, 0) catch {};
            }
        } else if (left_s) {
            if (left_p) {
                buf.drawChar(chars[0], ux, uy, border_color, bg_color, 0) catch {};
            } else if (sei.leftNeighborStartsAt(@intCast(uy))) {
                buf.drawChar(chars[8], ux, uy, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[6], ux, uy, border_color, bg_color, 0) catch {};
            }
        } else {
            buf.drawChar(chars[0], ux, uy, border_color, bg_color, 0) catch {};
        }
    }

    if (uw > 1) {
        const top_s = sei.isTopShared(@intCast(right_x));
        const right_s = sei.isRightShared(@intCast(uy));
        const top_p = sei.isTopPrimary(@intCast(right_x));
        const right_p = sei.isRightPrimary(@intCast(uy));
        if (top_s and right_s) {
            buf.drawChar(chars[10], right_x, uy, border_color, bg_color, 0) catch {};
        } else if (top_s) {
            if (top_p) {
                buf.drawChar(chars[1], right_x, uy, border_color, bg_color, 0) catch {};
            } else if (sei.topNeighborEndsAt(@intCast(right_x))) {
                buf.drawChar(chars[7], right_x, uy, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[8], right_x, uy, border_color, bg_color, 0) catch {};
            }
        } else if (right_s) {
            if (right_p) {
                buf.drawChar(chars[1], right_x, uy, border_color, bg_color, 0) catch {};
            } else if (sei.rightNeighborStartsAt(@intCast(uy))) {
                buf.drawChar(chars[8], right_x, uy, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[7], right_x, uy, border_color, bg_color, 0) catch {};
            }
        } else {
            buf.drawChar(chars[1], right_x, uy, border_color, bg_color, 0) catch {};
        }
    }

    {
        const bot_s = sei.isBottomShared(@intCast(ux));
        const left_s = sei.isLeftShared(@intCast(bot_y));
        const bot_p = sei.isBottomPrimary(@intCast(ux));
        const left_p = sei.isLeftPrimary(@intCast(bot_y));
        if (bot_s and left_s) {
            buf.drawChar(chars[10], ux, bot_y, border_color, bg_color, 0) catch {};
        } else if (bot_s) {
            if (bot_p) {
                if (sei.bottomNeighborStartsAt(@intCast(ux))) {
                    buf.drawChar(chars[6], ux, bot_y, border_color, bg_color, 0) catch {};
                } else {
                    buf.drawChar(chars[9], ux, bot_y, border_color, bg_color, 0) catch {};
                }
            } else {
                buf.drawChar(chars[2], ux, bot_y, border_color, bg_color, 0) catch {};
            }
        } else if (left_s) {
            if (left_p) {
                buf.drawChar(chars[2], ux, bot_y, border_color, bg_color, 0) catch {};
            } else if (sei.leftNeighborEndsAt(@intCast(bot_y))) {
                buf.drawChar(chars[9], ux, bot_y, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[6], ux, bot_y, border_color, bg_color, 0) catch {};
            }
        } else {
            buf.drawChar(chars[2], ux, bot_y, border_color, bg_color, 0) catch {};
        }
    }

    if (uw > 1) {
        const bot_s = sei.isBottomShared(@intCast(right_x));
        const right_s = sei.isRightShared(@intCast(bot_y));
        const bot_p = sei.isBottomPrimary(@intCast(right_x));
        const right_p = sei.isRightPrimary(@intCast(bot_y));
        if (bot_s and right_s) {
            buf.drawChar(chars[10], right_x, bot_y, border_color, bg_color, 0) catch {};
        } else if (bot_s) {
            if (bot_p) {
                if (sei.bottomNeighborEndsAt(@intCast(right_x))) {
                    buf.drawChar(chars[7], right_x, bot_y, border_color, bg_color, 0) catch {};
                } else {
                    buf.drawChar(chars[9], right_x, bot_y, border_color, bg_color, 0) catch {};
                }
            } else {
                buf.drawChar(chars[3], right_x, bot_y, border_color, bg_color, 0) catch {};
            }
        } else if (right_s) {
            if (right_p) {
                buf.drawChar(chars[3], right_x, bot_y, border_color, bg_color, 0) catch {};
            } else if (sei.rightNeighborEndsAt(@intCast(bot_y))) {
                buf.drawChar(chars[9], right_x, bot_y, border_color, bg_color, 0) catch {};
            } else {
                buf.drawChar(chars[7], right_x, bot_y, border_color, bg_color, 0) catch {};
            }
        } else {
            buf.drawChar(chars[3], right_x, bot_y, border_color, bg_color, 0) catch {};
        }
    }

    // --- Top edge interior ---
    {
        var i: u32 = 1;
        while (i < uw - 1) : (i += 1) {
            const px: u16 = @intCast(ux + i);
            if (sei.isTopShared(px) and !sei.isTopPrimary(px)) continue;
            buf.drawChar(chars[4], ux + i, uy, border_color, bg_color, 0) catch {};
        }
    }

    // --- Bottom edge interior --- primary draws ─, with junctions at neighbor transitions.
    {
        var i: u32 = 1;
        while (i < uw - 1) : (i += 1) {
            const px: u16 = @intCast(ux + i);
            const cur_shared = sei.isBottomShared(px);
            if (cur_shared and !sei.isBottomPrimary(px)) continue;

            if (cur_shared) {
                const prev_shared = sei.isBottomShared(px - 1);
                const next_shared = if (px + 1 < x + w) sei.isBottomShared(px + 1) else false;
                if (!prev_shared or !next_shared) {
                    buf.drawChar(chars[8], ux + i, bot_y, border_color, bg_color, 0) catch {};
                    continue;
                }
            }
            buf.drawChar(chars[4], ux + i, bot_y, border_color, bg_color, 0) catch {};
        }
    }

    // --- Left edge interior ---
    {
        var i: u32 = 1;
        while (i < uh - 1) : (i += 1) {
            const py: u16 = @intCast(uy + i);
            if (sei.isLeftShared(py) and !sei.isLeftPrimary(py)) continue;

            const cur_shared = sei.isLeftShared(py);
            if (cur_shared) {
                const prev_shared = sei.isLeftShared(py - 1);
                const next_shared = if (py + 1 < y + h) sei.isLeftShared(py + 1) else false;
                if (!prev_shared or !next_shared) {
                    buf.drawChar(chars[7], ux, uy + i, border_color, bg_color, 0) catch {};
                    continue;
                }
            }
            buf.drawChar(chars[5], ux, uy + i, border_color, bg_color, 0) catch {};
        }
    }

    // --- Right edge interior ---
    {
        var i: u32 = 1;
        while (i < uh - 1) : (i += 1) {
            const py: u16 = @intCast(uy + i);
            if (sei.isRightShared(py) and !sei.isRightPrimary(py)) continue;

            const cur_shared = sei.isRightShared(py);
            if (cur_shared) {
                const prev_shared = sei.isRightShared(py - 1);
                const next_shared = if (py + 1 < y + h) sei.isRightShared(py + 1) else false;
                if (!prev_shared or !next_shared) {
                    buf.drawChar(chars[6], right_x, uy + i, border_color, bg_color, 0) catch {};
                    continue;
                }
            }
            buf.drawChar(chars[5], right_x, uy + i, border_color, bg_color, 0) catch {};
        }
    }

    if (title) |t| {
        if (t.len > 0 and w > 4) {
            const max_title = @min(t.len, @as(usize, w - 4));
            buf.drawText(t[0..max_title], ux + 2, uy, title_color, bg_color, 0) catch {};
        }
    }
}
