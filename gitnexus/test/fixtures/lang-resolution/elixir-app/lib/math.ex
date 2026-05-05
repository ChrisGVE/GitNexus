defmodule ElixirApp.Math do
  def add(a, b) do
    a + b
  end

  def multiply(a, b) do
    a * b
  end

  defp internal_helper(x) do
    x * x
  end
end
