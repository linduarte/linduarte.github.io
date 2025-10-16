Resumo das alterações

Este PR corrige caminhos estáticos para `/app/static/`, remove links relativos legados, ajusta o layout da landing e aplica correções de acessibilidade de curto prazo.

Principais mudanças

- Canonicalização de caminhos estáticos para `/app/static/` em templates.
- Remoção do banner "Site em Construção" na `landing.html`.
- Correções de acessibilidade: adicionado link de pulo (skip link), uso de `<main>` como landmark, labels explícitos com `for`, `aria-required` em inputs e melhorias de contraste de botões e textos.

Relatórios de auditoria (gerados localmente e adicionados a esta branch)

- Pa11y (HTML) — relatórios salvos em `reports/`:
  - `reports/landing-pa11y.html` — 0 errors, 0 warnings, 0 notices
  - `reports/login-pa11y.html` — 0 errors, 0 warnings, 0 notices
  - `reports/prefacio-pa11y.html` — 0 errors, 0 warnings, 0 notices

- Lighthouse (JSON) — relatórios salvos em `reports/`:
  - `reports/landing-lighthouse.report.json`
    - performance: 94
    - accessibility: 97
    - best-practices: 54
    - seo: 91
    - FCP/LCP: ~2.5 s
    - CLS: 0
  - `reports/login-lighthouse.report.json`
    - performance: 100
    - accessibility: 100
    - best-practices: 54
    - seo: 91
    - FCP/LCP: ~0.4 s
    - CLS: 0.001
  - `reports/prefacio-lighthouse.report.json`
    - performance: 100
    - accessibility: 97
    - best-practices: 54
    - seo: 91
    - FCP/LCP: ~0.4 s
    - CLS: 0

Links diretos (raw) para os relatórios nesta branch (`fix/canonicalize-static-paths`):

- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/landing-pa11y.html
- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/login-pa11y.html
- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/prefacio-pa11y.html

- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/landing-lighthouse.report.json
- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/login-lighthouse.report.json
- https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/prefacio-lighthouse.report.json

Checklist e próximos passos (recomendados)

- [ ] Integrar pa11y e Lighthouse em CI (preferível como checks opcionais para PRs).
- [ ] Otimizar imagens na landing (compressão, WebP, definir width/height para LCP).
- [ ] Adicionar minificação de CSS/JS e pipeline simples de build para subir scores de best-practices.
- [ ] Adicionar pre-commit hook para impedir reintrodução de caminhos legados (`/static/...`).
- [ ] Executar suíte E2E completa em CI (Playwright) e garantir que os relatórios sejam salvos como artefatos.

Como reproduzir localmente

1. Inicie o servidor estático na raiz do repo:

```powershell
python -m http.server 8000
```

2. Abra os relatórios locais (exemplo):

```powershell
start https://raw.githubusercontent.com/linduarte/linduarte.github.io/fix/canonicalize-static-paths/reports/landing-pa11y.html
```

Observações

- Testes E2E locais (pytest) foram executados nos fluxos de landing/login e passaram.
- Este commit inclui os relatórios em `reports/` para facilitar a revisão. Se preferir que eu remova os relatórios do branch e apenas mantenha os resumos, diga e eu extraio e reverte.
