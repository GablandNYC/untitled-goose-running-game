defmodule GooseServerWeb.Presence do
  use Phoenix.Presence,
    otp_app: :goose_server,
    pubsub_server: GooseServer.PubSub
end
