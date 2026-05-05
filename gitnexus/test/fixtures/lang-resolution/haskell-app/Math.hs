module Math (add, multiply, factorial) where

-- Add two integers
add :: Int -> Int -> Int
add x y = x + y

-- Multiply two integers
multiply :: Int -> Int -> Int
multiply x y = x * y

-- Factorial using recursion
factorial :: Int -> Int
factorial 0 = 1
factorial n = n * factorial (n - 1)
