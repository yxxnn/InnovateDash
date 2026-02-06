import { useEffect, useState } from "react";
import AppHeader from "../components/AppHeader";
import NotificationsPanel from "../components/NotificationsPanel";
import WeeklyAnalytics from "../components/WeeklyAnalytics";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Insights() {
  const userId = "u1";

  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [followupMinutes, setFollowupMinutes] = useState(15);

  const [disableQuiet, setDisableQuiet] = useState(false);
  const [status, setStatus] = useState("");

  async function loadPrefs() {
    setStatus("");
    const r = await fetch(`${API}/prefs/notifications?userId=${userId}`);
    const data = await r.json();
    setQuietStart(data.quietStart || "22:00");
    setQuietEnd(data.quietEnd || "07:00");
    setFollowupMinutes(Number(data.followupMinutes ?? 15));
  }

  async function savePrefs(next) {
    setStatus("Saving...");
    const payload = next || {
      userId,
      quietStart,
      quietEnd,
      followupMinutes: Number(followupMinutes),
    };

    const r = await fetch(`${API}/prefs/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      setStatus(err.message || "Save failed");
      return;
    }
    setStatus("Saved ✅");
    setTimeout(() => setStatus(""), 1500);
    await loadPrefs();
  }

  function restoreDefault() {
    setDisableQuiet(false);
    setQuietStart("22:00");
    setQuietEnd("07:00");
    setFollowupMinutes(15);
    savePrefs({
      userId,
      quietStart: "22:00",
      quietEnd: "07:00",
      followupMinutes: 15,
    });
  }

  async function onToggleDisableQuiet(checked) {
    setDisableQuiet(checked);

    if (checked) {
      // "Disable quiet" = quiet is only 1 minute long, so reminders work anytime
      await savePrefs({
        userId,
        quietStart: "00:00",
        quietEnd: "00:01",
        followupMinutes: Number(followupMinutes),
      });
    } else {
      // back to whatever user set in the inputs
      await savePrefs({
        userId,
        quietStart,
        quietEnd,
        followupMinutes: Number(followupMinutes),
      });
    }
  }

  useEffect(() => {
    loadPrefs();
  }, []);

  return (
    <>
      <AppHeader
        userName="Alex"
        role="User"
        onOpenInsights={() => (window.location.href = "/insights")}
        onLogout={() => (window.location.href = "/login")}
      />

      <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <h1 style={{ margin: "8px 0 14px", fontSize: 22 }}>Updates & Progress</h1>

        {/* ✅ Quiet Hours Settings Card */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Quiet Hours</div>
              <div style={{ opacity: 0.75, fontSize: 13 }}>
                Quiet hours prevent reminders at night to reduce stress.
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={disableQuiet}
                onChange={(e) => onToggleDisableQuiet(e.target.checked)}
              />
              <span style={{ fontWeight: 800 }}>Disable quiet hours (testing)</span>
            </label>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: 120, fontWeight: 800 }}>Quiet start</div>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                disabled={disableQuiet}
                style={inputStyle}
              />

              <div style={{ minWidth: 100, fontWeight: 800 }}>Quiet end</div>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                disabled={disableQuiet}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: 220, fontWeight: 800 }}>Follow-up reminder (minutes)</div>
              <input
                type="number"
                min="1"
                max="120"
                value={followupMinutes}
                onChange={(e) => setFollowupMinutes(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  savePrefs({
                    userId,
                    quietStart,
                    quietEnd,
                    followupMinutes: Number(followupMinutes),
                  })
                }
                disabled={disableQuiet}
                style={btnStyle}
              >
                Save quiet hours
              </button>

              <button onClick={restoreDefault} style={btnStyle}>
                Restore default (10PM–7AM)
              </button>

              {status && <span style={{ alignSelf: "center", opacity: 0.85 }}>{status}</span>}
            </div>
          </div>
        </div>

        {/* Your features */}
        <div style={{ display: "grid", gap: 16 }}>
          <NotificationsPanel userId={userId} />
          <WeeklyAnalytics userId={userId} />
        </div>

        <button
          onClick={() => (window.location.href = "/pwid")}
          style={{ ...btnStyle, marginTop: 16 }}
        >
          ← Back to Tasks
        </button>
      </div>
    </>
  );
}

const inputStyle = {
  padding: "9px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.10)",
  color: "#f9fafb",
  fontWeight: 800,
};

const btnStyle = {
  padding: "9px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.10)",
  color: "#f9fafb",
  fontWeight: 800,
  cursor: "pointer",
};
