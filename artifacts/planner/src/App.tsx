import { useEffect, useState } from "react";

const API = "https://digital-planner-optimizer-1-4.onrender.com";

type Task = {
  id: number;
  text: string;
};

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");

  async function register() {
    await fetch(`${API}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password }),
    });
    alert("Usuário criado!");
  }

  async function login() {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert("Erro no login");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  }

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: token! },
    });
    const data = await res.json();
    setTasks(data);
  }

  async function addTask() {
    if (!text.trim()) return;

    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token!,
      },
      body: JSON.stringify({ text }),
    });

    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
    setText("");
  }

  async function deleteTask(id: number) {
    await fetch(`${API}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: token! },
    });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    if (token) loadTasks();
  }, [token]);

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ marginBottom: 15 }}>Login / Cadastro</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Entrar
          </button>

          <button onClick={register} style={styles.buttonSecondary}>
            Criar conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ marginBottom: 10 }}>🧠 Meu Planejador</h1>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>

        <div style={styles.row}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nova tarefa..."
            style={styles.input}
          />
          <button onClick={addTask} style={styles.addButton}>
            +
          </button>
        </div>

        <div>
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
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    fontFamily: "Inter, system-ui",
  },

  card: {
    width: 360,
    background: "#ffffff",
    padding: 24,
    borderRadius: 20,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    position: "relative",
  },

  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    outline: "none",
  },

  button: {
    width: "100%",
    padding: 12,
    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    marginBottom: 10,
    cursor: "pointer",
    fontWeight: "600",
  },

  buttonSecondary: {
    width: "100%",
    padding: 12,
    background: "#f1f5f9",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "500",
  },

  logout: {
    position: "absolute",
    top: 15,
    right: 15,
    background: "#fee2e2",
    border: "none",
    color: "#b91c1c",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
  },

  row: {
    display: "flex",
    gap: 8,
    marginBottom: 15,
  },

  addButton: {
    width: 50,
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 20,
  },

  task: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    background: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
    border: "1px solid #e5e7eb",
  },

  delete: {
    background: "#fee2e2",
    border: "none",
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer",
  },
};
