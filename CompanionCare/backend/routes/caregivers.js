import { Router } from "express";
import { pool } from "../db.js";
import { todayKey } from "../utils/helpers.js";

const router = Router();

/* ---------------- CAREGIVER PROFILE ---------------- */
router.get("/caregiver/profile", async (req, res) => {
  try {
    const { caregiverId } = req.query;
    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId required" });
    }
    const q = await pool.query(
      `SELECT id, name, email, created_at_iso FROM caregivers WHERE id=$1`,
      [caregiverId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "Caregiver not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at_iso,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch("/caregiver/profile", async (req, res) => {
  try {
    const { caregiverId, name, email } = req.body;
    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId required" });
    }
    if (name !== undefined) {
      await pool.query(`UPDATE caregivers SET name=$1 WHERE id=$2`, [name, caregiverId]);
    }
    if (email !== undefined && email !== "") {
      await pool.query(`UPDATE caregivers SET email=$1 WHERE id=$2`, [email, caregiverId]);
    }
    const q = await pool.query(
      `SELECT id, name, email, created_at_iso FROM caregivers WHERE id=$1`,
      [caregiverId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "Caregiver not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at_iso,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- CAREGIVER OVERVIEW ---------------- */
router.get("/caregiver/overview", async (req, res) => {
  try {
    const { caregiverId } = req.query;

    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId required" });
    }

    const day = todayKey();

    // Get all residents assigned to this caregiver
    const assignedResidents = await pool.query(
      `SELECT user_id FROM caregiver_residents WHERE caregiver_id=$1`,
      [caregiverId]
    );

    if (assignedResidents.rows.length === 0) {
      return res.json({ overview: [] });
    }

    // Get overview data for each assigned resident
    const overview = await Promise.all(
      assignedResidents.rows.map(async (row) => {
        const userId = row.user_id;

        const userQuery = await pool.query(
          `SELECT allow_caregiver_see, name FROM users WHERE id=$1`,
          [userId]
        );

        if (userQuery.rows.length === 0) {
          return null;
        }

        const canSeeTasks = userQuery.rows[0].allow_caregiver_see;

        let done = 0;
        let total = 0;
        let missedCritical = 0;
        let risk = "Low";

        if (canSeeTasks) {
          const tasks = await pool.query(
            `SELECT id, is_critical FROM tasks WHERE user_id=$1`,
            [userId]
          );

          const logs = await pool.query(
            `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
            [userId, day]
          );

          const doneSet = new Set(logs.rows.map((r) => r.task_id));
          total = tasks.rows.length;
          done = tasks.rows.filter((t) => doneSet.has(t.id)).length;

          missedCritical = tasks.rows.filter(
            (t) => t.is_critical && !doneSet.has(t.id)
          ).length;

          risk = missedCritical > 0 ? "Medium" : "Low";
        }

        return {
          userId,
          name: userQuery.rows[0].name || `User ${userId}`,
          done,
          total,
          missedCritical,
          risk,
          canSeeTasks,
        };
      })
    );

    const validOverview = overview.filter((r) => r !== null);

    res.json({ overview: validOverview });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- CAREGIVER: CHECK RESIDENT PERMISSIONS ---- */
router.get("/caregiver/resident/:userId/permissions", async (req, res) => {
  try {
    const { userId } = req.params;
    const { caregiverId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const userQuery = await pool.query(
      `SELECT allow_caregiver_see, allow_caregiver_edit, name FROM users WHERE id=$1`,
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRow = userQuery.rows[0];

    let isAssigned = true;
    if (caregiverId) {
      const assignedQuery = await pool.query(
        `SELECT COUNT(*) FROM caregiver_residents WHERE caregiver_id=$1 AND user_id=$2`,
        [caregiverId, userId]
      );
      isAssigned = assignedQuery.rows[0].count > 0;
    }

    res.json({
      userId,
      name: userRow.name,
      canSeeTasks: userRow.allow_caregiver_see && isAssigned,
      canEditTasks: userRow.allow_caregiver_edit && isAssigned,
      isAssigned,
      allowCaregiverSee: userRow.allow_caregiver_see,
      allowCaregiverEdit: userRow.allow_caregiver_edit,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- CAREGIVER: ADD RESIDENT BY CODE ---- */
router.post("/caregiver/:caregiverId/residents", async (req, res) => {
  try {
    const { caregiverId } = req.params;
    const { residentCode } = req.body;

    if (!caregiverId || !residentCode) {
      return res.status(400).json({ message: "caregiverId and residentCode required" });
    }

    const userQuery = await pool.query(
      `SELECT id, name, email FROM users WHERE resident_code=$1`,
      [residentCode.trim()]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "Invalid resident code. Please check and try again." });
    }

    const userId = userQuery.rows[0].id;
    const userName = userQuery.rows[0].name;

    const existingQuery = await pool.query(
      `SELECT id FROM caregiver_residents WHERE caregiver_id=$1 AND user_id=$2`,
      [caregiverId, userId]
    );

    if (existingQuery.rows.length > 0) {
      return res.status(400).json({ message: `${userName} is already in your residents list.` });
    }

    const assignmentId = "cr_" + Math.random().toString(16).slice(2);
    await pool.query(
      `INSERT INTO caregiver_residents (id, caregiver_id, user_id, assigned_at_iso) VALUES ($1, $2, $3, $4)`,
      [assignmentId, caregiverId, userId, new Date().toISOString()]
    );

    res.status(201).json({
      success: true,
      message: `${userName} has been added to your residents list!`,
      userId,
      userName,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- CAREGIVER: GET RESIDENTS LIST ---- */
router.get("/caregiver/:caregiverId/residents", async (req, res) => {
  try {
    const { caregiverId } = req.params;

    if (!caregiverId) {
      return res.status(400).json({ message: "caregiverId required" });
    }

    const residents = await pool.query(
      `SELECT u.id, u.name, u.email, u.resident_code 
       FROM users u
       JOIN caregiver_residents cr ON u.id = cr.user_id
       WHERE cr.caregiver_id = $1
       ORDER BY u.name`,
      [caregiverId]
    );

    res.json({
      residents: residents.rows.map(row => ({
        userId: row.id,
        name: row.name,
        email: row.email,
      }))
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- CAREGIVER: REMOVE RESIDENT ---- */
router.delete("/caregiver/resident/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { caregiverId } = req.body;

    if (!userId || !caregiverId) {
      return res.status(400).json({ message: "userId and caregiverId required" });
    }

    const result = await pool.query(
      `DELETE FROM caregiver_residents WHERE caregiver_id=$1 AND user_id=$2 RETURNING id`,
      [caregiverId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Resident assignment not found" });
    }

    res.json({ success: true, message: "Resident removed successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---- CAREGIVER: WEEKLY STATS (7-day completion percentage) ---- */
router.get("/caregiver/weekly-stats", async (req, res) => {
  try {
    const userId = "u1";

    const tasks = await pool.query(
      `SELECT id FROM tasks WHERE user_id=$1`,
      [userId]
    );

    const taskIds = tasks.rows.map((t) => t.id);
    const totalTasks = taskIds.length;

    if (totalTasks === 0) {
      return res.json({
        weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
      });
    }

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);

      const logs = await pool.query(
        `SELECT DISTINCT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
        [userId, dayStr]
      );

      const completedCount = logs.rows.length;
      const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
      weeklyData.push(percentage);
    }

    res.json({
      weeklyTrend: weeklyData,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* =============== CAREGIVER: RECENT ACTIVITY =============== */
router.get("/caregiver/recent-activity", async (req, res) => {
  try {
    const userId = "u1";

    const userQuery = await pool.query(
      `SELECT name FROM users WHERE id=$1`,
      [userId]
    );
    const userName = userQuery.rows[0]?.name || "User";

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const recentTasksQuery = await pool.query(
      `SELECT DISTINCT tl.date_iso, t.title, t.emoji, COUNT(*) as tasksCompleted
       FROM task_logs tl
       JOIN tasks t ON tl.task_id = t.id
       WHERE tl.user_id=$1 AND tl.date_iso >= $2
       GROUP BY tl.date_iso, t.title, t.emoji
       ORDER BY tl.date_iso DESC
       LIMIT 10`,
      [userId, sevenDaysAgoStr]
    );

    const todayKeyStr = today.toISOString().split("T")[0];
    const allTasksQuery = await pool.query(
      `SELECT COUNT(*) as totalTasks FROM tasks WHERE user_id=$1 AND is_recurring=true`,
      [userId]
    );
    const totalTasks = parseInt(allTasksQuery.rows[0]?.totaltasks, 10) || 0;

    const completedTodayQuery = await pool.query(
      `SELECT COUNT(DISTINCT task_id) as completedTasks FROM task_logs 
       WHERE user_id=$1 AND date_iso=$2`,
      [userId, todayKeyStr]
    );
    const completedToday = parseInt(completedTodayQuery.rows[0]?.completedtasks, 10) || 0;
    const allTasksCompleted = totalTasks > 0 && completedToday >= totalTasks;

    const activities = recentTasksQuery.rows.map((row) => ({
      date: row.date_iso,
      task: row.title,
      emoji: row.emoji,
      isAllCompleted: false,
    }));

    if (activities.length > 0 && activities[0].date === todayKeyStr && allTasksCompleted) {
      activities[0].isAllCompleted = true;
    }

    res.json({
      userName,
      userId,
      activities: activities.length > 0 ? activities : [],
      allTasksCompletedToday: allTasksCompleted,
      completedToday,
      totalTasks,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
