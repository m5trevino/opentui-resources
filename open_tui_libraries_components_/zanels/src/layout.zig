// zanels/layout.zig — Grid-based proportional layout engine.
//
// Panels declare grid positions (col, row, col_span, row_span) against a
// virtual grid (default 10×10). computeLayout converts those grid units
// into pixel rects against the actual terminal size. Simple, fast, and
// predictable — no flexbox, no Yoga.
//
// The zero-allocation contract: this module never allocates. Callers own
// the panel slice and the shared-edges slice.
const panel_mod = @import("panel.zig");
const shared_edge = @import("shared_edge.zig");
const Panel = panel_mod.Panel;

pub const DEFAULT_GRID_COLS: u16 = 10;
pub const DEFAULT_GRID_ROWS: u16 = 10;
pub const MIN_GRID: u16 = 2;
pub const MAX_GRID: u16 = 20;

/// Compute pixel positions (x/y/width/height) for all panels based on grid
/// proportions. Call this once per frame after terminal resize.
pub fn computeLayout(
    panels: []Panel,
    term_width: u16,
    term_height: u16,
    grid_cols: u16,
    grid_rows: u16,
) void {
    if (grid_cols == 0 or grid_rows == 0) return;

    for (panels) |*p| {
        if (!p.visible) continue;

        // Proportional positioning with integer division
        p.x = @intCast(@as(u32, p.col) * @as(u32, term_width) / @as(u32, grid_cols));
        p.y = @intCast(@as(u32, p.row) * @as(u32, term_height) / @as(u32, grid_rows));

        // Width/height: compute end position then subtract start
        const end_col = p.col + p.col_span;
        const end_row = p.row + p.row_span;

        const end_x: u16 = @intCast(@as(u32, end_col) * @as(u32, term_width) / @as(u32, grid_cols));
        const end_y: u16 = @intCast(@as(u32, end_row) * @as(u32, term_height) / @as(u32, grid_rows));

        p.width = end_x - p.x;
        p.height = end_y - p.y;
    }
}

/// Check whether two grid rectangles overlap.
pub fn regionOverlaps(
    a_col: u16,
    a_row: u16,
    a_cs: u16,
    a_rs: u16,
    b_col: u16,
    b_row: u16,
    b_cs: u16,
    b_rs: u16,
) bool {
    if (a_col + a_cs <= b_col) return false;
    if (b_col + b_cs <= a_col) return false;
    if (a_row + a_rs <= b_row) return false;
    if (b_row + b_rs <= a_row) return false;
    return true;
}

/// Find which panel index occupies a given grid cell, or null if empty.
/// When multiple panels are stacked at the same cell, returns the one
/// with the highest stack_z (the top of the stack).
pub fn cellOccupant(panels: []const Panel, count: u8, col: u16, row: u16) ?u8 {
    var best: ?u8 = null;
    var best_z: u8 = 0;
    for (panels[0..count], 0..) |*p, i| {
        if (col >= p.col and col < p.col + p.col_span and
            row >= p.row and row < p.row + p.row_span)
        {
            if (best == null or p.stack_z > best_z) {
                best = @intCast(i);
                best_z = p.stack_z;
            }
        }
    }
    return best;
}

/// Check whether placing a panel at the given region would overlap any existing panel.
pub fn hasOverlap(panels: []const Panel, count: u8, col: u16, row: u16, cs: u16, rs: u16) bool {
    for (panels[0..count]) |*p| {
        if (regionOverlaps(col, row, cs, rs, p.col, p.row, p.col_span, p.row_span)) {
            return true;
        }
    }
    return false;
}

fn horizontalOverlap(a: *const Panel, b: *const Panel) bool {
    return a.col < b.col + b.col_span and b.col < a.col + a.col_span;
}

fn verticalOverlap(a: *const Panel, b: *const Panel) bool {
    return a.row < b.row + b.row_span and b.row < a.row + a.row_span;
}

/// Discover all adjacent panel boundaries in a layout. Returns pairs of
/// `(panel_a, panel_b, orientation)` for every place two panels touch.
/// Useful for building "edge picker" UIs that let users opt into shared edges.
pub fn discoverEdges(
    panels: []const Panel,
    count: u8,
    out: []shared_edge.AdjacentEdge,
) u8 {
    var n: u8 = 0;
    var i: u8 = 0;
    while (i < count) : (i += 1) {
        const a = &panels[i];
        if (!a.visible) continue;
        var j: u8 = i + 1;
        while (j < count) : (j += 1) {
            const b = &panels[j];
            if (!b.visible) continue;

            // Horizontal boundary: A's bottom == B's top (or vice versa)
            if (a.row + a.row_span == b.row and horizontalOverlap(a, b)) {
                if (n < out.len) {
                    out[n] = .{ .panel_a = i, .panel_b = j, .orientation = .horizontal, .is_shared = false };
                    n += 1;
                }
            }
            if (b.row + b.row_span == a.row and horizontalOverlap(a, b)) {
                if (n < out.len) {
                    out[n] = .{ .panel_a = i, .panel_b = j, .orientation = .horizontal, .is_shared = false };
                    n += 1;
                }
            }
            // Vertical boundary: A's right == B's left (or vice versa)
            if (a.col + a.col_span == b.col and verticalOverlap(a, b)) {
                if (n < out.len) {
                    out[n] = .{ .panel_a = i, .panel_b = j, .orientation = .vertical, .is_shared = false };
                    n += 1;
                }
            }
            if (b.col + b.col_span == a.col and verticalOverlap(a, b)) {
                if (n < out.len) {
                    out[n] = .{ .panel_a = i, .panel_b = j, .orientation = .vertical, .is_shared = false };
                    n += 1;
                }
            }
        }
    }
    return n;
}

/// Compute per-panel SharedEdgeInfo from the shared-edge list. First
/// adjusts panel positions so shared borders overlap by 1 cell, then
/// computes pixel-level suppression ranges.
///
/// Call after computeLayout when you have shared edges declared.
pub fn computeSharedEdgeInfo(
    panels: []Panel,
    count: u8,
    shared_edges: []const shared_edge.SharedEdge,
    shared_count: u8,
) void {
    for (panels[0..count]) |*p| {
        p.shared_edges = .{};
    }

    // Track which sides of each panel have already been adjusted so that
    // panels participating in multiple shared edges aren't shifted/extended
    // more than once per direction.
    const ADJ_TOP: u8 = 1;
    const ADJ_BOTTOM: u8 = 2;
    const ADJ_LEFT: u8 = 4;
    const ADJ_RIGHT: u8 = 8;
    var adjusted = [_]u8{0} ** panel_mod.MAX_PANELS;

    for (shared_edges[0..shared_count]) |se| {
        if (se.panel_a >= count or se.panel_b >= count) continue;
        switch (se.orientation) {
            .horizontal => {
                const a_ptr = &panels[se.panel_a];
                const b_ptr = &panels[se.panel_b];
                if (a_ptr.row + a_ptr.row_span == b_ptr.row and horizontalOverlap(a_ptr, b_ptr)) {
                    const a_w = a_ptr.width;
                    const b_w = b_ptr.width;
                    if (b_w <= a_w) {
                        if (adjusted[se.panel_b] & ADJ_TOP == 0) {
                            if (b_ptr.y > 0) {
                                b_ptr.y -= 1;
                                b_ptr.height += 1;
                                adjusted[se.panel_b] |= ADJ_TOP;
                            }
                        }
                    } else {
                        if (adjusted[se.panel_a] & ADJ_BOTTOM == 0) {
                            a_ptr.height += 1;
                            adjusted[se.panel_a] |= ADJ_BOTTOM;
                        }
                    }
                } else if (b_ptr.row + b_ptr.row_span == a_ptr.row and horizontalOverlap(a_ptr, b_ptr)) {
                    const a_w = a_ptr.width;
                    const b_w = b_ptr.width;
                    if (a_w <= b_w) {
                        if (adjusted[se.panel_a] & ADJ_TOP == 0) {
                            if (a_ptr.y > 0) {
                                a_ptr.y -= 1;
                                a_ptr.height += 1;
                                adjusted[se.panel_a] |= ADJ_TOP;
                            }
                        }
                    } else {
                        if (adjusted[se.panel_b] & ADJ_BOTTOM == 0) {
                            b_ptr.height += 1;
                            adjusted[se.panel_b] |= ADJ_BOTTOM;
                        }
                    }
                }
            },
            .vertical => {
                const a_ptr = &panels[se.panel_a];
                const b_ptr = &panels[se.panel_b];
                if (a_ptr.col + a_ptr.col_span == b_ptr.col and verticalOverlap(a_ptr, b_ptr)) {
                    const a_h = a_ptr.height;
                    const b_h = b_ptr.height;
                    if (b_h <= a_h) {
                        if (adjusted[se.panel_b] & ADJ_LEFT == 0) {
                            if (b_ptr.x > 0) {
                                b_ptr.x -= 1;
                                b_ptr.width += 1;
                                adjusted[se.panel_b] |= ADJ_LEFT;
                            }
                        }
                    } else {
                        if (adjusted[se.panel_a] & ADJ_RIGHT == 0) {
                            a_ptr.width += 1;
                            adjusted[se.panel_a] |= ADJ_RIGHT;
                        }
                    }
                } else if (b_ptr.col + b_ptr.col_span == a_ptr.col and verticalOverlap(a_ptr, b_ptr)) {
                    const a_h = a_ptr.height;
                    const b_h = b_ptr.height;
                    if (a_h <= b_h) {
                        if (adjusted[se.panel_a] & ADJ_LEFT == 0) {
                            if (a_ptr.x > 0) {
                                a_ptr.x -= 1;
                                a_ptr.width += 1;
                                adjusted[se.panel_a] |= ADJ_LEFT;
                            }
                        }
                    } else {
                        if (adjusted[se.panel_b] & ADJ_RIGHT == 0) {
                            b_ptr.width += 1;
                            adjusted[se.panel_b] |= ADJ_RIGHT;
                        }
                    }
                }
            },
        }
    }

    for (shared_edges[0..shared_count]) |se| {
        if (se.panel_a >= count or se.panel_b >= count) continue;
        const a = &panels[se.panel_a];
        const b = &panels[se.panel_b];
        if (!a.visible or !b.visible) continue;

        switch (se.orientation) {
            .horizontal => {
                var above: *const Panel = undefined;
                var below: *const Panel = undefined;
                var above_idx: u8 = undefined;
                var below_idx: u8 = undefined;
                if (a.row + a.row_span == b.row and horizontalOverlap(a, b)) {
                    above = a;
                    below = b;
                    above_idx = se.panel_a;
                    below_idx = se.panel_b;
                } else if (b.row + b.row_span == a.row and horizontalOverlap(a, b)) {
                    above = b;
                    below = a;
                    above_idx = se.panel_b;
                    below_idx = se.panel_a;
                } else continue;

                const px_start: u16 = @max(above.x, below.x);
                const px_end: u16 = @min(above.x + above.width, below.x + below.width);
                if (px_start >= px_end) continue;

                addRange(&panels[above_idx].shared_edges.bottom, &panels[above_idx].shared_edges.bottom_count, px_start, px_end, below.x, below.x + below.width, true);
                addRange(&panels[below_idx].shared_edges.top, &panels[below_idx].shared_edges.top_count, px_start, px_end, above.x, above.x + above.width, false);
            },
            .vertical => {
                var left_p: *const Panel = undefined;
                var right_p: *const Panel = undefined;
                var left_idx: u8 = undefined;
                var right_idx: u8 = undefined;
                if (a.col + a.col_span == b.col and verticalOverlap(a, b)) {
                    left_p = a;
                    right_p = b;
                    left_idx = se.panel_a;
                    right_idx = se.panel_b;
                } else if (b.col + b.col_span == a.col and verticalOverlap(a, b)) {
                    left_p = b;
                    right_p = a;
                    left_idx = se.panel_b;
                    right_idx = se.panel_a;
                } else continue;

                const py_start: u16 = @max(left_p.y, right_p.y);
                const py_end: u16 = @min(left_p.y + left_p.height, right_p.y + right_p.height);
                if (py_start >= py_end) continue;

                addRange(&panels[left_idx].shared_edges.right, &panels[left_idx].shared_edges.right_count, py_start, py_end, right_p.y, right_p.y + right_p.height, true);
                addRange(&panels[right_idx].shared_edges.left, &panels[right_idx].shared_edges.left_count, py_start, py_end, left_p.y, left_p.y + left_p.height, false);
            },
        }
    }
}

fn addRange(ranges: []shared_edge.SharedRange, count: *u8, start: u16, end: u16, nb_start: u16, nb_end: u16, is_primary: bool) void {
    if (count.* < ranges.len) {
        ranges[count.*] = .{ .start = start, .end = end, .neighbor_start = nb_start, .neighbor_end = nb_end, .is_primary = is_primary };
        count.* += 1;
    }
}

/// Convenience wrapper for callers that don't care about the two-step nature
/// of computeSharedEdgeInfo. Equivalent to calling it directly.
pub fn updateSharedEdges(
    panels: []Panel,
    count: u8,
    shared_edges: []const shared_edge.SharedEdge,
    shared_count: u8,
) void {
    computeSharedEdgeInfo(panels, count, shared_edges, shared_count);
}
