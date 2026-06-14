const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const opentui_dep = b.dependency("opentui", .{
        .target = target,
        .optimize = optimize,
    });
    const opentui_module = opentui_dep.module("opentui");

    // Public Zig consumer surface. Downstream builds reach this via
    // `b.dependency("zanels", .{}).module("zanels")`.
    const zanels_module = b.addModule("zanels", .{
        .root_source_file = b.path("src/panels.zig"),
        .target = target,
        .optimize = optimize,
    });
    zanels_module.addImport("opentui", opentui_module);

    // Unit tests
    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/panels.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    tests.root_module.addImport("opentui", opentui_module);

    const run_tests = b.addRunArtifact(tests);
    const test_step = b.step("test", "Run zanels unit tests");
    test_step.dependOn(&run_tests.step);
}
