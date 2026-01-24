const token = localStorage.getItem("access_token");

async function loadProgress() {
    if (!token) {
        window.location.href = "/landing.html";
        return;
    }

    const [topicsRes, progressRes, summaryRes] = await Promise.all([
        apiCall("/topics/"),
        apiCall("/progress/"),
        apiCall("/progress/summary")
    ]);

    const topics = await topicsRes.json();
    const progress = await progressRes.json();
    const summary = await summaryRes.json();

    renderSummary(summary);
    renderTopics(topics, progress);
}

function renderSummary(summary) {
    const box = document.getElementById("progress-summary");

    box.innerHTML = `
        <p><b>Total de tópicos:</b> ${summary.total_topics}</p>
        <p><b>Concluídos:</b> ${summary.completed_topics}</p>
        <p><b>Progresso:</b> ${summary.completion_rate}%</p>

        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${summary.completion_rate}%"></div>
        </div>
    `;
}

function renderTopics(topics, progress) {
    const list = document.getElementById("progress-topics");
    list.innerHTML = "";

    const completedIds = progress
        .filter(p => p.completed)
        .map(p => p.topic_id);

    topics.forEach(t => {
        const li = document.createElement("li");
        li.classList.add("topic-item");

        if (completedIds.includes(t.id)) {
            li.classList.add("completed");
        }

        li.innerHTML = `
            <a href="/topic/${t.id}">
                ${t.chapter}. ${t.title}
            </a>
        `;

        list.appendChild(li);
    });
}

loadProgress();
