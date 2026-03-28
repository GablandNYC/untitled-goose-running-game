defmodule GooseServerWeb.UserSocket do
  use Phoenix.Socket

  channel "lobby", GooseServerWeb.LobbyChannel
  channel "game:*", GooseServerWeb.GameChannel

  @impl true
  def connect(%{"player_id" => player_id}, socket, _connect_info) do
    {:ok, assign(socket, :player_id, player_id)}
  end

  def connect(_params, _socket, _connect_info) do
    :error
  end

  @impl true
  def id(socket), do: "player:#{socket.assigns.player_id}"
end
