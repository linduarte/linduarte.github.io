Resumo das alterações

Este PR corrige caminhos estáticos para `/app/static/`, remove links relativos legados, ajusta o layout da landing e aplica correções de acessibilidade de curto prazo.

Principais mudanças

- Canonicalização de caminhos estáticos para `/app/static/` em templates.
- Remoção do banner "Site em Construção" na `landing.html`.
- Correções de acessibilidade: adicionado link de pulo (skip link), uso de `<main>` como landmark, labels explícitos com `for`, `aria-required` em inputs e melhorias de contraste de botões e textos.

Relatórios de auditoria (gerados localmente)

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

Como reproduzir localmente

1. Inicie o servidor estático na raiz do repo (por exemplo):

```powershell
python -m http.server 8000
```

2. Execute pa11y (exemplo):

```powershell
npx pa11y "http://localhost:8000/landing.html" --reporter html > reports/landing-pa11y.html
```

3. Execute Lighthouse (exemplo):

```powershell
npx lighthouse "http://localhost:8000/landing.html" --chrome-flags="--headless --no-sandbox --disable-gpu" --emulated-form-factor=desktop --throttling-method=provided --output=json --output-path=reports/landing-lighthouse.report.json
```

Recomendações (próximos passos)

- Integrar pa11y e Lighthouse em CI (opcionalmente como checks opcionais em PRs).
- Otimizar imagens da landing para melhorar LCP (compressão / WebP / dimensions/ lazy-load apenas offscreen images).
- Adicionar um pipeline simples de minificação (CSS/JS) para subir o escore de best-practices.

Observações

- Testes E2E locais (pytest) foram executados nos fluxos de landing/login e passaram.
- Commit atual remove um arquivo temporário `app/__init__.py` que foi deletado.

Se quiser, posso anexar esses arquivos de relatório ao PR como comentário ou artefato; neste momento ficam no repositório em `reports/`.
