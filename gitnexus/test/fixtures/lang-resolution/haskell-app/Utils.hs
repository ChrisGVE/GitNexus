module Utils (greet, formatResult) where

-- Greet a user by name
greet :: String -> String
greet name = "Hello, " ++ name ++ "!"

-- Format a numeric result as a string
formatResult :: Int -> String
formatResult n = "Result: " ++ show n
