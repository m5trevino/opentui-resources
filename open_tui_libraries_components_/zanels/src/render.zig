// zanels/render.zig — Multi-panel rendering: per-panel borders with
// shared-edge junction awareness, plus a two-pass dispatch helper that
// invokes a user callback for content rendering.
const std = @import("std");
const opentui = @import("opentui");
const panel_mod = @import("panel.zig");
const border = @import("border.zig");
const shared_edge = @import("shared_edge.zig");
const theme_mod = @import("theme.zig");

pub const OptimizedBuffer = opentui.OptimizedBuffer;
pub const RGBA = opentui.RGBA;
const Panel = panel_mod.Panel;
const SharedEdge = shared_edge.SharedEdge;
const Theme = theme_mod.Theme;

/// Vtable-style context the renderer needs from its host. Keeps the
/// library decoupled from any concrete app type.
///
/// All callbacks are passed the same opaque `ctx` you set on the struct.
/// Cast it back to your app type with `@ptrCast(@alignCast(ctx))`.
pub const RenderContext = struct {
    ctx: *const anyopaque,
    isFocused: *const fn (ctx: *const anyopaque, panel: *const Panel) bool,
    themeForPanel: *const fn (ctx: *const anyopaque, panel: *const Panel) *const Theme,
    /// How many panels share this panel's grid slot (i.e., are stacked).
    /// Return 1 if not stacked. The renderer draws a `[1/2]` indicator
    /// when this returns >1.
    stackCount: *const fn (ctx: *const anyopaque, panel_idx: u8) u8,
    /// 1-based position within the stack (1 = bottom). Only consulted
    /// when stackCount > 1.
    stackPosition: *const fn (ctx: *const anyopaque, panel_idx: u8) u8,
};

/// Per-panel content callback. Called once for each visible panel after
/// borders have been drawn. Implement your `switch (panel.kind)` here.
pub const RenderContentFn = *const fn (
    ctx: *const anyopaque,
    panel: *const Panel,
    buf: *OptimizedBuffer,
    focused: bool,
) void;

/// Inputs to the high-level renderAll pass.
pub const RenderOptions = struct {
    panels: []const Panel,
    panel_count: u8,
    shared_edges: []const SharedEdge,
    shared_edge_count: u8,
    rctx: RenderContext,
    /// Called for each visible panel after borders are drawn. Use it to
    /// render whatever lives inside the panel.
    render_content: RenderContentFn,
    /// `ctx` for the content callback. Often the same pointer as
    /// `rctx.ctx`, but allowed to differ.
    content_ctx: *const anyopaque,
};

/// Two-pass render: borders + shared-edge junctions first, then per-panel
/// content via the user callback. The callback is invoked for visible
/// panels only and skips panels with `kind == 0xFF` (reserved sentinel).
pub fn renderAll(buf: *OptimizedBuffer, opts: RenderOptions) void {
    drawAllBorders(buf, opts.panels, opts.panel_count, opts.shared_edges, opts.shared_edge_count, opts.rctx);

    for (opts.panels[0..opts.panel_count]) |*p| {
        if (!p.visible) continue;
        const focused = opts.rctx.isFocused(opts.rctx.ctx, p);
        opts.render_content(opts.content_ctx, p, buf, focused);
    }
}

/// Draw all panel borders: pass 1 fills backgrounds and draws each
/// panel's normal border; pass 2 (drawSharedEdges) overwrites adjacent
/// border rows/cols with merged lines and junction characters. A small
/// stack indicator `[1/2]` is drawn at the top-right of any panel that
/// is part of a stack.
pub fn drawAllBorders(
    buf: *OptimizedBuffer,
    panels: []const Panel,
    count: u8,
    shared_edges: []const SharedEdge,
    shared_count: u8,
    rctx: RenderContext,
) void {
    for (panels[0..count]) |*p| {
        if (!p.visible) continue;
        const focused = rctx.isFocused(rctx.ctx, p);
        const ps = p.style;
        const t = rctx.themeForPanel(rctx.ctx, p);

        const default_border = if (focused) t.border_active else t.border;
        const border_color = if (focused and ps.focus_border_color_idx != 0)
            panel_mod.resolveStyleColor(ps.focus_border_color_idx, t.border_active)
        else
            panel_mod.resolveStyleColor(ps.border_color_idx, default_border);
        const bg_color = panel_mod.resolveStyleColor(ps.bg_color_idx, t.background);
        const custom_title: ?[]const u8 = if (ps.title_len > 0) ps.title[0..ps.title_len] else null;

        border.drawStyledBorderBox(
            buf,
            p.x,
            p.y,
            p.width,
            p.height,
            border_color,
            bg_color,
            custom_title,
            t.text,
            ps.border_style,
        );
    }

    // Stack indicators
    for (panels[0..count], 0..) |*p, pi| {
        if (!p.visible) continue;
        const sc = rctx.stackCount(rctx.ctx, @intCast(pi));
        if (sc <= 1) continue;
        const sp = rctx.stackPosition(rctx.ctx, @intCast(pi));
        const t = rctx.themeForPanel(rctx.ctx, p);

        var indicator: [8]u8 = undefined;
        var ipos: usize = 0;
        indicator[ipos] = '[';
        ipos += 1;
        ipos += writeU8Buf(indicator[ipos..], sp);
        indicator[ipos] = '/';
        ipos += 1;
        ipos += writeU8Buf(indicator[ipos..], sc);
        indicator[ipos] = ']';
        ipos += 1;

        const px: u32 = @as(u32, p.x) + @as(u32, p.width) -| (@as(u32, @intCast(ipos)) + 1);
        buf.drawText(indicator[0..ipos], px, @intCast(p.y), t.text_dim, t.background, 0) catch {};
    }

    drawSharedEdges(buf, panels, count, shared_edges, shared_count, rctx);
}

/// Draw shared edges as a second pass: for each shared edge, overwrite
/// the merged border line on the row/column between the two panels with
/// the right junction characters at the ends.
pub fn drawSharedEdges(
    buf: *OptimizedBuffer,
    panels: []const Panel,
    count: u8,
    shared_edges: []const SharedEdge,
    shared_count: u8,
    rctx: RenderContext,
) void {
    for (shared_edges[0..shared_count]) |se| {
        if (se.panel_a >= count or se.panel_b >= count) continue;
        const a = &panels[se.panel_a];
        const b = &panels[se.panel_b];
        if (!a.visible or !b.visible) continue;

        const edge_style = se.resolvedStyle(a.style.border_style, b.style.border_style);
        const edge_w = border.borderWeight(edge_style);
        const chars = border.BORDER_CHARS[@intFromEnum(edge_style)];

        const a_w = border.borderWeight(a.style.border_style);
        const b_w = border.borderWeight(b.style.border_style);

        const a_theme = rctx.themeForPanel(rctx.ctx, a);
        const b_theme = rctx.themeForPanel(rctx.ctx, b);
        const a_focused = rctx.isFocused(rctx.ctx, a);
        const b_focused = rctx.isFocused(rctx.ctx, b);
        const base_theme = if (a.group <= b.group) a_theme else b_theme;
        const edge_theme = if (a_focused) a_theme else if (b_focused) b_theme else base_theme;
        const border_color = if (a_focused or b_focused) edge_theme.border_active else edge_theme.border;
        const bg_color = edge_theme.background;

        switch (se.orientation) {
            .horizontal => {
                var above: *const Panel = undefined;
                var below: *const Panel = undefined;
                var above_w: border.BorderWeight = undefined;
                var below_w: border.BorderWeight = undefined;
                if (a.row + a.row_span == b.row) {
                    above = a;
                    below = b;
                    above_w = a_w;
                    below_w = b_w;
                } else if (b.row + b.row_span == a.row) {
                    above = b;
                    below = a;
                    above_w = b_w;
                    below_w = a_w;
                } else continue;

                const line_y: u32 = @as(u32, above.y) + @as(u32, above.height) - 1;
                const ox_start = @max(above.x, below.x);
                const ox_end = @min(above.x + above.width, below.x + below.width);
                if (ox_start >= ox_end) continue;

                var px: u16 = ox_start;
                while (px < ox_end) : (px += 1) {
                    const ux: u32 = @intCast(px);
                    const at_above_left = (px == above.x);
                    const at_above_right = (px == above.x + above.width - 1);
                    const at_below_left = (px == below.x);
                    const at_below_right = (px == below.x + below.width - 1);

                    const left_cols_match = (above.x == below.x);
                    const right_cols_match = (above.x + above.width == below.x + below.width);

                    if ((at_above_left or at_below_left) and left_cols_match) {
                        buf.drawChar(border.resolveJunction(above_w, below_w, edge_w, edge_w, 6), ux, line_y, border_color, bg_color, 0) catch {};
                    } else if ((at_above_right or at_below_right) and right_cols_match) {
                        buf.drawChar(border.resolveJunction(above_w, below_w, edge_w, edge_w, 7), ux, line_y, border_color, bg_color, 0) catch {};
                    } else if (at_below_left or at_below_right) {
                        buf.drawChar(border.resolveJunction(edge_w, below_w, edge_w, edge_w, 8), ux, line_y, border_color, bg_color, 0) catch {};
                    } else if (at_above_left or at_above_right) {
                        buf.drawChar(border.resolveJunction(above_w, edge_w, edge_w, edge_w, 9), ux, line_y, border_color, bg_color, 0) catch {};
                    } else {
                        buf.drawChar(chars[4], ux, line_y, border_color, bg_color, 0) catch {};
                    }
                }

                // Below-panel's top border row needs a bit of cleanup if it
                // sits one row away from the merged line.
                const below_top_y: u32 = @intCast(below.y);
                if (below_top_y != line_y) {
                    px = ox_start;
                    while (px < ox_end) : (px += 1) {
                        const ux: u32 = @intCast(px);
                        const at_below_left = (px == below.x);
                        const at_below_right = (px == below.x + below.width - 1);
                        if (at_below_left or at_below_right) {
                            const below_chars = border.BORDER_CHARS[@intFromEnum(below.style.border_style)];
                            const corner_char = if (at_below_left) below_chars[0] else below_chars[1];
                            buf.drawChar(corner_char, ux, below_top_y, border_color, bg_color, 0) catch {};
                        } else {
                            buf.drawChar(' ', ux, below_top_y, border_color, bg_color, 0) catch {};
                        }
                    }
                }
            },
            .vertical => {
                var left_p: *const Panel = undefined;
                var right_p: *const Panel = undefined;
                var left_w: border.BorderWeight = undefined;
                var right_w: border.BorderWeight = undefined;
                if (a.col + a.col_span == b.col) {
                    left_p = a;
                    right_p = b;
                    left_w = a_w;
                    right_w = b_w;
                } else if (b.col + b.col_span == a.col) {
                    left_p = b;
                    right_p = a;
                    left_w = b_w;
                    right_w = a_w;
                } else continue;

                const line_x: u32 = @as(u32, left_p.x) + @as(u32, left_p.width) - 1;
                const oy_start = @max(left_p.y, right_p.y);
                const oy_end = @min(left_p.y + left_p.height, right_p.y + right_p.height);
                if (oy_start >= oy_end) continue;

                const top_rows_match = (left_p.y == right_p.y);
                const bot_rows_match = (left_p.y + left_p.height == right_p.y + right_p.height);

                var py: u16 = oy_start;
                while (py < oy_end) : (py += 1) {
                    const uy_val: u32 = @intCast(py);
                    const at_left_top = (py == left_p.y);
                    const at_left_bot = (py == left_p.y + left_p.height - 1);
                    const at_right_top = (py == right_p.y);
                    const at_right_bot = (py == right_p.y + right_p.height - 1);

                    if ((at_left_top or at_right_top) and top_rows_match) {
                        buf.drawChar(border.resolveJunction(edge_w, edge_w, left_w, right_w, 8), line_x, uy_val, border_color, bg_color, 0) catch {};
                    } else if ((at_left_bot or at_right_bot) and bot_rows_match) {
                        buf.drawChar(border.resolveJunction(edge_w, edge_w, left_w, right_w, 9), line_x, uy_val, border_color, bg_color, 0) catch {};
                    } else if (at_right_top or at_right_bot) {
                        buf.drawChar(border.resolveJunction(edge_w, edge_w, edge_w, right_w, 6), line_x, uy_val, border_color, bg_color, 0) catch {};
                    } else if (at_left_top or at_left_bot) {
                        buf.drawChar(border.resolveJunction(edge_w, edge_w, left_w, edge_w, 7), line_x, uy_val, border_color, bg_color, 0) catch {};
                    } else {
                        buf.drawChar(chars[5], line_x, uy_val, border_color, bg_color, 0) catch {};
                    }
                }

                const right_left_x: u32 = @intCast(right_p.x);
                if (right_left_x != line_x) {
                    py = oy_start;
                    while (py < oy_end) : (py += 1) {
                        const uy_val: u32 = @intCast(py);
                        const at_right_top = (py == right_p.y);
                        const at_right_bot = (py == right_p.y + right_p.height - 1);
                        if (at_right_top or at_right_bot) {
                            const right_chars = border.BORDER_CHARS[@intFromEnum(right_p.style.border_style)];
                            const corner_char = if (at_right_top) right_chars[0] else right_chars[2];
                            buf.drawChar(corner_char, right_left_x, uy_val, border_color, bg_color, 0) catch {};
                        } else {
                            buf.drawChar(' ', right_left_x, uy_val, border_color, bg_color, 0) catch {};
                        }
                    }
                }
            },
        }
    }
}

fn writeU8Buf(buf: []u8, value: u8) usize {
    if (value >= 10) {
        buf[0] = '0' + value / 10;
        buf[1] = '0' + value % 10;
        return 2;
    }
    buf[0] = '0' + value;
    return 1;
}
