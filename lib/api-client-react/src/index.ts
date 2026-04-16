import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// 🧠 banco temporário (depois vira banco real)
let tasks: { id: number; text: string }[] = [];

// 📌 pegar tarefas
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// ➕ criar tarefa
app.post("/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    text: req.body.text,
  };

  tasks.push(task);
  res.json(task);
});

// ❌ deletar tarefa
app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter((t) => t.id != Number(req.params.id));
  res.json({ ok: true });
});

// 🚀 porta do Render (OBRIGATÓRIO)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API rodando na porta " + PORT);
});
