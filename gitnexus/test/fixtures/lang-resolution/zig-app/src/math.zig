pub const PI: f64 = 3.14159265358979;

pub fn add(a: i32, b: i32) i32 {
    return a + b;
}

pub fn multiply(a: i32, b: i32) i32 {
    return a * b;
}

fn helper() i32 {
    return 0;
}

test "add works" {
    const result = add(1, 2);
    _ = result;
}
