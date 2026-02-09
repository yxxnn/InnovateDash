import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/* ------------ USER PROFILE ------------ */
router.get("/user/profile", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }
    const q = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at_iso, u.allow_caregiver_see, u.allow_caregiver_edit, u.resident_code,
              COALESCE(np.notify_complete, true) as notify_complete,
              COALESCE(np.notify_reminder, true) as notify_reminder,
              COALESCE(np.notify_streak, true) as notify_streak
       FROM users u
       LEFT JOIN notification_prefs np ON u.id = np.user_id
       WHERE u.id=$1`,
      [userId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at_iso,
      allowCaregiverSee: row.allow_caregiver_see,
      allowCaregiverEdit: row.allow_caregiver_edit,
      residentCode: row.resident_code,
      notifyComplete: row.notify_complete,
      notifyReminder: row.notify_reminder,
      notifyStreak: row.notify_streak,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/user/profile", async (req, res) => {
  try {
    const { userId, email, name } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }
    if (email !== undefined && email !== "") {
      await pool.query(`UPDATE users SET email=$1 WHERE id=$2`, [email, userId]);
    }
    if (name !== undefined && name !== "") {
      await pool.query(`UPDATE users SET name=$1 WHERE id=$2`, [name, userId]);
    }
    const q = await pool.query(
      `SELECT id, email, name, role, created_at_iso FROM users WHERE id=$1`,
      [userId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at_iso,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* --------------- UPDATE USER PREFERENCES --------------- */
router.patch("/user/preferences", async (req, res) => {
  try {
    const { userId, allowCaregiverEdit, allowCaregiverSee, notifyComplete, notifyReminder, notifyStreak } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    // Update user caregiver preferences
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (allowCaregiverEdit !== undefined) {
      updates.push(`allow_caregiver_edit=$${paramCount++}`);
      values.push(Boolean(allowCaregiverEdit));
    }

    if (allowCaregiverSee !== undefined) {
      updates.push(`allow_caregiver_see=$${paramCount++}`);
      values.push(Boolean(allowCaregiverSee));
    }

    if (updates.length > 0) {
      values.push(userId);
      const query = `UPDATE users SET ${updates.join(", ")} WHERE id=$${paramCount} RETURNING id, email, name, allow_caregiver_edit, allow_caregiver_see`;
      await pool.query(query, values);
    }

    // Update notification preferences in notification_prefs table
    if (notifyComplete !== undefined || notifyReminder !== undefined || notifyStreak !== undefined) {
      const exists = await pool.query(
        `SELECT user_id FROM notification_prefs WHERE user_id=$1`,
        [userId]
      );

      if (exists.rows.length === 0) {
        let completeVal = notifyComplete !== undefined ? notifyComplete : true;
        let reminderVal = notifyReminder !== undefined ? notifyReminder : true;
        let streakVal = notifyStreak !== undefined ? notifyStreak : true;

        await pool.query(
          `INSERT INTO notification_prefs (user_id, notify_complete, notify_reminder, notify_streak) 
           VALUES ($1, $2, $3, $4)`,
          [userId, Boolean(completeVal), Boolean(reminderVal), Boolean(streakVal)]
        );
      } else {
        const updateFields = [];
        const updateVals = [];
        let updateCount = 1;

        if (notifyComplete !== undefined) {
          updateFields.push(`notify_complete=$${updateCount++}`);
          updateVals.push(Boolean(notifyComplete));
        }
        if (notifyReminder !== undefined) {
          updateFields.push(`notify_reminder=$${updateCount++}`);
          updateVals.push(Boolean(notifyReminder));
        }
        if (notifyStreak !== undefined) {
          updateFields.push(`notify_streak=$${updateCount++}`);
          updateVals.push(Boolean(notifyStreak));
        }

        if (updateFields.length > 0) {
          updateVals.push(userId);
          await pool.query(
            `UPDATE notification_prefs SET ${updateFields.join(", ")} WHERE user_id=$${updateCount}`,
            updateVals
          );
        }
      }
    }

    // Return updated preferences
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.allow_caregiver_edit, u.allow_caregiver_see,
              COALESCE(np.notify_complete, true) as notify_complete,
              COALESCE(np.notify_reminder, true) as notify_reminder,
              COALESCE(np.notify_streak, true) as notify_streak
       FROM users u
       LEFT JOIN notification_prefs np ON u.id = np.user_id
       WHERE u.id=$1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      name: row.name,
      allowCaregiverEdit: row.allow_caregiver_edit,
      allowCaregiverSee: row.allow_caregiver_see,
      notifyComplete: row.notify_complete,
      notifyReminder: row.notify_reminder,
      notifyStreak: row.notify_streak,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
