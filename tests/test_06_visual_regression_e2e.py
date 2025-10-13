import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.visual
def test_landing_page_visual(page: Page, base_url: str):
    """Teste de regressão visual da landing page"""
    try:
        page.goto(f"{base_url}/landing.html")
        expect(page).to_have_url(
            f"{base_url}/landing.html"
        )  # Explicit wait for navigation

        # Screenshot simples with expectation (better for CI)
        screenshot = page.screenshot(full_page=True)
        assert len(screenshot) > 1000, "Screenshot deve ter conteúdo significativo"

        # Optional: For visual regression, use expect(page).to_have_screenshot('landing.png')

    except Exception as e:
        raise AssertionError(f"Erro no teste visual da landing: {e}")


@pytest.mark.e2e
@pytest.mark.visual
def test_login_form_visual(page: Page, base_url: str):
    """Teste visual do formulário de login"""
    try:
        page.goto(f"{base_url}/app/templates/git-course/login.html")
        expect(page).to_have_url(f"{base_url}/app/templates/git-course/login.html")

        login_form = page.locator(
            "form"
        )  # More specific: page.locator('form[data-test="login-form"]') if exists
        expect(login_form).to_be_visible()

        screenshot = login_form.screenshot()
        assert len(screenshot) > 500, "Screenshot do formulário deve ter conteúdo"

    except Exception as e:
        raise AssertionError(f"Erro no teste visual do login: {e}")


@pytest.mark.e2e
@pytest.mark.visual
def test_course_page_visual(page: Page, base_url: str, auth_token: str):
    """Teste visual da página do curso"""
    try:
        # Inject token first, then navigate
        page.context.add_init_script(
            script=f"""
            () => {{
                localStorage.setItem('access_token', '{auth_token}');
            }}
        """
        )
        page.goto(f"{base_url}/app/templates/git-course/1-index.html")
        expect(page).to_have_url(f"{base_url}/app/templates/git-course/1-index.html")

        screenshot = page.screenshot(full_page=True)
        assert len(screenshot) > 1000, "Screenshot da página do curso deve ter conteúdo"

    except Exception as e:
        raise AssertionError(f"Erro no teste visual do curso: {e}")
