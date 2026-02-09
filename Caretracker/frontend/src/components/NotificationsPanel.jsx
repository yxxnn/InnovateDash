import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

function meta(type) {
  if (type === "FOLLOW_UP") return { icon: "⏳", label: "Follow-up", pill: "bg-yellow-100 text-yellow-700" };
  if (type === "SUMMARY") return { icon: "📊", label: "Summary", pill: "bg-slate-100 text-slate-700" };
  return { icon: "🔔", label: "Reminder", pill: "bg-[#19e619]/15 text-[#159e15]" };
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
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [userId]);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <section className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#19e619]">notifications</span>
            Notifications
          </h2>
          <p className="text-sm text-slate-500 mt-1">New reminders will appear here.</p>
        </div>

        {unreadCount > 0 && (
          <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">
            {unreadCount} new
          </div>
        )}
      </div>

      {loading && (
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          Loading…
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-600">
          No notifications yet.
        </div>
      )}

      <div className="grid gap-3">
        {items.map((n) => {
          const m = meta(n.type);
          const when = new Date(n.createdAt).toLocaleString();

          return (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 transition ${
                n.read ? "bg-slate-50 border-slate-100" : "bg-white border-[#19e619]/25"
              }`}
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${m.pill}`}>
                    {m.icon} {m.label}
                  </span>

                  {!n.read && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      New
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">{when}</div>
              </div>

              {/* ✅ Show task title clearly if backend sends taskTitle */}
              <div className="mt-3">
                {n.taskTitle ? (
                  <>
                    <div className="text-base font-black text-slate-800">
                      {n.taskEmoji ? `${n.taskEmoji} ` : ""}{n.taskTitle}
                    </div>
                    {n.taskTime && (
                      <div className="text-sm text-slate-500 mt-0.5">{n.taskTime}</div>
                    )}
                    <div className="text-sm text-slate-700 mt-2">{n.message}</div>
                  </>
                ) : (
                  <div className="text-sm text-slate-700">{n.message}</div>
                )}
              </div>

              <div className="mt-3 flex justify-end">
                {!n.read ? (
                  <button
                    onClick={() => markRead(n.id)}
                    className="px-4 py-2 rounded-xl bg-[#19e619] text-white font-bold hover:bg-[#15c213] transition active:scale-95"
                    type="button"
                  >
                    Mark as read
                  </button>
                ) : (
                  <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">done</span>
                    Read
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
