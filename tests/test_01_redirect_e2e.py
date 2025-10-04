import re

from playwright.sync_api import Page, expect


def test_index_redirects_to_landing(page: Page, base_url: str):
    page.goto(f"{base_url}/")
    page.wait_for_url(re.compile(r".*/landing\.html$"))
    expect(page).to_have_url(re.compile(r"/landing\.html$"))


def test_landing_has_register_and_login_links(page: Page, base_url: str):
    page.goto(f"{base_url}/landing.html")
    # Link de registro (texto pode variar)
    register_link = page.get_by_role("link", name=re.compile(r"registr", re.I))
    expect(register_link).to_be_visible()
    # Login pode ou não existir; se existir validar visibilidade
    login_candidates = page.get_by_role("link", name=re.compile(r"login", re.I))
    if login_candidates.count():
        expect(login_candidates.first).to_be_visible()
