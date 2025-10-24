import json

from playwright.sync_api import Page, expect


def test_progress_sync_between_tabs(page: Page, base_url: str, auth_token: str):
    ctx = page.context

    # Ensure new pages get our injected globals. We'll also stub the config.js request so
    # the dashboard receives a config that sets window.API_URL to the test base_url.
    ctx.add_init_script(
        f"() => {{ localStorage.setItem('access_token', '{auth_token}'); window.API_URL = '{base_url}'; }}"
    )

    # In-memory fake progress store used by the route handler
    progress_store = {"items": []}

    def route_handler(route, request):
        url = request.url
        method = request.method.upper()
        print(f"[route] {method} {url}")
        try:
            if method == "POST" and url.endswith("/progress"):
                post_data = request.post_data or "{}"
                body = json.loads(post_data)
                topic_id = body.get("topic_id", 0)
                new = {
                    "id": len(progress_store["items"]) + 1,
                    "topic_id": topic_id,
                    "completed": True,
                    "feedback": body.get("feedback", ""),
                }
                progress_store["items"].append(new)
                route.fulfill(
                    status=200,
                    body=json.dumps(new),
                    headers={"Content-Type": "application/json"},
                )
                return

            if method == "GET" and url.endswith("/progress/summary"):
                items = progress_store["items"]
                summary = {
                    "total": len(items),
                    "concluidos": sum(1 for i in items if i.get("completed")),
                    "pendentes": 0,
                    "completados": [i["topic_id"] for i in items if i.get("completed")],
                }
                print(f"[route->fulfill] /progress/summary -> {summary}")
                route.fulfill(
                    status=200,
                    body=json.dumps(summary),
                    headers={"Content-Type": "application/json"},
                )
                return

            if method == "GET" and url.endswith("/progress"):
                route.fulfill(
                    status=200,
                    body=json.dumps(progress_store["items"]),
                    headers={"Content-Type": "application/json"},
                )
                return

        except Exception as e:
            route.fulfill(
                status=500,
                body=json.dumps({"detail": str(e)}),
                headers={"Content-Type": "application/json"},
            )
            return

        # Fallback: continue
        route.continue_()

    # Intercept all /progress* requests on the context so both pages see the same fake backend
    ctx.route("**/progress*", route_handler)
    # Debug: log all requests to help diagnose matching
    ctx.on("request", lambda req: print(f"[request] {req.method} {req.url}"))

    # Stub the missing config.js (templates reference it). Serve a tiny script that sets
    # window.API_URL to our base_url so the dashboard fetches the right origin.
    def config_stub(route, request):
        body = f"window.API_URL = '{base_url}';"
        route.fulfill(
            status=200, body=body, headers={"Content-Type": "application/javascript"}
        )

    ctx.route("**/app/static/js/config.js", config_stub)

    # Page A: dashboard
    page.goto(base_url)
    # Ensure the existing page has the auth token (add_init_script affects new pages only)
    page.evaluate(f"() => {{ localStorage.setItem('access_token', '{auth_token}'); }}")
    dashboard = page
    dashboard.goto(f"{base_url}/app/templates/git-course/dashboard.html")
    # Open progress section (this triggers the fetches)
    btn = dashboard.locator("#btnProgress")
    btn.wait_for()
    btn.click()

    # Ensure initial state shows no progress
    api_val = dashboard.evaluate("() => window.API_URL || ''")
    print("[debug] dashboard window.API_URL =", api_val)
    # Wait for list to load; our fake GET returns empty list
    list_el = dashboard.locator("#progressList")
    expect(list_el).to_have_text("Nenhum progresso registrado.", timeout=5000)

    # Page B: course page
    page_b = ctx.new_page()
    page_b.goto(base_url)
    page_b.goto(f"{base_url}/app/templates/git-course/11-branch-1.html")
    btn_complete = page_b.locator("#markCompletedButton")
    btn_complete.wait_for()

    # Click to mark complete; the route handler will respond OK and update store
    btn_complete.click()

    # Wait for the button to reflect success
    expect(btn_complete).to_have_text("Concluído ✓", timeout=5000)

    # On dashboard, the storage event + fetch summary/list should trigger a reload.
    # Wait for the list to contain the new progress entry
    expect(dashboard.locator("#progressList")).to_contain_text("Tópico", timeout=5000)

    # Clean up route
    ctx.unroute("**/progress*")
