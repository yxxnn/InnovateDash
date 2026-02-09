import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStreaks } from "../api";

export default function Streaks() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "u1";

  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [last7Days, setLast7Days] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";
  const userDisplayName = userName || (userEmail ? userEmail.split("@")[0] : "User");
  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await getStreaks(userId);
      setStreak(data.currentStreak || 0);
      setLongestStreak(data.longestStreak || 0);
      setWeeklyRate(data.weeklyRate || 0);
      setLast7Days(data.last7Days || []);
    } catch (e) {
      setError(e.message || "Failed to load streaks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-[#f6f8f6] text-slate-900 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col justify-between p-6 shadow-lg">
          <div className="space-y-6">
            {/* Profile Section */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all text-left"
            >
              <div className="w-11 h-11 rounded-full bg-[#19e619]/20 flex items-center justify-center overflow-hidden border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-2xl">person</span>
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">Hi, {userDisplayName}!</h2>
                <p className="text-xs text-slate-500">Ready for today?</p>
              </div>
            </button>

            {/* Nav Links */}
            <nav className="space-y-2">
              <button
                onClick={() => navigate("/pwid")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">wb_sunny</span>
                <span className="text-base font-medium">My Day</span>
              </button>
              <button
                onClick={() => navigate("/user-tasks")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">add_task</span>
                <span className="text-base font-medium">Create Tasks</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#19e619] text-white shadow-md shadow-[#19e619]/20 transition-all">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
                <span className="text-base font-semibold">My Streaks</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">account_circle</span>
                <span className="text-base font-medium">Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all">
                <span className="material-symbols-outlined text-2xl text-slate-600">help</span>
                <span className="text-base font-medium">Help</span>
              </button>
            </nav>
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined text-xl text-slate-500">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f6f8f6] p-3 md:p-6">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#19e619]/20 flex items-center justify-center border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-lg">person</span>
              </div>
              <h2 className="text-base font-bold">Hi, {userDisplayName}!</h2>
            </div>
            <button
              onClick={() => navigate("/pwid")}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              My Day
            </button>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <header>
              <h1 className="text-xl md:text-2xl font-bold mb-1">My Streaks</h1>
              <p className="text-sm text-slate-500">
                Track your consistency and progress over time!
              </p>
            </header>

            {loading && (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-[#19e619] animate-spin">progress_activity</span>
                <p className="mt-3 text-slate-500 text-sm">Loading your progress...</p>
              </div>
            )}

            {error && (
              <div className="bg-white rounded-xl p-6 text-center border border-red-200">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
                <p className="text-red-500 mb-3 text-sm">{error}</p>
                <button
                  onClick={load}
                  className="px-4 py-2 bg-[#19e619] text-white rounded-lg text-sm font-bold hover:bg-[#15c213] transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Streak Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-[#19e619]/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#19e619] text-2xl">local_fire_department</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Current Streak</div>
                        <div className="text-2xl font-black text-[#19e619]">{streak}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">days in a row</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-500 text-2xl">emoji_events</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Longest Streak</div>
                        <div className="text-2xl font-black text-amber-500">{longestStreak}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">personal best</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">check_circle</span>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">This Week</div>
                        <div className="text-2xl font-black text-blue-500">{weeklyRate}%</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">completion rate</p>
                  </div>
                </div>

                {/* Progress Card */}
                <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100">
                  <h2 className="text-base md:text-lg font-bold mb-3">7-Day Progress</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {last7Days.map((dayData, i) => {
                      const date = new Date(dayData.date);
                      const dayName = date.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      return (
                        <div key={dayData.date} className="text-center">
                          <div className="text-xs text-slate-500 mb-1">
                            {dayName}
                          </div>
                          <div
                            className={`w-full h-12 rounded-lg flex items-center justify-center font-bold text-sm ${
                              dayData.completed
                                ? "bg-[#19e619]/20 text-[#19e619]"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {dayData.completed ? "✓" : "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Motivation Card */}
                <div className="bg-gradient-to-br from-[#19e619]/10 to-blue-500/10 rounded-xl p-6 border-2 border-dashed border-[#19e619]/30 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#19e619] mb-3">stars</span>
                  <h3 className="text-lg font-bold mb-1">Keep it up!</h3>
                  <p className="text-sm text-slate-600">
                    {streak > 0
                      ? `You're ${streak} days into your streak. Complete today's tasks to reach ${streak + 1} days!`
                      : "Start your streak today by completing your tasks!"}
                  </p>
                </div>

                
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
