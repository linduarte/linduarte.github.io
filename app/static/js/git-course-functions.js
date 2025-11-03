// Limpa tokens no logout (form padrão e botões/links logout-btn)
document.addEventListener('DOMContentLoaded', function() {
  // Para formulários de logout
  const logoutForms = document.querySelectorAll('form.logout-form');
  logoutForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
  });
  // Para botões ou links de logout
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
  });
});

        // Global 401 handler
console.log("✅ Script loaded successfully!");


        function handle401(response) {
          if (response.status === 401) {
          alert('Sessão expirada. Faça login novamente.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = 'login.html';
          return true;
        }
    return false;
}

// Intercept fetch calls that modify progress and signal other tabs/pages.
// This avoids editing every handler: when a POST/PUT/DELETE to /progress succeeds
// we write a timestamp to localStorage (for cross-tab notifications) and
// dispatch a custom event (for same-tab listeners).
(function() {
  if (!window.fetch) return; // very old browsers
  const _origFetch = window.fetch.bind(window);
  window.fetch = async function(resource, init) {
    const response = await _origFetch(resource, init);
    try {
      const method = (init && init.method) ? String(init.method).toUpperCase() : 'GET';
      const url = (typeof resource === 'string') ? resource : (resource && resource.url) || '';
      if (url && url.indexOf('/progress') !== -1 && ['POST','PUT','DELETE'].includes(method) && response && response.ok) {
        try {
          const ts = Date.now().toString();
          // localStorage change will trigger storage event in OTHER tabs
          localStorage.setItem('progressUpdated', ts);
        } catch (err) {
          // ignore (e.g., private mode)
        }
        try {
          // Dispatch a same-tab event so pages in the same window can react immediately
          window.dispatchEvent(new CustomEvent('progressUpdated', { detail: { timestamp: Date.now() } }));
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // swallow any observation errors
      console.error('fetch-observer', err);
    }
    return response;
  };
})();

        function hideProgressMenu() {
          document.getElementById('progress-content').style.display = 'none';
        }
        async function fetchSummary(content) {
          const token = localStorage.getItem('access_token');
          content.innerHTML = 'Carregando...';
          const response = await fetch('/progress/summary', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (handle401(response)) return;
          const data = await response.json();
          content.innerHTML = `<b>Total:</b> ${data.total}<br><b>Concluídos:</b> ${data.concluidos}<br><b>Pendentes:</b> ${data.pendentes}<br><b>Tópicos concluídos:</b> ${data.completados?.join(', ') || 'Nenhum'}`;
        }
        async function fetchList(content) {
          const token = localStorage.getItem('access_token');
          content.innerHTML = 'Carregando...';
          const response = await fetch('/progress', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (handle401(response)) return;
          const data = await response.json();
          if(data.length === 0) { content.innerHTML = 'Nenhum progresso registrado.'; return; }
          content.innerHTML = `<ul>${data.map(p => `<li>ID: ${p.id}, Tópico: ${p.topic_id}, Concluído: ${p.completed}, Feedback: ${p.feedback || '-'}</li>`).join('')}</ul>`;
        }
        function showCreateForm(content) {
          content.innerHTML = `<form id='formCreate'><label>ID do Tópico:</label><input type='number' name='topic_id' required><label>Concluído?</label><select name='completed'><option value='true'>Sim</option><option value='false'>Não</option></select><label>Feedback:</label><textarea name='feedback'></textarea><button type='submit' class='form-btn'>Registrar</button></form><div id='resultCreate'></div>`;
          content.innerHTML = `<form id='formCreate'>
            <label for='topic_id'>Tópico:</label>
            <select name='topic_id' id='topic_id' required class='form-select'></select>
            <label>Concluído?</label>
            <select name='completed'><option value='true'>Sim</option><option value='false'>Não</option></select>
            <label>Feedback:</label>
            <textarea name='feedback'></textarea>
            <button type='submit' class='form-btn'>Registrar</button>
          </form><div id='resultCreate'></div>`;
          // Preencher lista de tópicos
          const token = localStorage.getItem('access_token');
          fetch('/topics', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => {
              if (handle401(r)) return Promise.reject('401');
              return r.json();
            })
            .then(topics => {
              const select = document.getElementById('topic_id');
              select.innerHTML = topics.map(t => `<option value='${t.id}'>${t.id} - ${t.title}</option>`).join('');
            });
          document.getElementById('formCreate').onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            const body = {
              topic_id: parseInt(form.topic_id.value),
              completed: form.completed.value === 'true',
              feedback: form.feedback.value
            };
            const response = await fetch('/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
            });
            if (handle401(response)) return;
            const result = await response.json();
            document.getElementById('resultCreate').innerText = response.ok ? 'Progresso registrado!' : `Erro: ${result.detail}`;
          };
        }
        function showUpdateForm(content) {
          content.innerHTML = `<form id='formUpdate'><label>ID do Progresso:</label><input type='number' name='progress_id' required><label>Concluído?</label><select name='completed'><option value='true'>Sim</option><option value='false'>Não</option></select><label>Feedback:</label><textarea name='feedback'></textarea><button type='submit' class='form-btn'>Atualizar</button></form><div id='resultUpdate'></div>`;
          content.innerHTML = `<form id='formUpdate'>
            <label for='progress_id'>Progresso:</label>
            <select name='progress_id' id='progress_id' required class='form-select'></select>
            <label>Concluído?</label>
            <select name='completed'><option value='true'>Sim</option><option value='false'>Não</option></select>
            <label>Feedback:</label>
            <textarea name='feedback'></textarea>
            <button type='submit' class='form-btn'>Atualizar</button>
          </form><div id='resultUpdate'></div>`;
          // Preencher lista de progressos
          const token = localStorage.getItem('access_token');
          fetch('/progress', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => {
              if (handle401(r)) return Promise.reject('401');
              return r.json();
            })
            .then(progressos => {
              const select = document.getElementById('progress_id');
              select.innerHTML = progressos.map(p => `<option value='${p.id}'>${p.id} - Tópico ${p.topic_id} (${p.completed ? 'Concluído' : 'Pendente'})</option>`).join('');
            });
          document.getElementById('formUpdate').onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            const body = {
              completed: form.completed.value === 'true',
              feedback: form.feedback.value
            };
            const progressId = form.progress_id.value;
            const response = await fetch(`/progress/${progressId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify(body)
            });
            if (handle401(response)) return;
            const result = await response.json();
            document.getElementById('resultUpdate').innerText = response.ok ? 'Progresso atualizado!' : `Erro: ${result.detail}`;
          };
        }
        function showDeleteForm(content) {
          content.innerHTML = `<form id='formDelete'><label>ID do Progresso:</label><input type='number' name='progress_id' required><button type='submit' class='form-btn'>Deletar</button></form><div id='resultDelete'></div>`;
          content.innerHTML = `<form id='formDelete'>
            <label for='progress_id_del'>Progresso:</label>
            <select name='progress_id' id='progress_id_del' required class='form-select'></select>
            <button type='submit' class='form-btn'>Deletar</button>
          </form><div id='resultDelete'></div>`;
          // Preencher lista de progressos
          const token = localStorage.getItem('access_token');
          fetch('/progress', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => {
              if (handle401(r)) return Promise.reject('401');
              return r.json();
            })
            .then(progressos => {
              const select = document.getElementById('progress_id_del');
              select.innerHTML = progressos.map(p => `<option value='${p.id}'>${p.id} - Tópico ${p.topic_id} (${p.completed ? 'Concluído' : 'Pendente'})</option>`).join('');
            });
          document.getElementById('formDelete').onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            const progressId = form.progress_id.value;
            const response = await fetch(`/progress/${progressId}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (handle401(response)) return;
            const result = await response.json();
            document.getElementById('resultDelete').innerText = response.ok ? 'Progresso deletado!' : `Erro: ${result.detail}`;
          };
        }

// Attach optimistic handler for the standard "Concluído" button (#markCompletedButton).
// Idempotent and safe to call multiple times. It will attach immediately if the button
// exists or on DOMContentLoaded otherwise.
function attachMarkCompletedHandler() {
  const hook = () => {
    try {
      const btn = document.getElementById('markCompletedButton');
      if (!btn) return;
      if (btn.dataset.progressHandlerAttached) return; // already attached
      btn.dataset.progressHandlerAttached = '1';
      btn.addEventListener('click', async () => {
        const origText = btn.innerText;
        btn.disabled = true;
        btn.innerText = 'Enviando...';
        const token = localStorage.getItem('access_token');
        const topicId = btn.dataset.topicId;
        try {
          const response = await fetch(`${window.API_URL || 'http://191.252.204.249:8000'}/progress/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ topic_id: topicId, completed: true, feedback: 'Concluído via UI' })
          });
          if (handle401(response)) return;
          const data = await response.json();
          if (response.ok) {
            btn.innerText = 'Concluído ✓';
            btn.classList.add('completed');
          } else {
            btn.disabled = false;
            btn.innerText = origText;
            alert('Erro ao marcar o progresso');
          }
        } catch (err) {
          btn.disabled = false;
          btn.innerText = origText;
          alert('Erro de conexão ao marcar progresso');
        }
      });
    } catch (err) {
      console.error('attachMarkCompletedHandler', err);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hook);
  } else {
    hook();
  }
}

// Auto-attach on script load for convenience
try { attachMarkCompletedHandler(); } catch (e) { /* ignore */ }
