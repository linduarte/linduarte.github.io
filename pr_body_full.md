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
````markdown
Resumo das alterações

Este PR corrige caminhos estáticos para `/app/static/`, remove links relativos legados, ajusta o layout da landing e aplica correções de acessibilidade de curto prazo.

Principais mudanças

- Canonicalização de caminhos estáticos para `/app/static/` em templates.
- Remoção do banner "Site em Construção" na `landing.html`.
- Correções de acessibilidade: adicionado link de pulo (skip link), uso de `<main>` como landmark, labels explícitos com `for`, `aria-required` em inputs e melhorias de contraste de botões e textos.

Relatórios de auditoria (artefatos gerados nesta branch e localmente)

Nota rápida: para revisão rápida os arquivos de auditoria locais foram colocados em `tmp/audits/` nesta branch (não são committed em `app/` para evitar poluição do repositório). Sanitized copies of older CI artifacts (where '?=NUMBER' tokens were removed) are available in `tmp/clean-artifacts/`.

- Pa11y (JSON) — relatórios salvos em `tmp/audits/` (exemplos):
  - `tmp/audits/landing.html-pa11y.json`
  - `tmp/audits/git-course_10-feature_req.html-pa11y.json`

- Lighthouse (JSON) — relatórios salvos em `tmp/audits/` (exemplos):
  - `tmp/audits/landing-lighthouse.json`
  - `tmp/audits/landing.html-lighthouse.json`
  - `tmp/audits/git-course_10-feature_req.html-lighthouse.json`

Links diretos (raw) para os canonical reports in CI (if generated as part of the workflow) will appear under the `reports/` path in this branch once CI uploads them as artifacts.

Checklist e próximos passos (recomendados)

- [ ] Integrar pa11y e Lighthouse em CI (checks run on PRs and artifacts uploaded).
- [ ] Re-run the CI generation step to produce canonical audit artifacts (CI will generate responsive images temporarily, run audits, then clean up).
- [ ] If any remaining Lighthouse issues persist (unsized-image), fix templates to include intrinsic width/height attributes or correct srcset/sizes pairing.
- [ ] Add a lightweight build step (image optimization/minify CSS/JS) to improve best-practices scores.

Audits + re-generation policy (short and actionable)

1) CI-only generation of responsive image variants
   - Responsive variants (e.g. `*-150.webp`, `*-300.webp`, `*-600.webp`) are generated at audit time in CI only. The generator script is defined in `package.json` as `npm run generate:ci` which invokes `scripts/ci_generate_variants.js`.
   - Generated variants MUST NOT be committed. `.gitignore` contains patterns that exclude these from the repo, and we keep a CI step that fails the build if any tracked file contains the artifact query-suffix tokens (`\?=\d+`).

2) Backups and evidence
   - During local work we back up generated files to `tmp/backups-generated-images-*` before any destructive cleanup. Those backups live in the branch workspace only.

3) Sanitization of uploaded artifacts
   - Old uploaded Lighthouse artifacts occasionally contained query-suffix tokens like `?=800`. The repo includes sanitizer utilities that produce `tmp/clean-artifacts/` copies with such tokens removed for clean review.

4) How CI runs audits
   - CI pipeline steps (see `.github/workflows/*`) will:
     a) Run `npm ci` and optionally `npm run generate:ci` to produce transient variants.
     b) Start a simple static server (http-server / python -m http.server).
     c) Run Lighthouse and pa11y against the server and upload JSON/HTML artifacts.
     d) Remove generated variants from the workspace and do not commit them.

How to reproduce locally (Node-based - no Python required)

1. Install required Node tooling (if you don't have them globally):

```powershell
npm install -g http-server lighthouse pa11y
```

2. (Optional) Generate responsive variants locally for testing (CI-only in practice):

```powershell
npm run generate:ci
# this will create variants under tmp/generated-images; copy them into app/static/images to test locally
```

3. Start a static server and run audits:

```powershell
npx http-server -p 8000 -c-1
npx lighthouse http://localhost:8000/landing.html --output=json --output-path=tmp/audits/landing-lighthouse.json --chrome-flags='--headless'
npx pa11y http://localhost:8000/landing.html --reporter json > tmp/audits/landing-pa11y.json
```

Notes and observations

- Generated responsive variants were backed up to `tmp/backups-generated-images-*` and then removed from `app/static/images` to keep the repo tidy. This branch's `.gitignore` was updated to prevent re-committing these generated artifacts.
- CI contains a guard that checks for `\?=\d+` tokens in tracked files and will fail the build if any are present to prevent noisy artifacts from being reintroduced.
- Sanitized copies of prior uploaded artifacts (where query-suffix tokens were stripped) are available in `tmp/clean-artifacts/` for reviewer inspection.

PR attachments

- Local audits are in `tmp/audits/` on this branch for quick review. If you'd like I can prepare a ZIP of `tmp/audits/` and `tmp/clean-artifacts/` ready to attach to the PR.

Checklist for maintainers antes da mesclagem

- [ ] Confirm CI audit runs succeeded and artifacts were uploaded to the PR.
- [ ] Review `tmp/audits/*` for any remaining unsized-image warnings and address any legitimate missing width/height issues in templates.
- [ ] Approve and merge.

````
