import { useEffect, useState } from "react";

type Task = {
  id: number;
  text: string;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");

  const API = "https://digital-planner-optimizer-1-4.onrender.com";

  async function loadTasks() {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.log("Erro ao carregar tarefas", err);
    }
  }

  async function addTask() {
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setText("");
    } catch (err) {
      console.log("Erro ao adicionar tarefa", err);
    }
  }

  async function deleteTask(id: number) {
    try {
      await fetch(`${API}/tasks/${id}`, {
        method: "DELETE",
      });

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.log("Erro ao deletar tarefa", err);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🧠 Meu Planejador</h1>

        <div style={styles.row}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nova tarefa..."
            style={styles.input}
          />
          <button onClick={addTask} style={styles.button}>
            Adicionar
          </button>
        </div>

        <div style={styles.list}>
          {tasks.map((task) => (
            <div key={task.id} style={styles.task}>
              <span>{task.text}</span>
              <button
                onClick={() => deleteTask(task.id)}
                style={styles.delete}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f1f5f9",
    fontFamily: "system-ui",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
  },
  button: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  task: {
    display: "flex",
    justifyContent: "space-between",
    padding: 10,
    background: "#f8fafc",
    borderRadius: 8,
  },
  delete: {
    background: "transparent",
    border: "none",
    color: "red",
    cursor: "pointer",
  },
};
