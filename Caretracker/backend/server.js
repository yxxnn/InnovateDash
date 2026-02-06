import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// ---- Mock Data (MVP) ----
const users = [
  { id: "u1", name: "Alex", role: "User" },
  { id: "c1", name: "Grace", role: "Caregiver" },
];

const tasks = [
  { id: "t1", userId: "u1", title: "Brush Teeth", emoji: "🪥", time: "8:00 AM", isCritical: false },
  { id: "t2", userId: "u1", title: "Take Medicine", emoji: "💊", time: "9:00 AM", isCritical: true },
  { id: "t3", userId: "u1", title: "Clean Room", emoji: "🧹", time: "6:00 PM", isCritical: false },
];

// logs: { id, taskId, userId, dateISO, doneAtISO }
let logs = [];

// Helper: get today's date key (YYYY-MM-DD)
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ---- Health Check ----
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ---- Get today's tasks for a user ----
app.get("/tasks/today", (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "userId is required" });

  const day = todayKey();

  const userTasks = tasks
    .filter((t) => t.userId === userId)
    .map((t) => {
      const done = logs.some((l) => l.taskId === t.id && l.dateISO === day);
      return { ...t, done };
    });

  res.json({ date: day, tasks: userTasks });
});

// ---- Mark a task as done (toggle) ----
app.post("/tasks/:taskId/done", (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "userId is required" });

  const task = tasks.find((t) => t.id === taskId && t.userId === userId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  const day = todayKey();

  const existing = logs.find((l) => l.taskId === taskId && l.userId === userId && l.dateISO === day);

  if (existing) {
    // toggle off: remove log
    logs = logs.filter((l) => l.id !== existing.id);
    return res.json({ taskId, done: false });
  }

  // toggle on: add log
  logs.push({
    id: "log_" + Math.random().toString(16).slice(2),
    taskId,
    userId,
    dateISO: day,
    doneAtISO: new Date().toISOString(),
  });

  res.json({ taskId, done: true });
});

// ---- Caregiver overview (simple summary) ----
app.get("/caregiver/overview", (req, res) => {
  // MVP: hardcode caregiver -> user mapping
  const pwids = [{ userId: "u1", name: "Alex" }];

  const day = todayKey();

  const overview = pwids.map((p) => {
    const userTasks = tasks.filter((t) => t.userId === p.userId);
    const doneCount = userTasks.filter((t) => logs.some((l) => l.taskId === t.id && l.dateISO === day)).length;

    // Missed critical tasks (e.g., medicine)
    const missedCritical = userTasks
      .filter((t) => t.isCritical)
      .some((t) => !logs.some((l) => l.taskId === t.id && l.dateISO === day));

    return {
      name: p.name,
      done: doneCount,
      total: userTasks.length,
      missedCritical,
      risk: missedCritical ? "Medium" : "Low",
    };
  });

  res.json({ date: day, overview });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
