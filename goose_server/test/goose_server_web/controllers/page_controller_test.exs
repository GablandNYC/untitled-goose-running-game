defmodule GooseServerWeb.PageControllerTest do
  use GooseServerWeb.ConnCase

  test "GET / serves the frontend index.html", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert html_response(conn, 200) =~ "<div id=\"__next\">"
  end

  test "GET / returns 200 even without frontend build", %{conn: conn} do
    conn = get(conn, ~p"/")
    assert conn.status == 200
  end
end
