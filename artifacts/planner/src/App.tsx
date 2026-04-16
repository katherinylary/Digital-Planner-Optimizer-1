import { useEffect, useState } from "react";

const API_URL = "https://digital-planner-optimizer-1-4.onrender.com";

type Task = {
  id: number;
  text: string;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // 🔄 carregar tarefas do servidor
  async function loadTasks() {
    const res = await fetch(`${API_URL}/tasks`);
    const data = await res.json();
    setTasks(data);
  }

  // ➕ criar tarefa
  async function addTask() {
    if (!input.trim()) return;

    await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    setInput("");
    loadTasks();
  }

  // ❌ deletar tarefa
  async function deleteTask(id: number) {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    loadTasks();
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Meu Planner</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nova tarefa"
      />
      <button onClick={addTask}>Adicionar</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.text}
            <button onClick={() => deleteTask(task.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
