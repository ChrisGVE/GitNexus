const std = @import("std");
const math = @import("math.zig");
const utils = @import("utils.zig");

pub fn main() void {
    const result: i32 = math.add(3, 4);
    const msg = utils.greet("world");
    std.debug.print("{d} {s}\n", .{ result, msg });
}
