import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Helper: get today's date key (YYYY-MM-DD)
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// --------------------
// Health Check
// --------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --------------------
// DB Init + Seed (MVP)
// --------------------
app.get("/db/init", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        emoji TEXT NOT NULL,
        time TEXT NOT NULL,
        is_critical BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        date_iso TEXT NOT NULL,
        done_at_iso TEXT NOT NULL
      );
    `);

    // Seed default data only if empty
    const uCount = await pool.query(`SELECT COUNT(*)::int AS c FROM users;`);
    if (uCount.rows[0].c === 0) {
      await pool.query(`
        INSERT INTO users (id, name, role) VALUES
        ('u1','Alex','User'),
        ('c1','Grace','Caregiver');
      `);

      await pool.query(`
        INSERT INTO tasks (id, user_id, title, emoji, time, is_critical) VALUES
        ('t1','u1','Brush Teeth','🪥','8:00 AM',false),
        ('t2','u1','Take Medicine','💊','9:00 AM',true),
        ('t3','u1','Clean Room','🧹','6:00 PM',false);
      `);
    }

    res.json({ ok: true, message: "DB initialized + seeded" });
  } catch (e) {
    console.error("DB init error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --------------------
// Get today's tasks for a user (DB)
// --------------------
app.get("/tasks/today", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const day = todayKey();

    const taskRes = await pool.query(
      `SELECT id, title, emoji, time, is_critical
       FROM tasks
       WHERE user_id = $1
       ORDER BY id`,
      [userId]
    );

    const logRes = await pool.query(
      `SELECT task_id
       FROM task_logs
       WHERE user_id = $1 AND date_iso = $2`,
      [userId, day]
    );

    const doneSet = new Set(logRes.rows.map((r) => r.task_id));

    const out = taskRes.rows.map((t) => ({
      id: t.id,
      title: t.title,
      emoji: t.emoji,
      time: t.time,
      isCritical: t.is_critical,
      done: doneSet.has(t.id),
    }));

    res.json({ date: day, tasks: out });
  } catch (e) {
    console.error("tasks/today error:", e);
    res.status(500).json({ message: "Failed to load tasks", error: e.message });
  }
});

// --------------------
// Toggle task done (DB)
// --------------------
app.post("/tasks/:taskId/done", async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  try {
    const day = todayKey();

    // check task belongs to user (basic validation)
    const taskCheck = await pool.query(
      `SELECT id FROM tasks WHERE id=$1 AND user_id=$2`,
      [taskId, userId]
    );
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: "Task not found for this user" });
    }

    const existing = await pool.query(
      `SELECT id FROM task_logs WHERE task_id=$1 AND user_id=$2 AND date_iso=$3`,
      [taskId, userId, day]
    );

    if (existing.rows.length > 0) {
      await pool.query(`DELETE FROM task_logs WHERE id=$1`, [
        existing.rows[0].id,
      ]);
      return res.json({ taskId, done: false });
    }

    await pool.query(
      `INSERT INTO task_logs (id, task_id, user_id, date_iso, done_at_iso)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        "log_" + Math.random().toString(16).slice(2),
        taskId,
        userId,
        day,
        new Date().toISOString(),
      ]
    );

    res.json({ taskId, done: true });
  } catch (e) {
    console.error("toggle done error:", e);
    res.status(500).json({ message: "Failed to update task", error: e.message });
  }
});

// --------------------
// Caregiver overview (DB)
// --------------------
app.get("/caregiver/overview", async (req, res) => {
  try {
    // MVP: caregiver watches user u1 only
    const pwids = [{ userId: "u1", name: "Alex" }];
    const day = todayKey();

    const overview = [];

    for (const p of pwids) {
      const taskRes = await pool.query(
        `SELECT id, is_critical FROM tasks WHERE user_id=$1`,
        [p.userId]
      );

      const total = taskRes.rows.length;

      const doneRes = await pool.query(
        `SELECT COUNT(*)::int AS c
         FROM task_logs
         WHERE user_id=$1 AND date_iso=$2`,
        [p.userId, day]
      );
      const done = doneRes.rows[0].c;

      // missed critical if any critical task not done
      const criticalIds = taskRes.rows
        .filter((t) => t.is_critical)
        .map((t) => t.id);

      let missedCritical = false;
      if (criticalIds.length > 0) {
        const critDoneRes = await pool.query(
          `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2 AND task_id = ANY($3)`,
          [p.userId, day, criticalIds]
        );
        const critDoneSet = new Set(critDoneRes.rows.map((r) => r.task_id));
        missedCritical = criticalIds.some((id) => !critDoneSet.has(id));
      }

      overview.push({
        name: p.name,
        done,
        total,
        missedCritical,
        risk: missedCritical ? "Medium" : "Low",
      });
    }

    res.json({ date: day, overview });
  } catch (e) {
    console.error("caregiver/overview error:", e);
    res
      .status(500)
      .json({ message: "Failed to load overview", error: e.message });
  }
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
