import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/* -------- GET NOTIFICATIONS -------- */
router.get("/notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const r = await pool.query(
    `SELECT id, task_id AS "taskId", type, message, created_at_iso AS "createdAt", read
     FROM notifications
     WHERE user_id=$1
     ORDER BY created_at_iso DESC
     LIMIT 50`,
    [userId]
  );

  res.json({ notifications: r.rows });
});

/* -------- MARK NOTIFICATION READ -------- */
router.post("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  await pool.query(`UPDATE notifications SET read=true WHERE id=$1`, [id]);
  res.json({ ok: true });
});

/* -------- GET NOTIFICATION PREFERENCES -------- */
router.get("/prefs/notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const r = await pool.query(
    `SELECT quiet_start AS "quietStart", quiet_end AS "quietEnd", followup_minutes AS "followupMinutes"
     FROM notification_prefs WHERE user_id=$1`,
    [userId]
  );

  if (!r.rows.length) {
    await pool.query(`INSERT INTO notification_prefs (user_id) VALUES ($1)`, [
      userId,
    ]);
    return res.json({ quietStart: "22:00", quietEnd: "07:00", followupMinutes: 15 });
  }

  res.json(r.rows[0]);
});

/* -------- UPDATE NOTIFICATION PREFERENCES -------- */
router.post("/prefs/notifications", async (req, res) => {
  const { userId, quietStart, quietEnd, followupMinutes } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  await pool.query(
    `INSERT INTO notification_prefs (user_id, quiet_start, quiet_end, followup_minutes)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE
     SET quiet_start=EXCLUDED.quiet_start,
         quiet_end=EXCLUDED.quiet_end,
         followup_minutes=EXCLUDED.followup_minutes`,
    [
      userId,
      quietStart || "22:00",
      quietEnd || "07:00",
      Number(followupMinutes ?? 15),
    ]
  );

  res.json({ ok: true });
});

export default router;
