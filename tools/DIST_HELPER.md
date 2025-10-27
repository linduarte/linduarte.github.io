Tracked helpers for regenerating `dist/`

This repository intentionally keeps `dist/` out of source control. For convenience there are two tracked helper files to recreate `dist/` locally from the `app/` sources:

- `tools/regenerate-dist.ps1` — PowerShell script for Windows (pwsh). Use `-Force` to overwrite an existing `dist/`.
- `Makefile` — provides `make dist` for POSIX environments and `make dist-windows` which runs the PowerShell script on Windows.

Usage examples:

PowerShell (Windows):

```powershell
# From repository root
.\tools\regenerate-dist.ps1 -Force
```

POSIX (Linux / macOS / WSL):

```bash
# From repository root
make dist
```

Notes:
- These helpers only copy `app/templates` and `app/static` into a new `dist/` directory. If you have a build pipeline (npm, gulp, etc.), prefer that for production builds.
- I can add a GitHub Actions workflow to build or publish `dist/` automatically. Tell me if you want that.
