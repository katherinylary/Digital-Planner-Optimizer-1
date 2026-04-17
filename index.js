import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "segredo_super_secreto";

// ===== BANCO SIMPLES (memória) =====
let users = [];
let tasks = [];

// ===== MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Sem token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// ===== AUTH =====

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const userExists = users.find(u => u.email === email);
  if (userExists) return res.status(400).json({ error: "Usuário já existe" });

  const hash = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    email,
    password: hash
  };

  users.push(user);

  res.json({ ok: true });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Senha inválida" });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ token });
});

// ===== TASKS =====

app.get("/tasks", auth, (req, res) => {
  const userTasks = tasks.filter(t => t.userId === req.userId);
  res.json(userTasks);
});

app.post("/tasks", auth, (req, res) => {
  const task = {
    id: Date.now(),
    text: req.body.text,
    userId: req.userId
  };

  tasks.push(task);
  res.json(task);
});

app.delete("/tasks/:id", auth, (req, res) => {
  tasks = tasks.filter(
    t => t.id != req.params.id || t.userId !== req.userId
  );

  res.json({ ok: true });
});

// ===== START =====

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API rodando com login 🚀");
});
