import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsPanel from "../components/NotificationsPanel";


const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Insights() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "u1";

  // ✅ PWID: read-only (no quiet hours controls shown)
  useEffect(() => {
    fetch(`${API}/notifications/mark-all-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }, [userId]);

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";
  const userDisplayName = userName || (userEmail ? userEmail.split("@")[0] : "User");

  return (
    <div className="bg-[#f6f8f6] text-slate-900 min-h-screen">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto px-3 md:px-6 pt-5">
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/pwid")}
              className="p-2 rounded-xl hover:bg-slate-100 transition"
              aria-label="Back"
              type="button"
            >
              <span className="material-symbols-outlined text-2xl text-slate-600">arrow_back</span>
            </button>

            <div>
              <div className="text-sm text-slate-500 font-semibold">Updates & Progress</div>
              <div className="text-xl md:text-2xl font-black text-slate-800">
                Hi, {userDisplayName}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-slate-100 transition"
            type="button"
          >
            <div className="w-9 h-9 rounded-full bg-[#19e619]/20 border-2 border-[#19e619] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#19e619]">person</span>
            </div>
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">Profile</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 md:px-6 py-6 space-y-6">
        {/* Friendly helper card */}
        <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#19e619]/15 flex items-center justify-center border border-[#19e619]/20">
              <span className="material-symbols-outlined text-[#19e619] text-2xl">notifications</span>
            </div>
            <div className="flex-1">
              <div className="text-lg font-black text-slate-800">Your reminders</div>
              <p className="text-sm text-slate-600 mt-1">
                If you see a reminder, you can go back and complete the task when you’re ready.
              </p>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="grid gap-6">
          <NotificationsPanel userId={userId} />
          
        </div>
      </div>
    </div>
  );
}
