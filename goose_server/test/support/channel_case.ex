defmodule GooseServerWeb.ChannelCase do
  @moduledoc """
  This module defines the test case to be used by
  channel tests.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Phoenix.ChannelTest

      @endpoint GooseServerWeb.Endpoint
    end
  end

  setup _tags do
    GooseServer.GameRegistry.clear()
    :ok
  end
end
