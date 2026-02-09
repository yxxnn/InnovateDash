import { Router } from "express";
import { pool } from "../db.js";
import { todayKey } from "../utils/helpers.js";

const router = Router();

/* ---------------- USER: TODAY TASKS ---------------- */
router.get("/tasks/today", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  const tasks = await pool.query(
    `SELECT t.*, g.name as group_name 
     FROM tasks t
     LEFT JOIN task_groups g ON t.group_id = g.id
     WHERE t.user_id=$1 
     AND (t.is_recurring = true OR (t.is_recurring = false AND t.created_date_iso = $2))
     ORDER BY t.time`,
    [userId, day]
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
      isRecurring: t.is_recurring,
      done: doneSet.has(t.id),
      groupId: t.group_id,
      groupName: t.group_name,
    })),
  });
});

/* ---------------- TOGGLE DONE ---------------- */
router.post("/tasks/:taskId/done", async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  const exists = await pool.query(
    `SELECT id FROM task_logs WHERE task_id=$1 AND user_id=$2 AND date_iso=$3`,
    [taskId, userId, day]
  );

  if (exists.rows.length) {
    await pool.query(`DELETE FROM task_logs WHERE id=$1`, [exists.rows[0].id]);
    return res.json({ done: false });
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

  res.json({ done: true });
});

/* ---------------- LIST TASKS ---------------- */
router.get("/tasks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  const r = await pool.query(
    `SELECT * FROM tasks 
     WHERE user_id=$1 
     AND (is_recurring = true OR (is_recurring = false AND created_date_iso = $2))
     ORDER BY time`,
    [userId, day]
  );

  res.json({
    tasks: r.rows.map((t) => ({
      id: t.id,
      title: t.title,
      emoji: t.emoji,
      time: t.time,
      is_critical: t.is_critical,
      is_recurring: t.is_recurring,
      created_date: t.created_date_iso,
    })),
  });
});

/* ---------------- ADD TASK ---------------- */
router.post("/tasks", async (req, res) => {
  const { userId, title, emoji, time, isCritical, isRecurring } = req.body;
  if (!userId || !title || !emoji || !time)
    return res.status(400).json({ message: "Missing fields" });

  const id = "t_" + Math.random().toString(16).slice(2);
  const createdDate = todayKey();

  await pool.query(
    `INSERT INTO tasks (id, user_id, title, emoji, time, is_critical, is_recurring, created_date_iso)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, userId, title, emoji, time, Boolean(isCritical), Boolean(isRecurring ?? true), createdDate]
  );

  res.status(201).json({ id });
});

/* ---------------- DELETE TASK ---------------- */
router.delete("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;

  await pool.query(`DELETE FROM task_logs WHERE task_id=$1`, [taskId]);
  const r = await pool.query(`DELETE FROM tasks WHERE id=$1`, [taskId]);

  if (!r.rowCount) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
});

/* --------------- UPDATE TASK --------------- */
router.patch("/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { title, emoji, time, isCritical, isRecurring } = req.body;

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (title !== undefined) {
    updates.push(`title=$${paramCount++}`);
    values.push(title);
  }
  if (emoji !== undefined) {
    updates.push(`emoji=$${paramCount++}`);
    values.push(emoji);
  }
  if (time !== undefined) {
    updates.push(`time=$${paramCount++}`);
    values.push(time);
  }
  if (isCritical !== undefined) {
    updates.push(`is_critical=$${paramCount++}`);
    values.push(Boolean(isCritical));
  }
  if (isRecurring !== undefined) {
    updates.push(`is_recurring=$${paramCount++}`);
    values.push(Boolean(isRecurring));
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  values.push(taskId);
  const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id=$${paramCount} RETURNING *`;

  const r = await pool.query(query, values);

  if (!r.rowCount) return res.status(404).json({ message: "Not found" });

  res.json({
    id: r.rows[0].id,
    title: r.rows[0].title,
    emoji: r.rows[0].emoji,
    time: r.rows[0].time,
    isCritical: r.rows[0].is_critical,
    isRecurring: r.rows[0].is_recurring,
  });
});

export default router;
