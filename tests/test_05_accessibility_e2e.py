import re

import pytest
from playwright.sync_api import Page, expect


@pytest.mark.e2e
@pytest.mark.accessibility
def test_landing_page_accessibility(page: Page, base_url: str):
    """Testa acessibilidade básica da landing page"""
    try:
        page.goto(f"{base_url}/landing.html")
        expect(page).to_have_url(f"{base_url}/landing.html")

        # Verifica se imagens têm alt text
        images = page.locator("img")
        image_count = images.count()
        assert image_count > 0, "Nenhuma imagem encontrada"
        for i in range(image_count):
            img = images.nth(i)
            expect(img).to_have_attribute(
                "alt", re.compile(r".+")
            )  # Ensure alt exists and is non-empty
            alt_text = img.get_attribute("alt")
            assert (
                alt_text is not None and len(alt_text.strip()) > 0
            ), f"Imagem {i} sem alt text"
            assert len(alt_text.strip()) > 0, f"Imagem {i} sem alt text"

    except Exception as e:
        raise AssertionError(f"Erro no teste de acessibilidade da landing: {e}")


@pytest.mark.skip(reason="Desabilitado durante testes manuais")
@pytest.mark.e2e
@pytest.mark.accessibility
def test_course_page_accessibility(page: Page, base_url: str, auth_token: str):
    """Testa acessibilidade da página do curso"""
    try:
        page.context.add_init_script(
            script=f"""
            () => {{
                localStorage.setItem('access_token', '{auth_token}');
            }}
        """
        )
        page.goto(f"{base_url}/app/templates/git-course/1-index.html")
        expect(page).to_have_url(f"{base_url}/app/templates/git-course/1-index.html")

        # Verifica headings hierárquicos
        h1_count = page.locator("h1").count()
        assert h1_count == 1, "Deve ter exatamente 1 h1"

        # Teste simplificado de links
        links = page.locator("a")
        link_count = links.count()
        links_with_text = 0

        for i in range(min(link_count, 10)):
            link = links.nth(i)
            text_content = link.text_content() or ""
            if len(text_content.strip()) > 0:
                links_with_text += 1

        assert (
            links_with_text >= link_count // 2
        ), f"Poucos links com texto: {links_with_text}/{link_count}"

    except Exception as e:
        raise AssertionError(f"Erro no teste de acessibilidade do curso: {e}")
