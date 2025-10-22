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
