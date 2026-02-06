export default function TaskCard({ title, emoji, time, done, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: done ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
        display: "flex",
        gap: 14,
        alignItems: "center",
        cursor: "pointer",
        transition: "transform 0.05s ease",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.99)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      aria-pressed={done}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "rgba(255,255,255,0.10)",
          fontSize: 26,
        }}
      >
        {emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#f9fafb" }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(229,231,235,0.75)" }}>
          {time}
        </div>
      </div>

      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.10)",
          fontSize: 18,
        }}
      >
        {done ? "✓" : "○"}
      </div>
    </button>
  );
}
