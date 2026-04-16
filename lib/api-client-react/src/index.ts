import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// memória temporária (depois vira banco)
let tasks: any[] = [];

// pegar tarefas
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// criar tarefa
app.post("/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    text: req.body.text
  };

  tasks.push(task);
  res.json(task);
});

// deletar tarefa
app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("API rodando");
});
