import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pkg from "pg";

const { Pool } = pkg;

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Sem token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

app.get("/", async (req, res) => {
  res.json({ ok: true, message: "API online" });
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const exists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hash]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro no /register:", error);
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

    return res.json({ token });
  } catch (error) {
    console.error("Erro no /login:", error);
    return res.status(500).json({ error: "Erro ao fazer login" });
  }
});

app.get("/tasks", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, text FROM tasks WHERE user_id = $1 ORDER BY id DESC",
      [req.userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro no GET /tasks:", error);
    return res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
});

app.post("/tasks", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Texto da tarefa é obrigatório" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (text, user_id) VALUES ($1, $2) RETURNING id, text",
      [text.trim(), req.userId]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro no POST /tasks:", error);
    return res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro no DELETE /tasks:", error);
    return res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

const PORT = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar banco:", error);
    process.exit(1);
  });
