export default function AppHeader({
  appName = "CareTrack+",
  subtitle = "Daily Task Support",
  userName = "User",
  role = "User",
  onLogout,
}) {
  return (
    <div style={styles.wrap}>
      <div style={styles.bar}>
        <div>
          <div style={styles.title}>{appName}</div>
          <div style={styles.sub}>{subtitle}</div>
        </div>

        <div style={styles.right}>
          <div style={styles.avatar}>{(userName || "U")[0].toUpperCase()}</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={styles.name}>{userName}</div>
            <div style={styles.role}>{role}</div>
          </div>

          <button
            type="button"
            style={styles.logout}
            onClick={() => {
              if (onLogout) onLogout();
              else window.location.href = "/login"; // fallback
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    padding: "16px 18px",
    backdropFilter: "blur(8px)",
  },
  bar: {
    maxWidth: 1100,
    margin: "0 auto",
    borderRadius: 18,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  title: { fontWeight: 900, fontSize: 20 },
  sub: { opacity: 0.75, fontSize: 13, marginTop: 2 },

  right: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    background: "linear-gradient(135deg, rgba(34,211,238,0.55), rgba(99,102,241,0.55))",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  name: { fontWeight: 800, fontSize: 14 },
  role: { opacity: 0.7, fontSize: 12 },

  logout: {
    marginLeft: 8,
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.10)",
    color: "#f9fafb",
    fontWeight: 800,
    cursor: "pointer",
  },
};
