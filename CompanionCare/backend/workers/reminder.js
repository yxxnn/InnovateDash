import { pool } from "../db.js";
import {
  todayKey,
  nowHHMM,
  taskTimeToHHMM,
  inQuietHours,
  insertNotification,
} from "../utils/helpers.js";

/* ---------------- REMINDER WORKER ---------------- */
export async function reminderWorker() {
  const userId = "u1"; // demo user
  const now = nowHHMM();
  const today = todayKey();

  const pref = await pool.query(
    `SELECT * FROM notification_prefs WHERE user_id=$1`,
    [userId]
  );

  const prefs =
    pref.rows[0] || { quiet_start: "22:00", quiet_end: "07:00", followup_minutes: 15, notify_reminder: true };

  // Skip if in quiet hours or reminders are disabled
  if (inQuietHours(now, prefs.quiet_start, prefs.quiet_end)) return;
  if (!prefs.notify_reminder) return;

  const tasks = await pool.query(`SELECT * FROM tasks WHERE user_id=$1`, [userId]);
  const done = await pool.query(
    `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
    [userId, today]
  );

  const doneSet = new Set(done.rows.map((x) => x.task_id));

  const [nowHH, nowMM] = now.split(":").map(Number);
  const nowMinutes = nowHH * 60 + nowMM;

  for (const t of tasks.rows) {
    if (!t.is_critical) continue;

    const taskTime = taskTimeToHHMM(t.time);
    if (!taskTime) continue;

    if (doneSet.has(t.id)) continue;

    const [taskHH, taskMM] = taskTime.split(":").map(Number);
    const taskMinutes = taskHH * 60 + taskMM;

    const minutesPassed = nowMinutes - taskMinutes;
    if (minutesPassed >= 10) {
      const existingReminder = await pool.query(
        `SELECT id FROM notifications WHERE user_id=$1 AND task_id=$2 AND type='REMINDER' AND created_at_iso::date=$3`,
        [userId, t.id, today]
      );

      if (existingReminder.rows.length === 0) {
        await insertNotification({
          userId,
          taskId: t.id,
          type: "REMINDER",
          message: `⏰ Your critical task "${t.title}" is overdue by ${minutesPassed} minutes!`,
        });
      }
    }
  }
}
