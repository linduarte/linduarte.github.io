import os
from pathlib import Path

from playwright.sync_api import Playwright


def pytest_playwright_configure(playwright: Playwright):
    # Configurações globais do Playwright
    playwright.chromium.launch_persistent_context(
        user_data_dir="./test-results/user-data",
        headless=os.getenv("CI") == "true",  # Headless em CI
        viewport={"width": 1280, "height": 720},  # type: ignore[arg-type]
        ignore_https_errors=True,
    )


# Configuração para screenshots e test results
TEST_RESULTS_DIR = Path("test-results")
SCREENSHOT_DIR = TEST_RESULTS_DIR / "screenshots"
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
