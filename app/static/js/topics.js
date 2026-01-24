const token = localStorage.getItem("token")

async function loadTopics() {
  const [topicsRes, progressRes] = await Promise.all([
    fetch("/api/topics/", {
      headers: { "Authorization": "Bearer " + token }
    }),
    fetch("/api/progress/", {
      headers: { "Authorization": "Bearer " + token }
    })
  ])

  const topics = await topicsRes.json()
  const progress = await progressRes.json()

  const completedTopics = progress
    .filter(p => p.completed)
    .map(p => p.topic_id)

  const list = document.getElementById("topics-list")
  list.innerHTML = ""

  topics.forEach(t => {
    const li = document.createElement("li")

    if (completedTopics.includes(t.id)) {
      li.classList.add("completed")
    }

    li.innerHTML = `
      <a href="/topic/${t.id}">
        ${t.chapter}. ${t.title}
      </a>
    `

    list.appendChild(li)
  })
}

loadTopics()
