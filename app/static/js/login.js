document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const out = document.getElementById('loginResult');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        out.textContent = 'Autenticando...';
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        if (!username || !password) {
            out.textContent = 'Informe usuário e senha.';
            return;
        }
        try {
            const resp = await apiForm('/auth/login', { username, password });
            const data = await safeParseJSON(resp);
            if (!resp.ok) {
                out.textContent = data.detail || data.message || 'Falha no login.';
                return;
            }
            if (data.__nonJson) {
                out.textContent = 'Resposta inesperada do servidor (HTML).';
                return;
            }
            if (!data.access_token) {
                out.textContent = 'Token ausente na resposta.';
                return;
            }
            localStorage.setItem('access_token', data.access_token);
            out.textContent = 'Login OK. Redirecionando...';
            setTimeout(() => {
                window.location.href = '1-index.html';
            }, 600);
        } catch (err) {
            out.textContent = 'Erro de rede.';
            console.error(err);
        }
    });
});
