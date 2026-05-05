defmodule ElixirApp.App do
  alias ElixirApp.Math
  alias ElixirApp.Utils

  def run do
    result = Math.add(1, 2)
    formatted = Utils.format(result)
    IO.puts(formatted)
  end

  def greet(name) do
    Utils.format(name)
  end
end
