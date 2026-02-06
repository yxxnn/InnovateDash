import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 6 }}>CareTrack+</h1>
      <p style={{ opacity: 0.75 }}>
        Select how you want to use the app.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <button onClick={() => nav("/pwid")} style={btnStyle}>
          👤 Continue as User
          <div style={subStyle}>View and complete daily tasks</div>
        </button>

        <button onClick={() => nav("/caregiver")} style={btnStyle}>
          👨‍👩‍👧 Continue as Caregiver
          <div style={subStyle}>Monitor task completion</div>
        </button>
      </div>

      <p style={{ marginTop: 18, fontSize: 13, opacity: 0.6 }}>
        Privacy-first: No camera, audio, or location tracking.
      </p>
    </div>
  );
}

const btnStyle = {
  textAlign: "left",
  padding: 16,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.08)",
  color: "#f9fafb",
  cursor: "pointer",
  fontWeight: 800,
};

const subStyle = {
  marginTop: 6,
  fontWeight: 500,
  fontSize: 13,
  opacity: 0.75,
};
