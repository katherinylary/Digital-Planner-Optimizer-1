import { useEffect, useState } from "react";

const API = "https://digital-planner-optimizer-1-4.onrender.com";

tipo Tarefa = {
  id: número;
  texto: string;
};

export default function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState("");
  const [senha, definirSenha] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [texto, setTexto] = useState("");

  // ================= LOGIN =================

  função assíncrona register() {
    aguardar fetch(`${API}/register`, {
      método: "POST",
      cabeçalhos: {"Content-Type": "application/json"},
      corpo: JSON.stringify({ email, senha }),
    });
    alert("Usuário criado!");
  }

  função assíncrona login() {
    const res = await fetch(`${API}/login`, {
      método: "POST",
      cabeçalhos: {"Content-Type": "application/json"},
      corpo: JSON.stringify({ email, senha }),
    });

    const data = await res.json();

    se (dados.token) {
      localStorage.setItem("token", data.token);
      setToken(dados.token);
    } outro {
      alert("Erro de login");
    }
  }

  função logout() {
    localStorage.removeItem("token");
    setToken(nulo);
    setTasks([]);
  }

  // ================= TAREFAS =================

  função assíncrona carregarTarefas() {
    const res = await fetch(`${API}/tasks`, {
      cabeçalhos: { Authorization: token! },
    });
    const data = await res.json();
    setTasks(dados);
  }

  função assíncrona adicionarTarefa() {
    se (!text.trim()) retorne;

    const res = await fetch(`${API}/tasks`, {
      método: "POST",
      cabeçalhos: {
        "Content-Type": "application/json",
        Autorização: token!
      },
      corpo: JSON.stringify({ texto }),
    });

    const newTask = await res.json();
    setTasks((anterior) => [...anterior, novaTask]);
    definirTexto("");
  }

  função assíncrona deleteTask(id: número) {
    aguardar fetch(`${API}/tasks/${id}`, {
      método: "EXCLUIR",
      cabeçalhos: { Authorization: token! },
    });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  useEffect(() => {
    se (token) carregarTarefas();
  }, [token]);

  // ================= UI =================

  se (!token) {
    retornar (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Login / Cadastro</h2>

          <entrada
            espaço reservado="E-mail"
            valor={email}
            onChange={(e) => setEmail(e.target.value)}
            estilo={estilos.entrada}
          />

          <entrada
            placeholder="Senha"
            tipo="senha"
            valor={senha}
            onChange={(e) => setPassword(e.target.value)}
            estilo={estilos.entrada}
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

  retornar (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>🧠 Meu Planejador</h1>

        <button onClick={logout} style={styles.logout}>
          Sair
        </button>

        <div style={styles.row}>
          <entrada
            valor={texto}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nova tarefa..."
            estilo={estilos.entrada}
          />
          <button onClick={addTask} style={styles.button}>
            +
          </button>
        </div>

        <div>
          {tasks.map((task) => (
            <div key={task.id} style={styles.task}>
              <span>{task.text}</span>
              <button onClick={() => deleteTask(task.id)}>❌</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= ESTILO =================

const styles: any = {
  página: {
    altura: "100vh",
    exibir: "flex",
    justifyContent: "centro",
    alignItems: "center",
    fundo: "#f1f5f9",
    fontFamily: "system-ui",
  },
  cartão: {
    largura: 350,
    fundo: "#fff",
    acolchoamento: 20,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  entrada: {
    largura: "100%",
    acolchoamento: 10,
    margemInferior: 10,
    borderRadius: 8,
    borda: "1px sólida #ddd",
  },
  botão: {
    largura: "100%",
    acolchoamento: 10,
    fundo: "#4f46e5",
    cor: "#fff",
    fronteira: "nenhuma",
    borderRadius: 8,
    margemInferior: 10,
    cursor: "ponteiro",
  },
  botãoSecundário: {
    largura: "100%",
    acolchoamento: 10,
    fundo: "#e5e7eb",
    fronteira: "nenhuma",
    borderRadius: 8,
    cursor: "ponteiro",
  },
  Sair: {
    fundo: "transparente",
    fronteira: "nenhuma",
    cor: "vermelho",
    flutuar: "direita",
    cursor: "ponteiro",
  },
  linha: {
    exibir: "flex",
    intervalo: 10,
    margemInferior: 15,
  },
  tarefa: {
    exibir: "flex",
    justifyContent: "espaço-entre",
    acolchoamento: 10,
    fundo: "#f8fafc",
    borderRadius: 8,
    margemInferior: 8,
  },
};
