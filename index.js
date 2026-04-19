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
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT false,
      created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
    );
  `);

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

  await pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS title TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS date TEXT,
    ADD COLUMN IF NOT EXISTS time TEXT,
    ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Autocuidado',
    ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at BIGINT;
  `);

  await pool.query(`
    UPDATE tasks
    SET created_at = EXTRACT(EPOCH FROM NOW()) * 1000
    WHERE created_at IS NULL;
  `);

  await pool.query(`
    UPDATE tasks
    SET
      title = COALESCE(title, text),
      completed = COALESCE(completed, false),
      priority = COALESCE(priority, 'medium'),
      category = COALESCE(category, 'Autocuidado'),
      created_at = COALESCE(created_at, EXTRACT(EPOCH FROM NOW()) * 1000)
    WHERE title IS NULL
       OR completed IS NULL
       OR priority IS NULL
       OR category IS NULL
       OR created_at IS NULL;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      end_time TEXT,
      description TEXT,
      category TEXT NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_participants (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(event_id, user_id)
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
      `
      SELECT
        id::text AS id,
        COALESCE(title, text) AS title,
        description,
        date,
        time,
        priority,
        category,
        completed,
        created_at AS "createdAt"
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
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
    const {
      title,
      description = "",
      date = null,
      time = null,
      priority = "medium",
      category = "Autocuidado",
      completed = false,
      createdAt = Date.now(),
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Título da tarefa é obrigatório" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
        (text, title, description, date, time, priority, category, completed, created_at, user_id)
      VALUES
        ($1,   $2,    $3,          $4,   $5,   $6,       $7,       $8,        $9,         $10)
      RETURNING
        id::text AS id,
        title,
        description,
        date,
        time,
        priority,
        category,
        completed,
        created_at AS "createdAt"
      `,
      [
        title.trim(),
        title.trim(),
        description,
        date,
        time,
        priority,
        category,
        completed,
        createdAt,
        req.userId,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro no POST /tasks:", error);
    return res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

app.patch("/tasks/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      priority,
      category,
      completed,
    } = req.body;

    const current = await pool.query(
      `
      SELECT *
      FROM tasks
      WHERE id = $1 AND user_id = $2
      `,
      [req.params.id, req.userId]
    );

    const task = current.rows[0];

    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const nextTitle = title ?? task.title ?? task.text;
    const nextDescription = description ?? task.description;
    const nextDate = date ?? task.date;
    const nextTime = time ?? task.time;
    const nextPriority = priority ?? task.priority;
    const nextCategory = category ?? task.category;
    const nextCompleted = completed ?? task.completed;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        text = $1,
        title = $2,
        description = $3,
        date = $4,
        time = $5,
        priority = $6,
        category = $7,
        completed = $8
      WHERE id = $9 AND user_id = $10
      RETURNING
        id::text AS id,
        title,
        description,
        date,
        time,
        priority,
        category,
        completed,
        created_at AS "createdAt"
      `,
      [
        nextTitle,
        nextTitle,
        nextDescription,
        nextDate,
        nextTime,
        nextPriority,
        nextCategory,
        nextCompleted,
        req.params.id,
        req.userId,
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro no PATCH /tasks:", error);
    return res.status(500).json({ error: "Erro ao atualizar tarefa" });
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

app.get("/events", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT DISTINCT
        e.id::text AS id,
        e.title,
        e.date,
        e.time,
        e.end_time AS "endTime",
        e.description,
        e.category,
        e.user_id::text AS "ownerId",
        u.email AS "ownerEmail",
        CASE
          WHEN e.user_id = $1 THEN true
          ELSE false
        END AS "isOwner"
      FROM events e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN event_participants ep ON ep.event_id = e.id
      WHERE e.user_id = $1 OR ep.user_id = $1
      ORDER BY e.date ASC, e.time ASC
      `,
      [req.userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Erro no GET /events:", error);
    return res.status(500).json({ error: "Erro ao buscar eventos" });
  }
});

app.post("/events", auth, async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      endTime = null,
      description = "",
      category = "Pessoal",
      participantEmails = [],
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Título é obrigatório" });
    }

    if (!date || !time) {
      return res.status(400).json({ error: "Data e hora são obrigatórias" });
    }

    const inserted = await pool.query(
      `
      INSERT INTO events
        (title, date, time, end_time, description, category, user_id)
      VALUES
        ($1,    $2,   $3,   $4,       $5,          $6,       $7)
      RETURNING
        id,
        title,
        date,
        time,
        end_time AS "endTime",
        description,
        category,
        user_id::text AS "ownerId"
      `,
      [title.trim(), date, time, endTime, description, category, req.userId]
    );

    const event = inserted.rows[0];

    if (Array.isArray(participantEmails) && participantEmails.length > 0) {
      const cleanEmails = [
        ...new Set(
          participantEmails
            .map((email) => String(email).trim().toLowerCase())
            .filter(Boolean)
        ),
      ];

      if (cleanEmails.length > 0) {
        const usersResult = await pool.query(
          `
          SELECT id, email
          FROM users
          WHERE LOWER(email) = ANY($1)
          `,
          [cleanEmails]
        );

        for (const user of usersResult.rows) {
          if (user.id !== req.userId) {
            await pool.query(
              `
              INSERT INTO event_participants (event_id, user_id)
              VALUES ($1, $2)
              ON CONFLICT (event_id, user_id) DO NOTHING
              `,
              [event.id, user.id]
            );

            await pool.query(
              `
              INSERT INTO notifications (user_id, message)
              VALUES ($1, $2)
              `,
              [user.id, `Você foi convidado para o evento: ${event.title}`]
            );
          }
        }
      }
    }

    return res.json({
      ...event,
      id: String(event.id),
      isOwner: true,
    });
  } catch (error) {
    console.error("Erro no POST /events:", error);
    return res.status(500).json({ error: "Erro ao criar evento" });
  }
});

app.patch("/events/:id", auth, async (req, res) => {
  try {
    const current = await pool.query(
      `
      SELECT *
      FROM events
      WHERE id = $1 AND user_id = $2
      `,
      [req.params.id, req.userId]
    );

    const event = current.rows[0];

    if (!event) {
      return res
        .status(404)
        .json({ error: "Evento não encontrado ou você não pode editar este evento" });
    }

    const nextTitle = req.body.title ?? event.title;
    const nextDate = req.body.date ?? event.date;
    const nextTime = req.body.time ?? event.time;
    const nextEndTime = req.body.endTime ?? event.end_time;
    const nextDescription = req.body.description ?? event.description;
    const nextCategory = req.body.category ?? event.category;
    const participantEmails = Array.isArray(req.body.participantEmails)
      ? req.body.participantEmails
      : null;

    const result = await pool.query(
      `
      UPDATE events
      SET
        title = $1,
        date = $2,
        time = $3,
        end_time = $4,
        description = $5,
        category = $6
      WHERE id = $7 AND user_id = $8
      RETURNING
        id::text AS id,
        title,
        date,
        time,
        end_time AS "endTime",
        description,
        category,
        user_id::text AS "ownerId"
      `,
      [
        nextTitle,
        nextDate,
        nextTime,
        nextEndTime,
        nextDescription,
        nextCategory,
        req.params.id,
        req.userId,
      ]
    );

    if (participantEmails) {
      await pool.query(
        DELETE FROM event_participants WHERE event_id = $1,
        [req.params.id]
      );

      const cleanEmails = [
        ...new Set(
          participantEmails
            .map((email) => String(email).trim().toLowerCase())
            .filter(Boolean)
        ),
      ];

      if (cleanEmails.length > 0) {
        const usersResult = await pool.query(
          `
          SELECT id, email
          FROM users
          WHERE LOWER(email) = ANY($1)
          `,
          [cleanEmails]
        );

        for (const user of usersResult.rows) {
          if (user.id !== req.userId) {
            await pool.query(
              `
              INSERT INTO event_participants (event_id, user_id)
              VALUES ($1, $2)
              ON CONFLICT (event_id, user_id) DO NOTHING
              `,
              [req.params.id, user.id]
            );
          }
        }
      }
    }

    return res.json({
      ...result.rows[0],
      isOwner: true,
    });
  } catch (error) {
    console.error("Erro no PATCH /events:", error);
    return res.status(500).json({ error: "Erro ao atualizar evento" });
  }
});

app.delete("/events/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM events WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro no DELETE /events:", error);
    return res.status(500).json({ error: "Erro ao deletar evento" });
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
