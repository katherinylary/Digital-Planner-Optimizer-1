import express from "express";
import cors from "cors";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET = "segredo_super_secreto";

// criar tabelas
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT,
      user_id INTEGER
    );
  `);
}

initDB();


// REGISTER
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hash]
    );
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "Usuário já existe" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];

  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Senha inválida" });

  const token = jwt.sign({ id: user.id }, SECRET);

  res.json({ token });
});


// MIDDLEWARE
function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Sem token" });

  try {
    const decoded: any = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}


// TASKS (agora por usuário)
app.get("/tasks", auth, async (req: any, res) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1",
    [req.userId]
  );
  res.json(result.rows);
});

app.post("/tasks", auth, async (req: any, res) => {
  const { text } = req.body;

  const result = await pool.query(
    "INSERT INTO tasks (text, user_id) VALUES ($1, $2) RETURNING *",
    [text, req.userId]
  );

  res.json(result.rows[0]);
});

app.delete("/tasks/:id", auth, async (req: any, res) => {
  await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("API com login 🚀");
});
