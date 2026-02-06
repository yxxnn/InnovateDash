import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { getCaregiverOverview, getTasks, createTask, deleteTask } from "../api";

export default function CaregiverDashboard() {
  const userId = "u1"; // MVP: caregiver manages Alex

  const [overview, setOverview] = useState([]);
  const [date, setDate] = useState("");

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // add form
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("📝");
  const [time, setTime] = useState("10:00 AM");
  const [isCritical, setIsCritical] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [ov, t] = await Promise.all([
        getCaregiverOverview(),
        getTasks(userId),
      ]);
      setOverview(ov.overview || []);
      setDate(ov.date || "");
      setTasks(t.tasks || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a task name.");

    try {
      setSaving(true);
      await createTask({
        userId,
        title: title.trim(),
        emoji,
        time,
        isCritical,
      });
      setTitle("");
      setEmoji("📝");
      setTime("10:00 AM");
      setIsCritical(false);
      await loadAll();
    } catch (e2) {
      alert(e2?.message || "Failed to add task");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    const ok = confirm("Delete this task?");
    if (!ok) return;
    try {
      await deleteTask(id);
      await loadAll();
    } catch (e) {
      alert(e?.message || "Failed to delete");
    }
  }

  return (
    <>
      <AppHeader
        appName="CareTrack+"
        subtitle="Daily Task Support"
        userName="Grace"
        role="Caregiver"
        onLogout={() => (window.location.href = "/login")}
      />

      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.h1}>Caregiver Dashboard</h1>
          <p style={styles.p}>
            {date ? `Today: ${date} • ` : ""}
            Monitor completion without cameras, audio, or location tracking.
          </p>
        </div>

        {/* Overview (this is the missing part you asked for) */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}>Care Overview</div>

          {loading ? (
            <div style={{ opacity: 0.75 }}>Loading…</div>
          ) : (
            <div style={styles.grid}>
              {overview.map((p) => (
                <div key={p.name} style={styles.ovCard}>
                  <div>
                    <div style={styles.ovName}>{p.name}</div>
                    <div style={styles.ovSub}>
                      Completed: {p.done}/{p.total}
                    </div>
                    <div style={styles.ovRisk}>
                      Risk: <b>{p.risk}</b>
                    </div>
                  </div>

                  <div style={styles.ovBadge}>
                    {p.missedCritical ? "⚠️" : "✅"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manage tasks */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionTitle}>Manage Tasks</div>

          <form onSubmit={onAdd} style={{ display: "grid", gap: 12 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task name (e.g., Take Medicine)"
              style={styles.input}
            />

            <div style={styles.row}>
              <select
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                style={styles.input}
              >
                <option value="📝">📝 General</option>
                <option value="💊">💊 Medicine</option>
                <option value="🪥">🪥 Hygiene</option>
                <option value="🍽️">🍽️ Meals</option>
                <option value="🧹">🧹 Chores</option>
              </select>

              <input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Time (e.g., 9:00 AM)"
                style={styles.input}
              />

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                />
                Critical
              </label>
            </div>

            <button disabled={saving} style={styles.primaryBtn}>
              {saving ? "Adding…" : "Add Task"}
            </button>
          </form>

          <div style={{ height: 14 }} />

          {loading ? (
            <div style={{ opacity: 0.75 }}>Loading tasks…</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {tasks.map((t) => (
                <div key={t.id} style={styles.taskRow}>
                  <div>
                    <div style={styles.taskTitle}>
                      {t.emoji} {t.title}{" "}
                      {t.isCritical ? (
                        <span style={{ opacity: 0.9 }}>⚠️</span>
                      ) : null}
                    </div>
                    <div style={styles.taskMeta}>Time: {t.time}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(t.id)}
                    style={styles.dangerBtn}
                  >
                    Delete
                  </button>
                </div>
              ))}

              {tasks.length === 0 && (
                <div style={{ opacity: 0.75 }}>No tasks yet.</div>
              )}
            </div>
          )}
        </div>

        <div style={styles.footerNote}>
          Privacy-first design: no camera, audio, or location tracking.
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "18px 18px 30px",
  },
  hero: { marginTop: 10, marginBottom: 14 },
  h1: { margin: 0, fontSize: 34, fontWeight: 950 },
  p: { marginTop: 8, opacity: 0.75 },

  sectionCard: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    marginTop: 14,
  },
  sectionTitle: { fontWeight: 950, marginBottom: 12, fontSize: 16 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  ovCard: {
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  ovName: { fontWeight: 950 },
  ovSub: { opacity: 0.75, fontSize: 13, marginTop: 4 },
  ovRisk: { opacity: 0.75, fontSize: 12, marginTop: 4 },
  ovBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    fontSize: 18,
  },

  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  input: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#f9fafb",
    outline: "none",
    minWidth: 200,
    flex: "1 1 200px",
  },

  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    opacity: 0.9,
    flex: "0 0 auto",
  },

  primaryBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(99,102,241,0.35)",
    color: "#f9fafb",
    fontWeight: 950,
    cursor: "pointer",
  },

  taskRow: {
    padding: 12,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  taskTitle: { fontWeight: 900 },
  taskMeta: { fontSize: 12, opacity: 0.75, marginTop: 4 },

  dangerBtn: {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(239,68,68,0.25)",
    color: "#f9fafb",
    fontWeight: 900,
    cursor: "pointer",
    flex: "0 0 auto",
  },

  footerNote: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.65,
    textAlign: "center",
  },
};
