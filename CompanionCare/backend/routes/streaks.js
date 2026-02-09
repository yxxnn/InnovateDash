import { Router } from "express";
import { pool } from "../db.js";
import { todayKey } from "../utils/helpers.js";

const router = Router();

/* ----------------- STREAKS ------------------ */
router.get("/streaks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    const datesResult = await pool.query(
      `SELECT DISTINCT date_iso FROM task_logs WHERE user_id=$1 ORDER BY date_iso DESC`,
      [userId]
    );

    const completedDates = datesResult.rows.map((r) => r.date_iso);

    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    const today = todayKey();
    let checkDate = new Date(today);

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (completedDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (currentStreak === 0 && dateStr === today) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    // Calculate longest streak in history
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate = null;

    for (const dateStr of completedDates.reverse()) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const prev = new Date(prevDate);
        const curr = new Date(dateStr);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) tempStreak++;
        else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = dateStr;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly completion rate (last 7 days)
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split("T")[0]);
    }

    const completedDaysInWeek = last7Days.filter((d) =>
      completedDates.includes(d)
    ).length;

    const weeklyRate = Math.round((completedDaysInWeek / 7) * 100);

    res.json({
      currentStreak,
      longestStreak,
      weeklyRate,
      last7Days: last7Days.map((date) => ({
        date,
        completed: completedDates.includes(date),
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
