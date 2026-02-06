export default function AppHeader({
  appName = "CareTrack+",
  userName = "Alex",
  role = "User",
  onLogout,
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        padding: "14px 16px",
        background: "rgba(11, 18, 32, 0.55)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <header
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "12px 16px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{appName}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            Daily Task Support
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #22c55e)",
              display: "grid",
              placeItems: "center",
              fontWeight: 900,
              color: "#fff",
            }}
          >
            {userName[0]}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{userName}</div>
            <div style={{ fontSize: 11, opacity: 0.65 }}>{role}</div>
          </div>

          <button
            onClick={onLogout}
            style={{
              marginLeft: 8,
              fontSize: 12,
              padding: "7px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>
    </div>
  );
}
