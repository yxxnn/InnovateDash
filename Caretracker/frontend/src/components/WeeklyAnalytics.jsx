import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function WeeklyAnalytics({ userId = "u1" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await fetch(`${API}/analytics/weekly?userId=${userId}`);
      const d = await r.json();
      setData(d);
    })();
  }, []);

  if (!data) return <p>Loading analytics…</p>;

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 16 }}>
      <h3>Weekly Progress</h3>
      <p><b>Perfect streak:</b> {data.streak} day(s)</p>

      <div>
        {data.series.map((x) => (
          <div key={x.date} style={{ marginBottom: 6 }}>
            <b>{x.date}</b> — {x.done}/{x.total} ({x.rate}%)
            <div style={{ height: 8, background: "#eee", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
              <div style={{ width: `${x.rate}%`, height: "100%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
