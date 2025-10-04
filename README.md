# linduarte.github.io
Conheça o 'Git' e seu papel no controle de versões e a guarda de repositórios no Github.
Git é uma ferramenta criada por ninguem menos do que Linus Torvalds e hoje mantida por Junio Hamano, um desenvolvedor japones que caiu nas graças de Linus, dizendo ser ele o responsável por deixar o 'Git' cada vez melhor.

Agora temos a oportunidade de apresentar em um curso de fundamentos de Git seus comandos iniciais para que possa permitir então o devido aprofundamento nos demais comandos.

Esta instruções são baseadas no livro "A Practical Guide to Git and GitHub for Windows Users - Roberto Vormittag"

Usa-se tambem para enriquecimento das paginas a representação pictórica dos comandos Git apresentados com a ferramenta denominada GitGraph da Mermaid.

## Testes E2E (Playwright - Python)

Pré-requisitos:
1. Backend rodando em: http://127.0.0.1:8000 (rotas /auth, /progress, etc.) ou ajustar FRONTEND_BASE_URL.
2. Frontend acessível na mesma origem (uvicorn main:app --port 8000).

Instalação e execução:
```bash
uv pip install .[e2e]
uv run playwright install
# (Opcional) export FRONTEND_BASE_URL="http://127.0.0.1:8000"
uv run pytest -k e2e
```

Principais cenários cobertos:
- Redirecionamento de / (index.html) para landing.html
- CTA de registro presente e funcional
- Links de login e registro
- Acesso bloqueado à página protegida sem token
- Acesso permitido com token simulado
- Logout limpa token

Estrutura:
```
tests/
  conftest.py
  test_01_redirect_e2e.py
  test_02_landing_auth_links_e2e.py
  test_03_protected_course_e2e.py
```

## Executando testes E2E (Playwright)

Instalação inicial:
```bash
uv pip install .          # instala dependências (pytest, playwright, plugin)
uv run playwright install # baixa navegadores
```

Executar todos os testes:
```bash
uv run pytest
```

Executar somente E2E:
```bash
uv run pytest -k e2e
```

Variáveis:
- FRONTEND_BASE_URL (padrão: http://127.0.0.1:8000)

Problema “fixture 'page' not found”:
- Verifique se playwright / pytest-playwright foram instalados (ver pyproject atualizado).
- OU use o fallback já incluso em tests/conftest.py.
