const API_URL = "https://api.git-learn.com.br";  // backend

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    const response = await fetch(`${API_URL}/auth/login-html`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.location.href = "topics.html";
    } else {
      document.getElementById("result").innerText = "Erro: " + data.detail;
    }
  } catch (err) {
    document.getElementById("result").innerText = "Falha na conexão com o servidor.";
  }
});
