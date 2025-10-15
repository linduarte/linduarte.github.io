
// app/static/js/config.js
// Configuração global do backend
const API_URL = "https://api.git-learn.com.br"; // Backend na Localweb

const API_CONFIG = {
    development: {
        baseURL: 'http://localhost:8000',
        frontendURL: 'http://localhost:9000'
    },
    production: {
        baseURL: 'https://git-learn.com.br', // <-- SUBSTITUIR pelo backend FastAPI em produção
        frontendURL: 'https://linduarte.github.io'
    }
};

// Enhanced environment detection for Windows/PowerShell
const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '0.0.0.0' ||
                     window.location.protocol === 'file:';

const API_BASE_URL = isDevelopment ? API_CONFIG.development.baseURL : API_CONFIG.production.baseURL;

// Utility function for API calls with enhanced error handling
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem("access_token");
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const config = {
        headers: { ...defaultHeaders, ...options.headers },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Enhanced error handling for different response types
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { message: errorText };
            }
            throw new Error(`API Error ${response.status}: ${errorData.message || errorData.detail || 'Unknown error'}`);
        }

        return response;
    } catch (error) {
        console.error('API call failed:', error);

        // Check if it's a network error (common in dev environment)
        if (error.message.includes('fetch')) {
            console.warn('Network error - make sure backend is running on:', API_BASE_URL);
        }

        throw error;
    }
}

// Função para parse seguro de JSON
async function safeParseJSON(response) {
    const ct = response.headers.get('content-type') || '';
    const text = await response.text();
    if (!ct.includes('application/json')) {
        return { __raw: text, __nonJson: true };
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        return { __raw: text, __parseError: true };
    }
}

// Form POST helper (application/x-www-form-urlencoded)
async function apiForm(endpoint, formObj = {}) {
    const body = new URLSearchParams(formObj);
    const token = localStorage.getItem('access_token');
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers, body });
    return resp;
}

// Debug helper for PowerShell development
function debugApiConfig() {
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current protocol:', window.location.protocol);
}

// Call debug in development
if (isDevelopment) {
    debugApiConfig();
}

// Export (optional pattern for future modularization)
window.API_BASE_URL = API_BASE_URL;
window.apiCall = apiCall;
// Export helpers
window.safeParseJSON = safeParseJSON;
window.apiForm = apiForm;

// Backwards-compatibility runtime fixer
// Some test-artifacts and older templates reference legacy paths like
// '/static/images/...' or '../../static/images/...'. When served from the
// repository root these resolve to non-existent locations and cause noisy
// 404s in audits. Normalize common legacy image paths to the canonical
// '/app/static/images/' at DOMContentLoaded.
function _fixLegacyImagePaths() {
    try {
        const imgs = Array.from(document.getElementsByTagName('img'));
        imgs.forEach((img) => {
            const raw = img.getAttribute('src') || '';
            if (!raw) return;
            // If already correct, skip
            if (raw.startsWith('/app/static/images/') || raw.includes('/app/static/images/')) return;
            // Replace absolute '/static/...' -> '/app/static/...'
            if (raw.startsWith('/static/images/')) {
                img.src = raw.replace('/static/images/', '/app/static/images/');
                return;
            }
            // Replace relative '../../static/...' patterns used in templates
            if (raw.includes('../../static/images/')) {
                img.src = raw.replace(/\.\.\/\.\.\/static\/images\//g, '/app/static/images/');
                return;
            }
            // Replace any remaining occurrences of '/static/images/' anywhere
            if (raw.includes('/static/images/')) {
                img.src = raw.replace('/static/images/', '/app/static/images/');
            }
        });
    } catch (e) {
        // Non-fatal - do not break page
        console.warn('fixLegacyImagePaths failed', e && e.message);
    }
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _fixLegacyImagePaths);
    } else {
        // already ready
        setTimeout(_fixLegacyImagePaths, 0);
    }
}

// Dev notes (Windows PowerShell):
// 1) Create venv (if not exists):  python -m venv .venv
// 2) Activate:  .\.venv\Scripts\Activate.ps1
//    If blocked: Set-ExecutionPolicy -Scope Process RemoteSigned
// 3) Install deps (choose one):
//    pip install fastapi uvicorn[standard]
//    OR (if using uv): uv add fastapi uvicorn[standard]
// 4) Run app (adjust path if main.py is inside app/):
//    python -m uvicorn main:app --reload --port 8000
//    (or) python -m uvicorn app.main:app --reload --port 8000
// 5) Test: http://localhost:8000/docs
// 6) Frontend (static test): python -m http.server 9000  (open http://localhost:9000/index.html)
// 7) If 'uvicorn' not recognized, always use: python -m uvicorn ...
// 8) To confirm import path issues: python - <<EOF
//    import sys, pathlib; print(list(pathlib.Path('.').glob('**/main.py')))
//    EOF
