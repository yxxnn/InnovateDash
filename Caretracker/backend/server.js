import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find(p => p.type === "year")?.value;
  const m = parts.find(p => p.type === "month")?.value;
  const d = parts.find(p => p.type === "day")?.value;
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}


/* =====================================================
   FEATURE : NOTIFICATION HELPER FUNCTIONS
   -----------------------------------------------------
   Utility functions to handle time comparison, quiet
   hours detection, and notification creation.
===================================================== */

function pad2(n) { return String(n).padStart(2, "0"); }
function nowHHMM() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hh = parts.find(p => p.type === "hour")?.value ?? "00";
  const mm = parts.find(p => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}
function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function inQuietHours(now, start, end) {
  // handles overnight ranges like 22:00 -> 07:00
  const n = hhmmToMinutes(now);
  const s = hhmmToMinutes(start);
  const e = hhmmToMinutes(end);
  if (s <= e) return n >= s && n < e;
  return n >= s || n < e;
}

// Your tasks store time like "9:00 AM".
// This converts "9:00 AM" -> "09:00", "6:00 PM" -> "18:00"
function taskTimeToHHMM(timeStr) {
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
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
    // Generate a simple token (in production, use JWT)
    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.json({
      token,
      caregiverId: caregiver.id,
      name: caregiver.name,
      email
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

    // Check if email already exists
    const existing = await pool.query(
      `SELECT id FROM users WHERE email=$1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userId = "u_" + Math.random().toString(16).slice(2);

    await pool.query(
      `INSERT INTO users VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, password, "User", new Date().toISOString()]
    );

    res.status(201).json({
      userId,
      email,
      message: "User account created successfully"
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
      `SELECT id FROM users WHERE email=$1 AND password=$2 AND role=$3`,
      [email, password, "User"]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userId = query.rows[0].id;
    const token = "user_" + Math.random().toString(16).slice(2);

    res.json({
      token,
      userId,
      email,
      message: "Login successful"
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
      return res.status(400).json({ message: "Name, email, and password required" });
    }

    // Check if email already exists
    const existing = await pool.query(
      `SELECT id FROM caregivers WHERE email=$1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const caregiverId = "cg_" + Math.random().toString(16).slice(2);

    await pool.query(
      `INSERT INTO caregivers VALUES ($1, $2, $3, $4, $5)`,
      [caregiverId, name, email, password, new Date().toISOString()]
    );

    // Generate token
    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.status(201).json({
      token,
      caregiverId,
      name,
      email,
      message: "Caregiver account created successfully"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- DB INIT ---------------- */
app.get("/db/init", async (req, res) => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at_iso TEXT NOT NULL
      );
    `);

    // Create caregivers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS caregivers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at_iso TEXT NOT NULL
      );
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        emoji TEXT NOT NULL,
        time TEXT NOT NULL,
        is_critical BOOLEAN DEFAULT FALSE
      );
    `);

    // Create task_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        date_iso TEXT NOT NULL,
        done_at_iso TEXT NOT NULL
      );
    `);

    // Create notification_prefs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_prefs (
      user_id TEXT PRIMARY KEY,
      quiet_start TEXT DEFAULT '22:00',
      quiet_end   TEXT DEFAULT '07:00',
      followup_minutes INT DEFAULT 15
      );
    `);

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at_iso TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE
      );
    `);

    // Seed users
    const count = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
    if (count.rows[0].c === 0) {
      const now = new Date().toISOString();
      await pool.query(`
        INSERT INTO users VALUES
        ('u1','user1@123','123456','User',$1),
        ('u2','user2@123','123456','User',$1);
      `, [now]);
    }

    // Seed caregivers
    const caregiverCount = await pool.query(`SELECT COUNT(*)::int AS c FROM caregivers`);
    if (caregiverCount.rows[0].c === 0) {
      const now = new Date().toISOString();
      await pool.query(`
        INSERT INTO caregivers VALUES
        ('cg1','Admin','admin@123','123456',$1),
        ('cg2','Admin 1','admin1@123','123456',$1);
      `, [now]);
    }

    // Seed sample tasks for user u1
    const taskCount = await pool.query(`SELECT COUNT(*)::int AS c FROM tasks`);
    if (taskCount.rows[0].c === 0) {
      await pool.query(`
        INSERT INTO tasks (id, user_id, title, emoji, time, is_critical) VALUES
        ('t1','u1','Wash Face','🧼','07:00',false),
        ('t2','u1','Brush Teeth','🪥','07:15',true),
        ('t3','u1','Take Vitamin','💊','07:30',true),
        ('t4','u1','Get Dressed','👕','07:45',false),
        ('t5','u1','Clean Room','🧹','08:00',false);
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

/* =====================================================
   FEATURE : NOTIFICATION APIs
   -----------------------------------------------------
   Allows frontend to fetch notifications and mark
   them as read.
===================================================== */
// Get notifications
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

// Mark notification as read
app.post("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  await pool.query(`UPDATE notifications SET read=true WHERE id=$1`, [id]);
  res.json({ ok: true });
});

// Get / Update notification preferences
app.get("/prefs/notifications", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const r = await pool.query(
    `SELECT quiet_start AS "quietStart", quiet_end AS "quietEnd", followup_minutes AS "followupMinutes"
     FROM notification_prefs WHERE user_id=$1`,
    [userId]
  );

  if (!r.rows.length) {
    await pool.query(`INSERT INTO notification_prefs (user_id) VALUES ($1)`, [userId]);
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
    [userId, quietStart || "22:00", quietEnd || "07:00", Number(followupMinutes ?? 15)]
  );

  res.json({ ok: true });
});



/* =====================================================
   FEATURE 1: REMINDER BACKGROUND WORKER
   -----------------------------------------------------
   Runs every minute to:
   - Send task reminders at scheduled time
   - Send follow-up if task not completed
   - Respect quiet hours
===================================================== */

async function reminderWorker() {
  const userId = "u1"; // demo user
  const now = nowHHMM();
  const today = todayKey();

  const pref = await pool.query(
    `SELECT * FROM notification_prefs WHERE user_id=$1`,
    [userId]
  );

  const prefs = pref.rows[0] || { quiet_start: "22:00", quiet_end: "07:00", followup_minutes: 15 };

  if (inQuietHours(now, prefs.quiet_start, prefs.quiet_end)) return;

  const tasks = await pool.query(`SELECT * FROM tasks WHERE user_id=$1`, [userId]);
  const done = await pool.query(
    `SELECT task_id FROM task_logs WHERE user_id=$1 AND date_iso=$2`,
    [userId, today]
  );

  const doneSet = new Set(done.rows.map(x => x.task_id));

  for (const t of tasks.rows) {
    const taskTime = taskTimeToHHMM(t.time);
    if (!taskTime) continue;

    if (taskTime === now && !doneSet.has(t.id)) {
      await insertNotification({
        userId,
        taskId: t.id,
        type: "REMINDER",
        message: `Time to complete: ${t.title}`
      });
    }
  }
}

setInterval(reminderWorker, 60 * 1000);



/* =====================================================
   FEATURE 2: TASK HISTORY & PROGRESS ANALYTICS
   -----------------------------------------------------
   Returns 7-day completion stats and streaks to
   support caregiver monitoring and planning.
===================================================== */
// Weekly analytics (last 7 days ending today or endDate)
app.get("/analytics/weekly", async (req, res) => {
  const { userId, endDate } = req.query;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const end = endDate ? new Date(endDate + "T00:00:00") : new Date();
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const tasksR = await pool.query(`SELECT id FROM tasks WHERE user_id=$1`, [userId]);
  const totalTasks = tasksR.rows.length;

  const logsR = await pool.query(
    `SELECT date_iso, COUNT(*)::int AS done
     FROM task_logs
     WHERE user_id=$1 AND date_iso = ANY($2)
     GROUP BY date_iso`,
    [userId, days]
  );

  const doneMap = new Map(logsR.rows.map((r) => [r.date_iso, r.done]));
  const series = days.map((d) => {
    const done = doneMap.get(d) || 0;
    const total = totalTasks;
    const rate = total === 0 ? 0 : Math.round((done / total) * 100);
    return { date: d, done, total, rate };
  });

  // Simple streak: consecutive days with rate == 100
  let streak = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i].total > 0 && series[i].rate === 100) streak++;
    else break;
  }

  res.json({ totalTasks, streak, series });
});



/* ---------------- START ---------------- */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});



