defmodule GooseServer.GameRegistry do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def create_game(creator_id, name) do
    game_id = generate_id()

    game = %{
      id: game_id,
      name: name,
      creator_id: creator_id,
      created_at: DateTime.utc_now()
    }

    Agent.update(__MODULE__, &Map.put(&1, game_id, game))
    game
  end

  def list_games do
    Agent.get(__MODULE__, &Map.values/1)
  end

  def get_game(game_id) do
    Agent.get(__MODULE__, &Map.get(&1, game_id))
  end

  def game_exists?(game_id) do
    Agent.get(__MODULE__, &Map.has_key?(&1, game_id))
  end

  def clear do
    Agent.update(__MODULE__, fn _ -> %{} end)
  end

  defp generate_id do
    :crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false)
  end
end
