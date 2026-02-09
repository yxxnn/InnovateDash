import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function WeeklyAnalytics({ userId = "u1" }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const r = await fetch(`${API}/streaks?userId=${userId}`);
        if (!r.ok) throw new Error(`Analytics failed (${r.status})`);
        const d = await r.json();
        setData(d);
      } catch (e) {
        setErr(e.message || "Failed to load analytics");
      }
    })();
  }, [userId]);

  if (err) return <p className="text-red-500 text-sm">❌ {err}</p>;
  if (!data) return <p className="text-slate-500 text-sm">Loading analytics…</p>;

  return (
    <section className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
      <h2 className="text-lg md:text-xl font-black text-slate-800 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#19e619]">insights</span>
        Weekly Progress
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Current" value={`${data.currentStreak}d`} />
        <Stat label="Best" value={`${data.longestStreak}d`} />
        <Stat label="Week" value={`${data.weeklyRate}%`} />
      </div>

      <div className="mt-4 space-y-2">
        {(data.last7Days || []).map((x) => (
          <div key={x.date} className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <div className="text-sm font-bold text-slate-700">{x.date}</div>
            <div className={`text-sm font-bold ${x.completed ? "text-[#19e619]" : "text-slate-400"}`}>
              {x.completed ? "✅ Done" : "—"}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
      <div className="text-xs text-slate-500 font-semibold">{label}</div>
      <div className="text-xl font-black text-slate-800">{value}</div>
    </div>
  );
}
