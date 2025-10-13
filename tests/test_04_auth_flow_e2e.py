import re

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.skip(reason="Desabilitado durante testes manuais")
@pytest.mark.e2e
def test_complete_registration_flow(page: Page, base_url: str):
    """Testa fluxo completo de registro em produção (simulado)"""
    try:
        page.goto(f"{base_url}/landing.html")
        expect(page).to_have_url(f"{base_url}/landing.html")

        # Clica no link de registro
        register_link = page.get_by_role("link", name=re.compile(r"registr", re.I))
        expect(register_link).to_be_visible()
        register_link.click()

        # Aguarda carregamento da página de registro
        page.wait_for_load_state("networkidle", timeout=5000)

        # Preenche formulário
        email_field = page.locator("#email")
        expect(email_field).to_be_visible(timeout=3000)
        email_field.fill("test@example.com")
        page.fill("#password", "test123")

        # Submete
        submit_btn = page.locator("button[type='submit']")
        expect(submit_btn).to_be_visible()
        submit_btn.click()

        # Aguarda processamento
        page.wait_for_load_state("networkidle", timeout=5000)

        # Verifica sucesso
        current_url = page.url
        if "1-index.html" in current_url or "course" in current_url:
            expect(page.locator('[data-test="course-heading"]')).to_be_visible(
                timeout=5000
            )
        else:
            success_locator = page.get_by_text(
                re.compile(r"sucesso|ok|success|registrado", re.I)
            )
            expect(success_locator).to_be_visible(timeout=5000)

    except Exception as e:
        try:
            page.screenshot(path="failure_registration.png")
        except Exception:
            pass
        raise AssertionError(f"Erro no teste de registro: {e}")


@pytest.mark.e2e
def test_complete_login_flow(page: Page, base_url: str):
    """Testa fluxo completo de login em produção (simulado)"""
    try:
        page.goto(f"{base_url}/app/templates/git-course/login.html")
        expect(page).to_have_url(f"{base_url}/app/templates/git-course/login.html")

        # Tenta localizar campo de usuário
        username_field = page.locator("#email")
        if not username_field.is_visible():
            username_field = page.locator("#username")
        expect(username_field).to_be_visible(timeout=5000)

        username_field.fill("demo_user")
        page.fill("#password", "demo_pass")

        # Submete
        page.click("button[type='submit']")
        page.wait_for_load_state("networkidle", timeout=8000)

        # Verifica sucesso
        current_url = page.url
        if "1a-prefacio.html" in current_url or "1-index.html" in current_url:
            assert True
        else:
            success_locator = page.get_by_text(re.compile(r"sucesso|ok|success", re.I))
            expect(success_locator).to_be_visible(timeout=5000)

    except Exception as e:
        try:
            page.screenshot(path="failure_login.png")
        except Exception:
            pass
        raise AssertionError(f"Erro no teste de login: {e}")


@pytest.mark.e2e
def test_logout_functionality(page: Page, base_url: str, auth_token: str):
    """Testa logout e redirecionamento"""
    try:
        # Injeta token
        page.context.add_init_script(
            f"() => {{ localStorage.setItem('access_token', '{auth_token}'); }}"
        )
        page.goto(f"{base_url}/app/templates/git-course/1-index.html")
        page.wait_for_load_state("networkidle")

        current_url = page.url
        if "landing.html" in current_url:
            skip_reason = (
                "Redirecionado para landing: token inválido ou auth guard ativo"
            )
            raise RuntimeError(skip_reason)

        # Verifica botão de logout
        logout_btn = page.locator("#logoutButton")
        expect(logout_btn).to_be_visible(timeout=3000)
        logout_btn.click()
        page.wait_for_load_state("networkidle", timeout=5000)

        final_url = page.url
        assert "landing.html" in final_url or "index.html" in final_url

    except Exception as e:
        try:
            page.screenshot(path="failure_logout.png")
        except Exception:
            pass
        raise AssertionError(f"Erro no teste de logout: {e}")
