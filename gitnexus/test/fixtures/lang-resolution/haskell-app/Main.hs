module Main where

import Math
import Utils

-- Entry point
main :: IO ()
main = do
  let result = add 3 4
  let product = multiply 2 5
  putStrLn (greet "Haskell")
  putStrLn (formatResult result)
  print product
