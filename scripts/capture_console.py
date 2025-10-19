import json
import os

from playwright.sync_api import sync_playwright

OUT_DIR = "reports/console"
if not os.path.exists(OUT_DIR):
    os.makedirs(OUT_DIR)

PAGES = [
    ("index.html", "landing"),
    ("app/templates/git-course/login.html", "login"),
    ("app/templates/git-course/1a-prefacio.html", "prefacio"),
]

results = {}

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    context = browser.new_context()
    for path, name in PAGES:
        url = f"http://localhost:8000/{path}"
        page = context.new_page()
        logs = []
        errors = []
        failed_requests = []

        def on_console(msg):
            logs.append({"type": msg.type, "text": msg.text, "location": msg.location})

        def on_page_error(exc):
            errors.append({"error": str(exc)})

        def on_request_failed(req):
            failed_requests.append({"url": req.url, "failure": str(req.failure)})

        page.on("console", on_console)
        page.on("pageerror", on_page_error)
        page.on("requestfailed", on_request_failed)

        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
        except Exception as e:
            errors.append({"goto_error": str(e)})

        screenshot_path = f"{OUT_DIR}/{name}.png"
        page.screenshot(path=screenshot_path, full_page=True)

        # Save logs
        results[name] = {
            "url": url,
            "console": logs,
            "errors": errors,
            "failed_requests": failed_requests,
            "screenshot": screenshot_path,
        }
        with open(f"{OUT_DIR}/{name}.json", "w", encoding="utf-8") as fh:
            json.dump(results[name], fh, indent=2)

    context.close()
    browser.close()

# Write aggregate
with open(f"{OUT_DIR}/summary.json", "w", encoding="utf-8") as fh:
    json.dump(results, fh, indent=2)

print("Done. Console logs and screenshots saved to", OUT_DIR)
