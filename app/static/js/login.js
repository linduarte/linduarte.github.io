const API_URL = "https://api.git-learn.com.br";  // O URL do seu backend

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: formData.get('username'),
        password: formData.get('password'),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Armazena os tokens no localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.location.href = "topics.html";  // Redireciona para os tópicos
    } else {
      document.getElementById("result").innerText = "Erro: " + data.detail;
    }
  } catch (err) {
    document.getElementById("result").innerText = "Falha na conexão com o servidor.";
  }
});
