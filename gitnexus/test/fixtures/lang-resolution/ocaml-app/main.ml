open Math
open Utils

let main () =
  let result = add 3 4 in
  let squared = square result in
  greet "World";
  print_endline (format_result "squared" squared)

let () = main ()
