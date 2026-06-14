// zanels/shared_edge.zig — Shared edge representation and per-panel
// suppression info. A "shared edge" is a boundary between two adjacent
// panels where their borders should merge into a single line with proper
// junction characters at the ends.
const border = @import("border.zig");

pub const BorderStyle = border.BorderStyle;

/// A pixel range on one side of a panel where the border is shared with a neighbor.
pub const SharedRange = struct {
    start: u16, // inclusive pixel coordinate (x for top/bottom, y for left/right)
    end: u16, // exclusive pixel coordinate
    neighbor_start: u16, // neighbor's full start on this axis (x for horiz, y for vert)
    neighbor_end: u16, // neighbor's full end on this axis
    is_primary: bool, // true = this panel is the "first" (top/left) and draws the shared line
};

/// Maximum shared ranges per side per panel (e.g., a panel could share its bottom
/// with up to 4 different neighbors at different column positions).
pub const MAX_SHARED_RANGES_PER_SIDE: u8 = 8;

/// Computed shared-edge suppression info for a panel. Stores pixel-level ranges
/// on each side where the border should be suppressed and which panel is primary.
pub const SharedEdgeInfo = struct {
    top: [MAX_SHARED_RANGES_PER_SIDE]SharedRange = undefined,
    top_count: u8 = 0,
    bottom: [MAX_SHARED_RANGES_PER_SIDE]SharedRange = undefined,
    bottom_count: u8 = 0,
    left: [MAX_SHARED_RANGES_PER_SIDE]SharedRange = undefined,
    left_count: u8 = 0,
    right: [MAX_SHARED_RANGES_PER_SIDE]SharedRange = undefined,
    right_count: u8 = 0,

    pub fn any(self: *const SharedEdgeInfo) bool {
        return self.top_count > 0 or self.bottom_count > 0 or
            self.left_count > 0 or self.right_count > 0;
    }

    pub fn isPrimary(ranges: []const SharedRange, count: u8, coord: u16) bool {
        for (ranges[0..count]) |r| {
            if (coord >= r.start and coord < r.end and r.is_primary) return true;
        }
        return false;
    }

    pub fn isTopPrimary(self: *const SharedEdgeInfo, x: u16) bool {
        return isPrimary(&self.top, self.top_count, x);
    }
    pub fn isBottomPrimary(self: *const SharedEdgeInfo, x: u16) bool {
        return isPrimary(&self.bottom, self.bottom_count, x);
    }
    pub fn isLeftPrimary(self: *const SharedEdgeInfo, y: u16) bool {
        return isPrimary(&self.left, self.left_count, y);
    }
    pub fn isRightPrimary(self: *const SharedEdgeInfo, y: u16) bool {
        return isPrimary(&self.right, self.right_count, y);
    }

    pub fn isShared(ranges: []const SharedRange, count: u8, coord: u16) bool {
        for (ranges[0..count]) |r| {
            if (coord >= r.start and coord < r.end) return true;
        }
        return false;
    }

    pub fn isTopShared(self: *const SharedEdgeInfo, x: u16) bool {
        return isShared(&self.top, self.top_count, x);
    }
    pub fn isBottomShared(self: *const SharedEdgeInfo, x: u16) bool {
        return isShared(&self.bottom, self.bottom_count, x);
    }
    pub fn isLeftShared(self: *const SharedEdgeInfo, y: u16) bool {
        return isShared(&self.left, self.left_count, y);
    }
    pub fn isRightShared(self: *const SharedEdgeInfo, y: u16) bool {
        return isShared(&self.right, self.right_count, y);
    }

    fn neighborStartsAt(ranges: []const SharedRange, count: u8, coord: u16) bool {
        for (ranges[0..count]) |r| {
            if (r.neighbor_start == coord) return true;
        }
        return false;
    }

    fn neighborEndsAt(ranges: []const SharedRange, count: u8, coord: u16) bool {
        for (ranges[0..count]) |r| {
            if (r.neighbor_end > 0 and r.neighbor_end - 1 == coord) return true;
        }
        return false;
    }

    pub fn topNeighborStartsAt(self: *const SharedEdgeInfo, x: u16) bool {
        return neighborStartsAt(&self.top, self.top_count, x);
    }
    pub fn topNeighborEndsAt(self: *const SharedEdgeInfo, x: u16) bool {
        return neighborEndsAt(&self.top, self.top_count, x);
    }
    pub fn bottomNeighborStartsAt(self: *const SharedEdgeInfo, x: u16) bool {
        return neighborStartsAt(&self.bottom, self.bottom_count, x);
    }
    pub fn bottomNeighborEndsAt(self: *const SharedEdgeInfo, x: u16) bool {
        return neighborEndsAt(&self.bottom, self.bottom_count, x);
    }
    pub fn leftNeighborStartsAt(self: *const SharedEdgeInfo, y: u16) bool {
        return neighborStartsAt(&self.left, self.left_count, y);
    }
    pub fn leftNeighborEndsAt(self: *const SharedEdgeInfo, y: u16) bool {
        return neighborEndsAt(&self.left, self.left_count, y);
    }
    pub fn rightNeighborStartsAt(self: *const SharedEdgeInfo, y: u16) bool {
        return neighborStartsAt(&self.right, self.right_count, y);
    }
    pub fn rightNeighborEndsAt(self: *const SharedEdgeInfo, y: u16) bool {
        return neighborEndsAt(&self.right, self.right_count, y);
    }
};

/// A shared edge between two adjacent panels.
/// Stored at the layout level, not per-panel.
pub const SharedEdge = struct {
    panel_a: u8,
    panel_b: u8,
    /// Orientation of the boundary:
    ///   horizontal = panel_a is above panel_b (A's bottom row == B's top row)
    ///   vertical   = panel_a is left of panel_b (A's right col == B's left col)
    orientation: Orientation,
    /// Border style override for this shared edge.
    /// .auto means use the style of panel A if both match, otherwise panel A's style.
    border_style: SharedEdgeBorderStyle = .auto,

    pub const Orientation = enum(u8) {
        horizontal = 0,
        vertical = 1,
    };

    pub const SharedEdgeBorderStyle = enum(u8) {
        auto = 0,
        rounded = 1,
        single = 2,
        double = 3,
        heavy = 4,
        wavy = 5,
        dotted = 6,
        dashed = 7,
        stars = 8,
        ascii = 9,
        none = 10,
    };

    pub const SHARED_EDGE_STYLE_COUNT: u8 = 11;
    pub const SHARED_EDGE_STYLE_NAMES = [SHARED_EDGE_STYLE_COUNT][]const u8{
        "Auto",   "Rounded", "Single", "Double", "Heavy", "Wavy",
        "Dotted", "Dashed",  "Stars",  "ASCII",  "None",
    };

    /// Resolve the border style for this shared edge given both adjacent panels'
    /// border styles. Caller passes the styles directly so SharedEdge has no
    /// dependency on the Panel struct.
    pub fn resolvedStyle(self: *const SharedEdge, a_style: BorderStyle, b_style: BorderStyle) BorderStyle {
        return switch (self.border_style) {
            .auto => if (a_style == b_style) a_style else .single,
            .rounded => .rounded,
            .single => .single,
            .double => .double,
            .heavy => .heavy,
            .wavy => .wavy,
            .dotted => .dotted,
            .dashed => .dashed,
            .stars => .stars,
            .ascii => .ascii,
            .none => .none,
        };
    }
};

pub const MAX_SHARED_EDGES: u8 = 32;

/// A discovered adjacent edge (candidate for sharing).
/// Computed by layout.discoverEdges(), used by edge-picker UIs.
pub const AdjacentEdge = struct {
    panel_a: u8,
    panel_b: u8,
    orientation: SharedEdge.Orientation,
    is_shared: bool, // whether this edge is currently in the shared edges list
};
pub const MAX_ADJACENT_EDGES: u8 = 64;
