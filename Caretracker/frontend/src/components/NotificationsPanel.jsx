import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function typeMeta(type) {
  if (type === "FOLLOW_UP") return { icon: "⏳", label: "Follow-up" };
  if (type === "SUMMARY") return { icon: "📊", label: "Daily Summary" };
  return { icon: "🔔", label: "Reminder" };
}

export default function NotificationsPanel({ userId = "u1" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch(`${API}/notifications?userId=${userId}`);
      const data = await r.json();
      setItems(data.notifications || []);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id) {
    await fetch(`${API}/notifications/${id}/read`, { method: "POST" });
    load();
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // poll for demo
    return () => clearInterval(t);
  }, []);

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>Notifications</div>
        <div style={styles.panelHint}>Latest updates & reminders</div>
      </div>

      {loading && <div style={styles.muted}>Loading…</div>}
      {!loading && items.length === 0 && (
        <div style={styles.empty}>No notifications yet.</div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((n) => {
          const meta = typeMeta(n.type);
          const dateStr = new Date(n.createdAt).toLocaleString();

          return (
            <div
              key={n.id}
              style={{
                ...styles.card,
                ...(n.read ? styles.cardRead : styles.cardUnread),
              }}
            >
              <div style={styles.cardTop}>
                <div style={styles.badge}>
                  <span style={{ fontSize: 16 }}>{meta.icon}</span>
                  <span style={{ fontWeight: 900 }}>{meta.label}</span>
                </div>

                <div style={styles.time}>{dateStr}</div>
              </div>

              <div style={styles.message}>{n.message}</div>

              <div style={styles.cardActions}>
                {!n.read ? (
                  <button style={styles.readBtn} onClick={() => markRead(n.id)}>
                    Mark as read
                  </button>
                ) : (
                  <div style={styles.readState}>Read ✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
  },
  panelHeader: { marginBottom: 12 },
  panelTitle: { fontSize: 18, fontWeight: 900 },
  panelHint: { fontSize: 13, opacity: 0.7, marginTop: 2 },

  muted: { opacity: 0.75 },
  empty: { opacity: 0.75, padding: 10 },

  card: {
    borderRadius: 16,
    padding: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10, 15, 35, 0.35)",
  },
  cardUnread: {
    boxShadow: "0 0 0 1px rgba(99,102,241,0.30) inset",
  },
  cardRead: {
    opacity: 0.78,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    gap: 8,
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
  },
  time: { fontSize: 12, opacity: 0.75 },

  message: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: 800,
    lineHeight: 1.3,
    color: "#f9fafb",
  },

  cardActions: {
    marginTop: 12,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  readBtn: {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(99,102,241,0.22)",
    color: "#f9fafb",
    fontWeight: 900,
    cursor: "pointer",
  },
  readState: {
    fontSize: 13,
    opacity: 0.85,
    fontWeight: 800,
  },
};
