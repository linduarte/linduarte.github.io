```markdown
Audit summary

Pages scanned:
- /
- /landing.html
- /git-course/10-feature_req.html

Artifacts produced (in tmp/audits):
- landing-lighthouse.json
- landing.html-lighthouse.json
- -lighthouse.json
- git-course_10-feature_req.html-lighthouse.json
- git-course_10-feature_req.html-pa11y.json
- landing.html-pa11y.json
- -pa11y.json

Notes:
- Generated responsive WebP variants were created earlier for CI but are intentionally not tracked in git. Local generated variants were backed up to `tmp/backups-generated-images-*` and then deleted from `app/static/images` to keep the repo tidy.
- Sanitized copies of previous Lighthouse artifacts (with '?=NUMBER' tokens removed) are available in `tmp/clean-artifacts/`.
- Next recommended step: review the Lighthouse artifacts and, if acceptable, let CI run the full audit workflow which will produce canonical artifacts and a PR comment with key metrics.

```
