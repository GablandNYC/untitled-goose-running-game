defmodule GooseServerWeb.PageController do
  use GooseServerWeb, :controller

  def home(conn, _params) do
    index_path = Application.app_dir(:goose_server, "priv/static/index.html")

    if File.exists?(index_path) do
      conn
      |> put_resp_content_type("text/html")
      |> send_file(200, index_path)
    else
      conn
      |> put_resp_content_type("text/html")
      |> send_resp(200, """
      <h1>Frontend not built</h1>
      <p>Run <code>mix frontend.build</code> from the goose_server directory to build and copy the frontend.</p>
      """)
    end
  end
end
