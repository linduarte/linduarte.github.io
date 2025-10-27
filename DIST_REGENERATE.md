Regenerating the `dist` directory (build output)

Note: `app/` is the source of truth for templates and static assets. The `dist/` directory contains generated build output and is intentionally ignored by the repository (`.gitignore`). If you need to recreate `dist/` locally (for previewing or publishing), here are small, safe ways to do it.

PowerShell (Windows, pwsh):

```powershell
# From repository root (pwsh)
Remove-Item -Recurse -Force .\dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path .\dist -Force | Out-Null
# copy templates and static assets
Copy-Item -Path .\app\templates -Destination .\dist\templates -Recurse -Force
Copy-Item -Path .\app\static -Destination .\dist\static -Recurse -Force
```

POSIX (Linux / macOS / WSL):

```bash
# From repository root
rm -rf dist
mkdir -p dist
cp -r app/templates dist/templates
cp -r app/static dist/static
```

Notes and suggestions:
- If you have a build tool (npm, gulp, etc.), prefer using its build command (for example `npm run build`) and configure it to output into `dist/`.
- A recommended alternative is to add a CI workflow (GitHub Actions) that builds the site and publishes artifacts or deploys to GitHub Pages. I can add a small CI workflow for that if you'd like.
- We purposely keep `dist/` out of source control to avoid merge conflicts with generated files. Recreate it only when you need a local build output or for deployment tooling.
