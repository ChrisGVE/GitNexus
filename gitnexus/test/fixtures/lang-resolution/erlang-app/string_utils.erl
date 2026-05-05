-module(string_utils).

-export([greet/1, to_upper/1, join/2]).

greet(Name) ->
    "Hello, " ++ Name ++ "!".

to_upper(Str) ->
    string:to_upper(Str).

join(A, B) ->
    A ++ B.
