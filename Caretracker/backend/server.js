import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- HEALTH ---------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------------- DB INIT ---------------- */
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
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        emoji TEXT NOT NULL,
        time TEXT NOT NULL,
        is_critical BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        date_iso TEXT NOT NULL,
        done_at_iso TEXT NOT NULL
      );
    `);

    const count = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
    if (count.rows[0].c === 0) {
      await pool.query(`
        INSERT INTO users VALUES
        ('u1','Alex','User'),
        ('c1','Grace','Caregiver');

        INSERT INTO tasks VALUES
        ('t1','u1','Take Medicine','💊','9:00 AM',true),
        ('t2','u1','Brush Teeth','🪥','8:00 AM',false),
        ('t3','u1','Clean Room','🧹','6:00 PM',false);
      `);
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- CAREGIVER OVERVIEW (FIX) ---------------- */
app.get("/caregiver/overview", async (req, res) => {
  try {
    const day = todayKey();

    // For MVP: caregiver monitors user u1
    const userRow = await pool.query(`SELECT id, name FROM users WHERE id='u1'`);
    const userId = userRow.rows[0]?.id || "u1";
    const name = userRow.rows[0]?.name || "Alex";

    const tasks = await pool.query(
      `SELECT id, is_critical FROM tasks WHERE user_id=$1`,
      [userId]
    );

    const logs = await pool.query(
      `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
      [userId, day]
    );

    const doneSet = new Set(logs.rows.map((r) => r.task_id));

    const total = tasks.rows.length;
    const done = tasks.rows.filter((t) => doneSet.has(t.id)).length;

    const missedCritical = tasks.rows.filter(
      (t) => t.is_critical && !doneSet.has(t.id)
    ).length;

    const risk = missedCritical > 0 ? "Medium" : "Low";

    res.json({
      date: day,
      overview: [{ name, done, total, missedCritical, risk }],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- USER: TODAY TASKS ---------------- */
app.get("/tasks/today", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  const tasks = await pool.query(
    `SELECT * FROM tasks WHERE user_id=$1 ORDER BY time`,
    [userId]
  );

  const logs = await pool.query(
    `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
    [userId, day]
  );

  const doneSet = new Set(logs.rows.map((r) => r.task_id));

  res.json({
    date: day,
    tasks: tasks.rows.map((t) => ({
      id: t.id,
      title: t.title,
      emoji: t.emoji,
      time: t.time,
      isCritical: t.is_critical,
      done: doneSet.has(t.id),
    })),
  });
});

/* ---------------- TOGGLE DONE ---------------- */
app.post("/tasks/:taskId/done", async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  const exists = await pool.query(
    `SELECT id FROM task_logs WHERE task_id=$1 AND user_id=$2 AND date_iso=$3`,
    [taskId, userId, day]
  );

  if (exists.rows.length) {
    await pool.query(`DELETE FROM task_logs WHERE id=$1`, [
      exists.rows[0].id,
    ]);
    return res.json({ done: false });
  }

  await pool.query(`INSERT INTO task_logs VALUES ($1,$2,$3,$4,$5)`, [
    "log_" + Math.random().toString(16).slice(2),
    taskId,
    userId,
    day,
    new Date().toISOString(),
  ]);

  res.json({ done: true });
});

/* ---------------- CAREGIVER: LIST TASKS ---------------- */
app.get("/tasks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const r = await pool.query(
    `SELECT * FROM tasks WHERE user_id=$1 ORDER BY time`,
    [userId]
  );

  res.json({
    tasks: r.rows.map((t) => ({
      id: t.id,
      title: t.title,
      emoji: t.emoji,
      time: t.time,
      isCritical: t.is_critical,
    })),
  });
});

/* ---------------- CAREGIVER: ADD TASK ---------------- */
app.post("/tasks", async (req, res) => {
  const { userId, title, emoji, time, isCritical } = req.body;
  if (!userId || !title || !emoji || !time)
    return res.status(400).json({ message: "Missing fields" });

  const id = "t_" + Math.random().toString(16).slice(2);

  await pool.query(`INSERT INTO tasks VALUES ($1,$2,$3,$4,$5,$6)`, [
    id,
    userId,
    title,
    emoji,
    time,
    Boolean(isCritical),
  ]);

  res.status(201).json({ id });
});

/* ---------------- CAREGIVER: DELETE TASK ---------------- */
app.delete("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;

  await pool.query(`DELETE FROM task_logs WHERE task_id=$1`, [taskId]);
  const r = await pool.query(`DELETE FROM tasks WHERE id=$1`, [taskId]);

  if (!r.rowCount) return res.status(404).json({ message: "Not found" });

  res.json({ ok: true });
});

/* ---------------- START ---------------- */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
