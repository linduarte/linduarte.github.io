# -----------------------------------------------------------
# Próximos passos recomendados:
# 1. Segurança:
#    - Trocar hash SHA256 por passlib (bcrypt/argon2).
#    - Mover JWT_SECRET para variável de ambiente real.
#    - Remover rota GET /auth/register/test antes de produção.
# 2. Persistência:
#    - Substituir _progress_store e _users por DB (SQLite + SQLModel ou SQLAlchemy).
#    - Criar migrações (alembic) se for crescer.
# 3. Autenticação:
#    - Implementar refresh token ou expiração curta + re-login.
#    - Adicionar rota /auth/me para retornar dados do usuário logado.
# 4. Validações:
#    - Impedir duplicação de progresso por (user, topic_id) se for regra.
#    - Adicionar limites (rate limiting) a /auth/login.
# 5. Observabilidade:
#    - Incluir /metrics (Prometheus) ou logs estruturados.
# 6. Frontend:
#    - Ajustar formulário de login para enviar POST x-www-form-urlencoded para /auth/login e salvar token.
#    - Ao carregar páginas protegidas, redirecionar se não houver token.
# 7. Deploy:
#    - Backend: configurar HTTPS (reverse proxy ou plataforma).
#    - Ajustar CORS para somente origens finais (remover localhost após produção).
# 8. Qualidade:
#    - Adicionar testes (pytest + httpx) para auth e progress.
#    - Pre-commit: adicionar mypy/ruff (se quiser).
# 9. Hardening:
#    - Limitar tamanho de payload.
#    - Adicionar headers de segurança (Starlette Middleware / proxy).
# 10. Roadmap extra:
#     - Paginação /progress?skip=&limit=
#     - Filtro /progress?completed=true
# -----------------------------------------------------------
import hashlib  # garante: 'hashlib' (NÃO 'haslib'); ambos são stdlib
import json
import os
import time  # added
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Substitui import direto de jwt por bloco protegido
try:
    import jwt  # type: ignore
except ImportError:
    jwt = None  # type: ignore  # PyJWT ausente; instale com: pip install PyJWT

# --- Config ---
BASE_DIR = Path(__file__).parent
FRONT_INDEX = BASE_DIR / "index.html"
STATIC_DIR = BASE_DIR / "app" / "static"

app = FastAPI(title="Git Course Mock API")

START_TIME = time.time()  # added
API_VERSION = "0.1.0"  # added
JWT_SECRET = os.getenv("JWT_SECRET", "dev-insecure-secret")  # NÃO usar em produção
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://localhost:9000",
    "http://127.0.0.1:9000",
    "https://linduarte.github.io",
    "https://git-learn.com.br",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Monta arquivos estáticos para servir assets locais
if STATIC_DIR.exists():
    app.mount("/app/static", StaticFiles(directory=STATIC_DIR), name="static")


# --- Models (mock) ---
class ProgressCreate(BaseModel):
    topic_id: int
    completed: bool
    feedback: Optional[str] = None


class ProgressUpdate(BaseModel):
    completed: Optional[bool] = None
    feedback: Optional[str] = None


class ProgressOut(BaseModel):
    id: int
    topic_id: int
    completed: bool
    feedback: Optional[str]


class User(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    disabled: bool = False
    password_hash: str


class UserOut(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None


# --- In-memory store ---
_progress_store: List[ProgressOut] = []
_next_id = 1

_users: dict[str, User] = {}


def get_next_id():
    global _next_id
    _next_id += 1
    return _next_id - 1


def hash_password(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def verify_password(raw: str, hashed: str) -> bool:
    return hash_password(raw) == hashed


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    if jwt is None:
        raise HTTPException(
            status_code=500,
            detail="Dependência PyJWT ausente. Instale com: pip install PyJWT",
        )
    to_encode = data.copy()
    exp = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": exp})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> "User":
    if jwt is None:
        raise HTTPException(
            status_code=500,
            detail="Dependência PyJWT ausente. Instale com: pip install PyJWT",
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if not username or username not in _users:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    user = _users[username]
    if user.disabled:
        raise HTTPException(status_code=400, detail="Usuário desativado")
    return user


# --- Auth Routes ---
@app.post("/auth/register", response_model=UserOut)
def register(
    payload: Optional[RegisterRequest] = None,
    username: Optional[str] = None,
    password: Optional[str] = None,
    email: Optional[str] = None,
    full_name: Optional[str] = None,
):
    """
    Registro de usuário.
    Aceita (prioridade):
    1) JSON body: { "username": "...", "password": "...", "email": "...", "full_name": "..." }
    2) Query params (POST): /auth/register?username=...&password=...
    """
    if payload:
        username = payload.username
        password = payload.password
        email = payload.email
        full_name = payload.full_name

    if not username or not password:
        raise HTTPException(status_code=422, detail="username e password obrigatórios")

    if username in _users:
        raise HTTPException(status_code=400, detail="Usuário já existe")

    _users[username] = User(
        username=username,
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
    )
    return UserOut(username=username, full_name=full_name, email=email)


@app.get("/auth/register/test", response_model=UserOut)
def register_test(
    username: str,
    password: str,
    email: Optional[str] = None,
    full_name: Optional[str] = None,
):
    """
    Rota somente para teste rápido via navegador.
    NÃO usar em produção (credenciais em URL).
    """
    if username in _users:
        raise HTTPException(status_code=400, detail="Usuário já existe")
    _users[username] = User(
        username=username,
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
    )
    return UserOut(username=username, full_name=full_name, email=email)


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = _users.get(form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Login inválido"
        )
    token = create_access_token({"sub": user.username})
    return Token(access_token=token)


# --- Routes ---


@app.get("/health")
def health(pretty: bool = False):
    payload = {
        "status": "ok",
        "app": "Git Course Mock API",
        "version": API_VERSION,  # added
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "items_in_memory": len(_progress_store),
        "uptime_seconds": round(time.time() - START_TIME, 2),  # added
    }
    if pretty:
        return Response(
            content=json.dumps(payload, indent=2, ensure_ascii=False),
            media_type="application/json",
        )
    return payload


@app.get("/health/html", response_class=HTMLResponse)
def health_html():
    payload = {
        "status": "ok",
        "app": "Git Course Mock API",
        "version": API_VERSION,  # added
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "items_in_memory": len(_progress_store),
        "uptime_seconds": round(time.time() - START_TIME, 2),  # added
    }
    return f"""
    <html>
      <head><title>Health Check</title></head>
      <body style="font-family:Arial;max-width:640px;margin:40px auto;">
        <h2>Health Status</h2>
        <pre style="background:#222;color:#9f9;padding:12px;border-radius:6px;">{json.dumps(payload, indent=2, ensure_ascii=False)}</pre>
      </body>
    </html>
    """


@app.get("/")
def root():
    if FRONT_INDEX.exists():
        return FileResponse(FRONT_INDEX)
    return {"message": "index.html não encontrado"}


@app.get("/progress/summary")
def progress_summary(current_user: User = Depends(get_current_user)):
    total = 15  # número total de tópicos definido no curso
    concluidos = sum(1 for p in _progress_store if p.completed)
    pendentes = total - concluidos
    completados = [p.topic_id for p in _progress_store if p.completed]
    return {
        "total": total,
        "concluidos": concluidos,
        "pendentes": pendentes,
        "completados": completados,
    }


@app.get("/progress", response_model=List[ProgressOut])
def list_progress(current_user: User = Depends(get_current_user)):
    return _progress_store


@app.post("/progress", response_model=ProgressOut)
def create_progress(
    item: ProgressCreate, current_user: User = Depends(get_current_user)
):
    record = ProgressOut(
        id=get_next_id(),
        topic_id=item.topic_id,
        completed=item.completed,
        feedback=item.feedback,
    )
    _progress_store.append(record)
    return record


@app.put("/progress/{progress_id}", response_model=ProgressOut)
def update_progress(
    progress_id: int,
    payload: ProgressUpdate,
    current_user: User = Depends(get_current_user),
):
    for idx, rec in enumerate(_progress_store):
        if rec.id == progress_id:
            updated = rec.copy(update=payload.dict(exclude_unset=True))
            _progress_store[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Progresso não encontrado")


@app.delete("/progress/{progress_id}")
def delete_progress(progress_id: int, current_user: User = Depends(get_current_user)):
    for idx, rec in enumerate(_progress_store):
        if rec.id == progress_id:
            _progress_store.pop(idx)
            return {"deleted": progress_id}
    raise HTTPException(status_code=404, detail="Progresso não encontrado")


@app.delete("/progress/reset")
def reset_progress(current_user: User = Depends(get_current_user)):
    """Limpa todos os registros de progresso (uso somente em ambiente de teste)."""
    global _next_id
    _progress_store.clear()
    _next_id = 1
    return {"reset": True, "items_in_memory": len(_progress_store)}
