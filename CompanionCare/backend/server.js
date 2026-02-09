import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { pool } from "./db.js";
import { todayKey, generateResidentCode } from "./utils/helpers.js";
import { reminderWorker } from "./workers/reminder.js";

// Route modules
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import caregiverRoutes from "./routes/caregivers.js";
import taskRoutes from "./routes/tasks.js";
import notificationRoutes from "./routes/notifications.js";
import streakRoutes from "./routes/streaks.js";

const app = express();
const PORT = process.env.PORT || 3000;

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors());
app.use(express.json());

/* ---------------- HEALTH CHECK ---------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------------- MOUNT ROUTES ---------------- */
app.use(authRoutes);
app.use(userRoutes);
app.use(caregiverRoutes);
app.use(taskRoutes);
app.use(notificationRoutes);
app.use(streakRoutes);

/* ---------------- DB INIT (SINGLE SOURCE: init.sql) ---------------- */
async function ensureSchemaAndSeed() {
  const sql = fs.readFileSync(path.resolve("./db/init.sql"), "utf8");
  await pool.query(sql);

  const now = new Date().toISOString();

  const userCount = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
  if (userCount.rows[0].c === 0) {
    const code1 = generateResidentCode();
    const code2 = generateResidentCode();
    await pool.query(
      `INSERT INTO users (id,email,password,name,role,created_at_iso,resident_code) VALUES
       ('u1','user1@123','123456','John Doe','User',$1,$2),
       ('u2','user2@123','123456','Jane Smith','User',$1,$3);`,
      [now, code1, code2]
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

  const assignCount = await pool.query(`SELECT COUNT(*)::int AS c FROM caregiver_residents`);
  if (assignCount.rows[0].c === 0) {
    await pool.query(
      `INSERT INTO caregiver_residents (id, caregiver_id, user_id, assigned_at_iso) VALUES
       ($1, 'cg1', 'u1', $2),
       ($3, 'cg1', 'u2', $2);`,
      ["cr_" + Math.random().toString(16).slice(2), now, "cr_" + Math.random().toString(16).slice(2)]
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

  // Start reminder worker
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
