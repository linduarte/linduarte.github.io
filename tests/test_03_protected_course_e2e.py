import re

# import time
from playwright.sync_api import Page, expect

COURSE_PAGE = "app/templates/git-course/1a-prefacio.html"


def test_protected_requires_token(page: Page, base_url: str):
    # Sem token deve redirecionar
    page.goto(f"{base_url}/{COURSE_PAGE}")
    page.wait_for_url(re.compile(r".*/landing\.html$"))
    expect(page).to_have_url(re.compile(r"/landing\.html$"))


def ensure_course_loaded(page: Page, base_url: str, token: str, max_attempts: int = 2):
    """
    Garante que a página do curso carregue mesmo que o primeiro redirect
    aconteça antes do script de token ser considerado.
    """
    page.context.add_init_script(
        f"() => localStorage.setItem('access_token','{token}')"
    )
    for attempt in range(1, max_attempts + 1):
        page.goto(f"{base_url}/{COURSE_PAGE}")
        # Se não redirecionou, sucesso
        if "landing.html" not in page.url and not page.url.endswith("/index.html"):
            return
        # Redirecionou indevidamente, tenta novamente (reinjetar token explícito)
        page.evaluate(f"localStorage.setItem('access_token','{token}')")
    raise AssertionError(
        f"Não conseguiu carregar a página do curso após {max_attempts} tentativas (URL final: {page.url})"
    )


def test_protected_with_token(page: Page, base_url: str, auth_token: str):
    ensure_course_loaded(page, base_url, auth_token)
    heading = page.locator('[data-test="course-heading"], #course-heading')
    heading.wait_for(timeout=7000)
    expect(heading).to_be_visible()


def test_logout_clears_token(page: Page, base_url: str, auth_token: str):
    ensure_course_loaded(page, base_url, auth_token)
    logout_btn = page.locator("#logoutButton")
    logout_btn.wait_for(timeout=5000)
    expect(logout_btn).to_be_visible()
    logout_btn.click()
    page.wait_for_url(re.compile(r".*/(landing|index)\.html$"))
    assert any(
        p in page.url for p in ("landing.html", "index.html")
    ), "Não redirecionou após logout."
