import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import { getCaregiverOverview } from "../api";

export default function CaregiverDashboard() {
  const [rows, setRows] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await getCaregiverOverview();
      setRows(data.overview || []);
      setDate(data.date || "");
    } catch (e) {
      setErr(e.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <AppHeader
        appName="CareTrack+"
        userName="Grace"
        role="Caregiver"
        onLogout={() => (window.location.href = "/login")}
      />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <h1 style={{ margin: "6px 0" }}>Caregiver Dashboard</h1>
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          {date ? `Today: ${date} • ` : ""}Completion overview only (no home surveillance).
        </p>

        {loading && <p style={{ opacity: 0.7 }}>Loading overview...</p>}
        {err && (
          <div style={{ opacity: 0.8 }}>
            <p>❌ {err}</p>
            <button onClick={load} style={{ cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !err && (
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            {rows.map((p) => (
              <div
                key={p.name}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13 }}>
                    Completed: {p.done}/{p.total}
                  </div>
                  <div style={{ opacity: 0.65, marginTop: 4, fontSize: 12 }}>
                    Risk: {p.risk}
                  </div>
                </div>

                <div style={{ fontSize: 22 }}>
                  {p.missedCritical ? "⚠️" : "✅"}
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 18, fontSize: 13, opacity: 0.6 }}>
          Alerts trigger when critical tasks (e.g., medication) are missed.
        </p>
      </div>
    </>
  );
}
