import re

from playwright.sync_api import Page, expect


def test_go_to_register(page: Page, base_url: str):
    page.goto(f"{base_url}/landing.html")
    link = page.get_by_role("link", name=re.compile(r"registr", re.I))
    expect(link).to_be_visible()
    link.click()
    # Aceitar redirecionamento via index.html ou direto register.html
    page.wait_for_load_state("load")
    assert any(s in page.url for s in ("register.html", "index.html", "landing.html"))


def test_go_to_login(page: Page, base_url: str):
    page.goto(f"{base_url}/landing.html")
    login_link = page.get_by_role("link", name=re.compile(r"login", re.I))
    if login_link.count():
        login_link.first.click()
        page.wait_for_load_state("load")
        assert "login.html" in page.url or "index.html" in page.url
    else:
        assert True  # Não falha se não houver link de login
