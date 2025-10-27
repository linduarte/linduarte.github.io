# Simple Makefile helper for reproducing dist/ locally

.PHONY: dist

dist:
	@echo "Recreating dist/ from app/"
	@rm -rf dist || true
	@mkdir -p dist/templates dist/static
	@cp -r app/templates/* dist/templates/ || true
	@cp -r app/static/* dist/static/ || true
	@echo "done"

# Windows convenience target (uses PowerShell script)
.PHONY: dist-windows

dist-windows:
	@powershell -NoProfile -ExecutionPolicy Bypass -File tools\regenerate-dist.ps1 -Force
