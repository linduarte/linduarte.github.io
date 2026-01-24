const token = localStorage.getItem("token")

const path = window.location.pathname
const topicId = path.split("/").pop()

async function loadTopic() {
  const res = await fetch(`/api/topics/${topicId}`, {
    headers: { "Authorization": "Bearer " + token }
  })

  const topic = await res.json()

  document.getElementById("title").innerText = topic.title
  document.getElementById("content").innerHTML = topic.content

  await fetch("/api/progress/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      topic_id: topic.id,
      completed: true,
      feedback: null
    })
  })
}

loadTopic()
