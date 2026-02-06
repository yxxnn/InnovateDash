import AppHeader from "../components/AppHeader";

export default function CaregiverDashboard() {
  const data = [
    { name: "Alex", done: 2, total: 3, missed: 1, risk: "Medium" },
    { name: "Ben", done: 3, total: 3, missed: 0, risk: "Low" },
  ];

  return (
    <>
      <AppHeader
        appName="CareTrack+"
        userName="Grace"
        role="Caregiver"
        onLogout={() => (window.location.href = "/login")}
      />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <h1 style={{ margin: "6px 0", color: "#f9fafb" }}>Caregiver Dashboard</h1>
        <p style={{ opacity: 0.75, marginTop: 0 }}>
          View task completion only (no home surveillance).
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {data.map((p) => (
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
                <div style={{ fontWeight: 900, color: "#f9fafb" }}>{p.name}</div>
                <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13 }}>
                  Completed: {p.done}/{p.total} • Missed: {p.missed}
                </div>
                <div style={{ opacity: 0.65, marginTop: 4, fontSize: 12 }}>
                  Risk: {p.risk}
                </div>
              </div>

              <div style={{ fontSize: 22 }}>
                {p.missed > 0 ? "⚠️" : "✅"}
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 18, fontSize: 13, opacity: 0.6 }}>
          Alerts are triggered when important tasks (e.g., medication) are missed.
        </p>
      </div>
    </>
  );
}
