defmodule GooseServerWeb.GameChannelTest do
  use GooseServerWeb.ChannelCase

  alias GooseServerWeb.UserSocket
  alias GooseServer.GameRegistry

  setup do
    game = GameRegistry.create_game("creator", "Test Race")
    {:ok, socket} = connect(UserSocket, %{"player_id" => "player1"})
    {:ok, game: game, socket: socket}
  end

  describe "join" do
    test "player can join an existing game", %{socket: socket, game: game} do
      {:ok, _reply, _socket} = subscribe_and_join(socket, "game:#{game.id}", %{})
      assert_push "presence_state", %{}
    end

    test "player cannot join a non-existent game", %{socket: socket} do
      assert {:error, %{reason: "game not found"}} =
               subscribe_and_join(socket, "game:nonexistent", %{})
    end

    test "player appears in game presence after joining", %{socket: socket, game: game} do
      {:ok, _reply, _socket} = subscribe_and_join(socket, "game:#{game.id}", %{})
      assert_push "presence_state", presence
      assert Map.has_key?(presence, "player1")
    end

    test "presence diff is broadcast when player joins game", %{socket: socket, game: game} do
      {:ok, _reply, _socket} = subscribe_and_join(socket, "game:#{game.id}", %{})
      assert_broadcast "presence_diff", %{joins: %{"player1" => _}}
    end
  end

  describe "new_msg" do
    test "message is broadcast to the game", %{socket: socket, game: game} do
      {:ok, _reply, socket} = subscribe_and_join(socket, "game:#{game.id}", %{})

      push(socket, "new_msg", %{"body" => "honk!"})
      assert_broadcast "new_msg", %{player_id: "player1", body: "honk!"}
    end

    test "message includes correct player_id", %{socket: socket, game: game} do
      {:ok, _reply, socket} = subscribe_and_join(socket, "game:#{game.id}", %{})

      push(socket, "new_msg", %{"body" => "hello geese"})
      assert_broadcast "new_msg", payload
      assert payload.player_id == "player1"
      assert payload.body == "hello geese"
    end
  end
end
