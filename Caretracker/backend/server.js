import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ---------------- TIME HELPERS ---------------- */
function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nowHHMM() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function inQuietHours(now, start, end) {
  const n = hhmmToMinutes(now);
  const s = hhmmToMinutes(start);
  const e = hhmmToMinutes(end);
  if (s <= e) return n >= s && n < e;
  return n >= s || n < e;
}

// If your task time is like "07:00" then return it directly.
// If it's like "9:00 AM", convert it.
function taskTimeToHHMM(timeStr) {
  const t = timeStr.trim();

  // already 24h format "07:00"
  if (/^\d{2}:\d{2}$/.test(t)) return t;

  // convert "9:00 AM"
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;

  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === "AM" && hh === 12) hh = 0;
  if (ap === "PM" && hh !== 12) hh += 12;
  return `${pad2(hh)}:${pad2(mm)}`;
}

async function insertNotification({ userId, taskId = null, type, message }) {
  await pool.query(
    `INSERT INTO notifications (id, user_id, task_id, type, message, created_at_iso)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      "n_" + Math.random().toString(16).slice(2),
      userId,
      taskId,
      type,
      message,
      new Date().toISOString(),
    ]
  );
}

/* ---------------- DB INIT (SINGLE SOURCE: init.sql) ---------------- */
async function ensureSchemaAndSeed() {
  // Create tables (ONLY from init.sql)
  const sql = fs.readFileSync(path.resolve("./db/init.sql"), "utf8");
  await pool.query(sql);

  // Seed demo data (safe: only if empty)
  const now = new Date().toISOString();

  const userCount = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
  if (userCount.rows[0].c === 0) {
    await pool.query(
      `INSERT INTO users (id,email,password,role,created_at_iso) VALUES
       ('u1','user1@123','123456','User',$1),
       ('u2','user2@123','123456','User',$1);`,
      [now]
    );
  }

  const cgCount = await pool.query(`SELECT COUNT(*)::int AS c FROM caregivers`);
  if (cgCount.rows[0].c === 0) {
    await pool.query(
      `INSERT INTO caregivers (id,name,email,password,created_at_iso) VALUES
       ('cg1','Admin','admin@123','123456',$1),
       ('cg2','Admin 1','admin1@123','123456',$1);`,
      [now]
    );
  }

  const taskCount = await pool.query(`SELECT COUNT(*)::int AS c FROM tasks`);
  if (taskCount.rows[0].c === 0) {
    await pool.query(`
      INSERT INTO tasks (id, user_id, title, emoji, time, is_critical, is_recurring, created_date_iso) VALUES
      ('t1','u1','Wash Face','🧼','07:00',false,true,$1),
      ('t2','u1','Brush Teeth','🪥','07:15',true,true,$1),
      ('t3','u1','Take Vitamin','💊','07:30',true,true,$1),
      ('t4','u1','Get Dressed','👕','07:45',false,true,$1),
      ('t5','u1','Clean Room','🧹','08:00',false,true,$1);
    `, [todayKey()]);
  }

  console.log("✅ DB schema + seed ready");
}

/* ---------------- CLEANUP OLD TODAY-ONLY TASKS ---------------- */
async function cleanupOldTodayTasks() {
  const today = todayKey();
  
  // Delete today-only tasks that are not from today
  const result = await pool.query(
    `DELETE FROM tasks 
     WHERE is_recurring = false 
     AND created_date_iso != $1`,
    [today]
  );

  if (result.rowCount > 0) {
    console.log(`🧹 Cleaned up ${result.rowCount} old today-only task(s)`);
  }
}

/* ---------------- HEALTH ---------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ------------ CAREGIVER LOGIN ------------ */
app.post("/caregiver/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const query = await pool.query(
      `SELECT id, name FROM caregivers WHERE email=$1 AND password=$2`,
      [email, password]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const caregiver = query.rows[0];
    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.json({
      token,
      caregiverId: caregiver.id,
      name: caregiver.name,
      email,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ USER SIGNUP ------------ */
app.post("/user/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await pool.query(`SELECT id FROM users WHERE email=$1`, [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userId = "u_" + Math.random().toString(16).slice(2);

    await pool.query(
      `INSERT INTO users (id,email,password,role,created_at_iso)
       VALUES ($1,$2,$3,$4,$5)`,
      [userId, email, password, "User", new Date().toISOString()]
    );

    res.status(201).json({
      userId,
      email,
      message: "User account created successfully",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ USER LOGIN ------------ */
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const query = await pool.query(
      `SELECT id FROM users WHERE email=$1 AND password=$2 AND role='User'`,
      [email, password]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userId = query.rows[0].id;
    const token = "user_" + Math.random().toString(16).slice(2);

    res.json({ token, userId, email, message: "Login successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ USER PROFILE ------------ */
app.get("/user/profile", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }
    const q = await pool.query(
      `SELECT id, email, role, created_at_iso FROM users WHERE id=$1`,
      [userId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at_iso,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/user/profile", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }
    if (email !== undefined && email !== "") {
      await pool.query(`UPDATE users SET email=$1 WHERE id=$2`, [email, userId]);
    }
    const q = await pool.query(
      `SELECT id, email, role, created_at_iso FROM users WHERE id=$1`,
      [userId]
    );
    if (q.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const row = q.rows[0];
    res.json({
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at_iso,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ CAREGIVER SIGNUP ------------ */
app.post("/caregiver/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password required" });
    }

    const existing = await pool.query(
      `SELECT id FROM caregivers WHERE email=$1`,
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const caregiverId = "cg_" + Math.random().toString(16).slice(2);
    await pool.query(
      `INSERT INTO caregivers (id,name,email,password,created_at_iso)
       VALUES ($1,$2,$3,$4,$5)`,
      [caregiverId, name, email, password, new Date().toISOString()]
    );

    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.status(201).json({
      token,
      caregiverId,
      name,
      email,
      message: "Caregiver account created successfully",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- CAREGIVER PROFILE ---------------- */
app.get("/caregiver/profile", async (req, res) => {
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

app.patch("/caregiver/profile", async (req, res) => {
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
app.get("/caregiver/overview", async (req, res) => {
  try {
    const day = todayKey();

    // MVP: caregiver monitors user u1
    const userId = "u1";
    const name = "User u1";

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

  // Get all recurring tasks OR today-only tasks created today
  const tasks = await pool.query(
    `SELECT * FROM tasks 
     WHERE user_id=$1 
     AND (is_recurring = true OR (is_recurring = false AND created_date_iso = $2))
     ORDER BY time`,
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

/* ---------------- CAREGIVER: LIST TASKS ---------------- */
app.get("/tasks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const day = todayKey();

  // Get all recurring tasks OR today-only tasks created today
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

/* ---------------- CAREGIVER: ADD TASK ---------------- */
app.post("/tasks", async (req, res) => {
  const { userId, title, emoji, time, isCritical, isRecurring } = req.body;
  if (!userId || !title || !emoji || !time)
    return res.status(400).json({ message: "Missing fields" });

  const id = "t_" + Math.random().toString(16).slice(2);
  const createdDate = todayKey(); // YYYY-MM-DD for today

  await pool.query(
    `INSERT INTO tasks (id, user_id, title, emoji, time, is_critical, is_recurring, created_date_iso)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, userId, title, emoji, time, Boolean(isCritical), Boolean(isRecurring ?? true), createdDate]
  );

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

/* ---------------- NOTIFICATIONS ---------------- */
app.get("/notifications", async (req, res) => {
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

app.post("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  await pool.query(`UPDATE notifications SET read=true WHERE id=$1`, [id]);
  res.json({ ok: true });
});

app.get("/prefs/notifications", async (req, res) => {
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

app.post("/prefs/notifications", async (req, res) => {
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

/* ---------------- REMINDER WORKER ---------------- */
async function reminderWorker() {
  const userId = "u1"; // demo user
  const now = nowHHMM();
  const today = todayKey();

  const pref = await pool.query(
    `SELECT * FROM notification_prefs WHERE user_id=$1`,
    [userId]
  );

  const prefs =
    pref.rows[0] || { quiet_start: "22:00", quiet_end: "07:00", followup_minutes: 15 };

  if (inQuietHours(now, prefs.quiet_start, prefs.quiet_end)) return;

  const tasks = await pool.query(`SELECT * FROM tasks WHERE user_id=$1`, [userId]);
  const done = await pool.query(
    `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
    [userId, today]
  );

  const doneSet = new Set(done.rows.map((x) => x.task_id));

  for (const t of tasks.rows) {
    const taskTime = taskTimeToHHMM(t.time);
    if (!taskTime) continue;

    if (taskTime === now && !doneSet.has(t.id)) {
      await insertNotification({
        userId,
        taskId: t.id,
        type: "REMINDER",
        message: `Time to complete: ${t.title}`,
      });
    }
  }
}

/*----------------- STREAKS ------------------ */
app.get("/streaks", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  try {
    // Get all unique dates where user completed at least one task
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
        // Allow 1 day gap if checking today
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


/* ---------------- BOOTSTRAP ---------------- */
async function bootstrap() {
  // Wait until DB accepts connections
  for (let i = 0; i < 20; i++) {
    try {
      await pool.query("SELECT 1");
      break;
    } catch {
      console.log("⏳ Waiting for database...");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  await ensureSchemaAndSeed();
  await cleanupOldTodayTasks();

  // start worker only after tables exist
  setInterval(reminderWorker, 60 * 1000);
  
  // Cleanup old today-only tasks daily
  setInterval(cleanupOldTodayTasks, 24 * 60 * 60 * 1000);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error("❌ Startup failed:", e.message);
  process.exit(1);
});
