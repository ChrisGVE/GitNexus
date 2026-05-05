defmodule ElixirApp.Utils do
  use GenServer

  def format(value) do
    "Value: #{value}"
  end

  def upcase(str) do
    String.upcase(str)
  end

  defp private_helper(x) do
    inspect(x)
  end
end
