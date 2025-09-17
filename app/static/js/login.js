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
      const body = new URLSearchParams();
      body.append('username', username);
      body.append('password', password);

      const resp = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });

      const data = await resp.json();

      if (!resp.ok) {
        out.textContent = data.detail || data.message || 'Falha no login.';
        return;
      }

      if (!data.access_token) {
        out.textContent = 'Token ausente na resposta.';
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      out.textContent = 'Login OK. Redirecionando...';

      setTimeout(() => {
        window.location.href = '/curso/1a-prefacio.html';
      }, 600);
    } catch (err) {
      out.textContent = 'Erro de rede.';
      console.error(err);
    }
  });
});
