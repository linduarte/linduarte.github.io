import contextlib
import os
import socket
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent


def _get_free_port() -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class SilentHandler(SimpleHTTPRequestHandler):
    # Aceita 'directory' como argumento opcional e repassa para o pai quando suportado,
    # com fallback para versões antigas do Python que não aceitam esse argumento.
    def __init__(self, *args, directory=None, **kwargs):
        # Tenta chamar o __init__ do pai com 'directory' (Python 3.11+),
        # e se não for suportado, define self.directory e chama sem o kwarg.
        try:
            super().__init__(*args, directory=directory, **kwargs)
        except TypeError:
            if directory is not None:
                try:
                    # Alguns handlers usam o atributo 'directory' diretamente.
                    self.directory = directory
                except Exception:
                    pass
            super().__init__(*args, **kwargs)

    # Evita logs barulhentos por requisição
    def log_message(self, format, *args):  # noqa: D401
        pass

    # (Opcional) forçar UTF-8 em responses simples
    def end_headers(self):
        if "Content-Type" not in self.headers:
            self.send_header("Content-Type", "text/html; charset=utf-8")
        super().end_headers()


@pytest.fixture(scope="session")
def static_server():
    """
    Sobe um servidor HTTP estático servindo o repositório.
    HOST/PORT: FRONTEND_HOST / FRONTEND_PORT (opcionais).
    """
    host = os.getenv("FRONTEND_HOST", "127.0.0.1")
    env_port = os.getenv("FRONTEND_PORT")
    port = int(env_port) if env_port else _get_free_port()

    prev_cwd = os.getcwd()
    os.chdir(REPO_ROOT)

    # Factory garantindo argumento 'directory' (compatível com 3.11+/3.12/3.13)
    def handler_factory(*args, **kwargs):
        return SilentHandler(*args, directory=str(REPO_ROOT), **kwargs)

    try:
        server = ThreadingHTTPServer((host, port), handler_factory)
    except Exception as exc:
        os.chdir(prev_cwd)
        raise RuntimeError(
            f"Erro ao criar servidor estático em {host}:{port} "
            f"usando {SilentHandler.__name__}. Dir base: {REPO_ROOT}. "
            f"Classe: {type(exc).__name__}. Detalhe: {exc}"
        ) from exc

    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://{host}:{port}"
    finally:
        server.shutdown()
        thread.join()
        os.chdir(prev_cwd)


@pytest.fixture(scope="session")
def base_url(static_server):
    """
    URL base utilizada pelos testes (dinâmica).
    """
    return static_server.rstrip("/")


@pytest.fixture
def auth_token():
    # Token fictício usado somente para simulação de autenticação em localStorage
    return "TEST_FAKE_TOKEN_123"


# Detecta se o plugin pytest-playwright já fornece 'page'
try:
    from playwright.sync_api import Page  # type: ignore  # noqa: F401

    PLUGIN_MODE = True
except Exception:
    PLUGIN_MODE = False


if not PLUGIN_MODE:
    # Fallback manual
    from playwright.sync_api import sync_playwright

    @pytest.fixture(scope="session")
    def _playwright():
        with sync_playwright() as p:
            yield p

    @pytest.fixture(scope="session")
    def browser(_playwright):
        # headless=True para CI
        browser = _playwright.chromium.launch(headless=True)
        yield browser
        browser.close()

    @pytest.fixture(scope="function")
    def context(browser):
        ctx = browser.new_context()
        yield ctx
        ctx.close()

    @pytest.fixture(scope="function")
    def page(context):
        p = context.new_page()
        yield p
        p.close()
