import { useState } from "react";
import TaskCard from "../components/TaskCard";
import AppHeader from "../components/AppHeader";

export default function PwidHome() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Brush Teeth", emoji: "🪥", time: "8:00 AM", done: false },
    { id: 2, title: "Take Medicine", emoji: "💊", time: "9:00 AM", done: false },
    { id: 3, title: "Clean Room", emoji: "🧹", time: "6:00 PM", done: false },
  ]);

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
  }

  const completed = tasks.filter((t) => t.done).length;
  const progress = Math.round((completed / tasks.length) * 100);

  return (
    <>
      {/* App Header */}
      <AppHeader
        appName="CareTrack+"
        userName="Alex"
        role="PWID"
        onLogout={() => alert("Mock logout")}
      />

      {/* Main Content */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: 20 }}>
        {/* Summary Card */}
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
                background:
                  "linear-gradient(90deg, #6366f1, #22c55e)",
              }}
            />
          </div>
        </div>

        {/* Task List */}
        <div style={{ display: "grid", gap: 12 }}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              emoji={task.emoji}
              time={task.time}
              done={task.done}
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </div>

        {/* Privacy Note */}
        <p
          style={{
            marginTop: 16,
            fontSize: 13,
            opacity: 0.6,
          }}
        >
          Privacy-first design: No camera, audio, or location tracking.
        </p>
      </div>
    </>
  );
}
