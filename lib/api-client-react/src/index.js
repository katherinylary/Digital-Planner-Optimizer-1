import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

let tasks = [];

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    text: req.body.text,
  };

  tasks.push(task);
  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter((t) => t.id != req.params.id);
  res.json({ ok: true });
});

// 🔥 PORTA DO RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API rodando na porta " + PORT);
});
