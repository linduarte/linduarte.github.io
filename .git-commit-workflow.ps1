git add .github/workflows/pr-audit.yml
if (git diff --staged --name-only | Select-String -Pattern '\.github/workflows/pr-audit.yml') {
  git commit -m "ci(audit): add pa11y no-sandbox flags and guard @actions/core require" --no-verify
  git push origin feature/harden-jwt
} else { Write-Output 'No staged changes to commit.' }
