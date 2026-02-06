import { useEffect, useState } from "react";
import TaskCard from "../components/TaskCard";
import AppHeader from "../components/AppHeader";
import { getTodayTasks, toggleTaskDone } from "../api";



export default function PwidHome() {
  const userId = "u1"; // MVP: mock logged-in user

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await getTodayTasks(userId);
      setTasks(data.tasks);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onToggle(taskId) {
    // optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );

    try {
      const result = await toggleTaskDone(taskId, userId);
      // ensure UI matches backend response
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: result.done } : t))
      );
    } catch (e) {
      // revert if failed
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
      );
      alert(e.message || "Failed to update");
    }
  }

  const completed = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <>
      <AppHeader
        appName="CareTrack+"
        userName="Alex"
        role="User"
        onLogout={() => (window.location.href = "/login")}
      />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.06)",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 28 }}>My Tasks Today</h1>
              <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                Completed: {completed}/{tasks.length} • {progress}%
              </p>
            </div>

            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                display: "grid",
                placeItems: "center",
                background: "rgba(99,102,241,0.22)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontWeight: 900,
              }}
            >
              {progress}%
            </div>
          </div>

          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              marginTop: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #6366f1, #22c55e)",
              }}
            />
          </div>
        </div>

        {loading && <p style={{ opacity: 0.7 }}>Loading tasks...</p>}
        {err && (
          <div style={{ opacity: 0.8 }}>
            <p>❌ {err}</p>
            <button onClick={load} style={{ cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !err && (
          <div style={{ display: "grid", gap: 12 }}>
            {tasks.map((t) => (
              <TaskCard
                key={t.id}
                title={t.title}
                emoji={t.emoji}
                time={t.time}
                done={t.done}
                onToggle={() => onToggle(t.id)}
              />
            ))}
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.6 }}>
          Privacy-first design: No camera, audio, or location tracking.
        </p>
      </div>
    </>
  );
}
