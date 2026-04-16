import { useEffect, useState } from "react";

type Task = {
  id: number;
  text: string;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");

  const API = "https://SEU-BACKEND.onrender.com";

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`);
    const data = await res.json();
    setTasks(data);
  }

  async function addTask() {
    if (!text) return;

    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setText("");
  }

  async function deleteTask(id: number) {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Meu Planejador
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border p-2 rounded"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nova tarefa..."
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 rounded"
          >
            +
          </button>
        </div>

        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex justify-between items-center bg-gray-50 p-2 rounded"
            >
              <span>{task.text}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
