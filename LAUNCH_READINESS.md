# Launch Readiness Checklist

This document is the live plan for preparing the site for public launch. It references the tracked TODOs and contains quick commands and owners.

Goals
- Confirm functional correctness (login, course access)
- Meet basic accessibility and performance standards
- Ensure observability and a clear rollback path

Prioritized Tasks (top 5)
1. Run Lighthouse & accessibility audits (landing, login, start) — owner: you
2. Fix high-severity accessibility issues — owner: you
3. Staging smoke tests & verification — owner: you
4. Set up synthetic monitors (uptime + key flows) — owner: you
5. Finalize rollback plan & runbook — owner: you

Quick commands
- Run Lighthouse (Chrome):
  npx lighthouse https://<your-preview-url> --output html --output-path=LH-report.html --chrome-flags="--headless"

-- Run Playwright tests locally (Windows PowerShell) using the repo wrapper `uv`:
  & .venv\Scripts\Activate.ps1
  uv run pytest -k e2e -v

- Run a11y check with pa11y (example):
  npx pa11y https://<your-preview-url>

Acceptance criteria (example)
- No critical accessibility violations
- Lighthouse performance >= 50, Best Practices >= 80, SEO >= 80
- E2E login/course tests pass across Chromium, Firefox, WebKit
- Synthetic monitors report green for 72 hours

Next steps (this session)
- I'm marking the "Create launch readiness plan" as in-progress and created this file.
- Tell me which item you want me to start executing first (I recommend Lighthouse + a11y audits).
