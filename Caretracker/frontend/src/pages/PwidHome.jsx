import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayTasks, toggleTaskDone } from "../api";

// Task images mapped by common keywords
const TASK_IMAGES = {
  wash: "https://lh3.googleusercontent.com/aida-public/AB6AXuAa6JVWRGzIPLB8otfE7ve13z333h4NBONePwZcvwI8uiPkh4k0ELkxbuoz2XLUP7w9R7swNtHYiR8rGR6Y8qzr1c9q7FV-q4d6ew29UGwQd3n4tlYU4TDGAQnTm37OIQ-5YzcNV3k8Mp_JH9cFoTVNil68Z1zhIfIe-nTvytoyFM7hf3MLZ13pQaDdH3X4YgeLbDH7Ba56RqLKIjz78xNwpKNZSaI2ZQVovWALEdwlPxSRTgY6sskfeoR9eV0quhsBGW0t78RGPj8",
  brush: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUjf1bLsbUFwfu0Vp5uw9qSNilKQbPj2l7r6Wr3Y2KW8tsKo-mVWM_iNmUNJbByIHtj0a6UmXL-1OkPqR7S7v0TAl5bZVOMb--AQalSDY0CkqTYnj1FvibtmcFOdaGrzXadTobfb-ZKy2ZcpzYCE1dvnAbGvkEg6PqdKefGXXMmhpCW7ArIHJSaVbcM-Ccxm8L6AANxek1C5rIeFacY_tUOyH0FnUeP1mtYCvt-J2JPAYoNMydeMfrKgIG6gRxMXYRgur1IiThyt8",
  vitamin: "https://lh3.googleusercontent.com/aida-public/AB6AXuC77lblsFPIvQZDD8GI5nIeIpIePYddKYZvM2d-xzkFfP41YFXuxP3jWuCkrS8c8NjWnGRsKDCiPETSjJQ49Tkgthd-q7aEWMqc2RwJ7i_2KkWqd-VmkVlu0l_6kDxDlNAfBvmvoyUZ5uwY5y1ZBF7hm8GU1vZILwwymwC-yu9CcX63hzqwyJnE3qMmjx4sZli1OW6pXPMka3tL-SPZAKzbYVvY0Zk0k_GxbLHKRBbn8kDuXrKGnpVvfqMrgZCQvcZO0CxK7SGv4-Y",
  medicine: "https://lh3.googleusercontent.com/aida-public/AB6AXuC77lblsFPIvQZDD8GI5nIeIpIePYddKYZvM2d-xzkFfP41YFXuxP3jWuCkrS8c8NjWnGRsKDCiPETSjJQ49Tkgthd-q7aEWMqc2RwJ7i_2KkWqd-VmkVlu0l_6kDxDlNAfBvmvoyUZ5uwY5y1ZBF7hm8GU1vZILwwymwC-yu9CcX63hzqwyJnE3qMmjx4sZli1OW6pXPMka3tL-SPZAKzbYVvY0Zk0k_GxbLHKRBbn8kDuXrKGnpVvfqMrgZCQvcZO0CxK7SGv4-Y",
  dress: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKECz7ugyb86ijL_W7fvenUOUEkFiWycoYCAjr3WUWcOUu0gXqKPK0VY8G1EXIup4V8Aj3UbxCjtIBqPTVM5r8YbpslF1OuABtEgcr9Nk9pPMdXQzMALbF3Ib-iQKA1I2MwvUlMW17JRjZUweHu2w8a-FT4XkYdkYFeHU_jgEYCm21UaPlvbWVqiCLP4hLcv5KYkg3dBUzousAR0_fOC9NAZqTnF2AnpyxQ3Xg6v0OyQJIY6TpIuEI91pLgXBU2IuadzzxgMTePz8",
  clean: "https://lh3.googleusercontent.com/aida-public/AB6AXuAa6JVWRGzIPLB8otfE7ve13z333h4NBONePwZcvwI8uiPkh4k0ELkxbuoz2XLUP7w9R7swNtHYiR8rGR6Y8qzr1c9q7FV-q4d6ew29UGwQd3n4tlYU4TDGAQnTm37OIQ-5YzcNV3k8Mp_JH9cFoTVNil68Z1zhIfIe-nTvytoyFM7hf3MLZ13pQaDdH3X4YgeLbDH7Ba56RqLKIjz78xNwpKNZSaI2ZQVovWALEdwlPxSRTgY6sskfeoR9eV0quhsBGW0t78RGPj8",
};

const TASK_DESCRIPTIONS = {
  "Wash Face": "Use warm water and soft soap.",
  "Brush Teeth": "Brush for 2 minutes to keep your smile bright!",
  "Take Medicine": "Take your daily medication with water.",
  "Take Vitamin": "Take your daily vitamin to stay healthy!",
  "Get Dressed": "Pick out your favorite outfit.",
  "Clean Room": "Tidy up your space and feel great!",
};

function getTaskImage(title) {
  const lower = title.toLowerCase();
  for (const [key, url] of Object.entries(TASK_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

function getTaskDescription(title) {
  return TASK_DESCRIPTIONS[title] || "Complete this task to continue your routine!";
}

export default function PwidHome() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "u1";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      setLoading(true);
      const data = await getTodayTasks(userId);
      setTasks(data.tasks || []);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onMarkDone(taskId) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: true } : t))
    );

    try {
      const result = await toggleTaskDone(taskId, userId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: result.done } : t))
      );
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: false } : t))
      );
    }
  }

  async function onUndoTask(taskId) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: false } : t))
    );

    try {
      const result = await toggleTaskDone(taskId, userId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: result.done } : t))
      );
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: true } : t))
      );
    }
  }

  const completed = tasks.filter((t) => t.done).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  // Find the first undone task index (this is the "current" task)
  const currentIndex = tasks.findIndex((t) => !t.done);

  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    navigate("/");
  }

  const allDone = tasks.length > 0 && completed === tasks.length;

  return (
    <div className="bg-[#f6f8f6] text-slate-900 min-h-screen">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col justify-between p-6">
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="flex items-center gap-4 p-2">
              <div className="w-14 h-14 rounded-full bg-[#19e619]/20 flex items-center justify-center overflow-hidden border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-3xl">person</span>
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">Hi, User!</h2>
                <p className="text-sm text-slate-500">Ready for today?</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-3">
              <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-[#19e619] text-white shadow-lg shadow-[#19e619]/20 transition-all">
                <span className="material-symbols-outlined text-3xl">wb_sunny</span>
                <span className="text-lg font-semibold">My Day</span>
              </button>
              <button
                onClick={() => navigate("/insights")}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-3xl text-slate-600">trending_up</span>
                <span className="text-lg font-medium">My Streaks</span>
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-slate-100 transition-all">
                <span className="material-symbols-outlined text-3xl text-slate-600">help</span>
                <span className="text-lg font-medium">Help</span>
              </button>
            </nav>
          </div>

          {/* Settings & Logout */}
          <div className="pt-6 border-t border-slate-100 space-y-2">
            <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined text-2xl text-slate-500">settings</span>
              <span className="text-base font-medium">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-50 transition-all text-red-500"
            >
              <span className="material-symbols-outlined text-2xl">logout</span>
              <span className="text-base font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f6f8f6] p-4 md:p-8">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#19e619]/20 flex items-center justify-center border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-xl">person</span>
              </div>
              <h2 className="text-lg font-bold">Hi, User!</h2>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">logout</span>
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Header Card */}
            <header className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-1">Morning Routine</h1>
                  <p className="text-slate-500 text-base md:text-lg">
                    {allDone
                      ? "Amazing! You completed everything!"
                      : "You are doing a great job!"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl md:text-4xl font-black text-[#19e619]">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-5 md:h-6 rounded-full overflow-hidden">
                <div
                  className="bg-[#19e619] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 15px rgba(25,230,25,0.4)",
                  }}
                ></div>
              </div>
            </header>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-[#19e619] animate-spin">progress_activity</span>
                <p className="mt-4 text-slate-500 text-lg">Loading your tasks...</p>
              </div>
            )}

            {/* Error State */}
            {err && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-200">
                <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                <p className="text-red-500 mb-4">{err}</p>
                <button
                  onClick={load}
                  className="px-6 py-3 bg-[#19e619] text-white rounded-xl font-bold hover:bg-[#15c213] transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !err && tasks.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-7xl text-slate-300 mb-4">event_available</span>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No tasks for today</h3>
                <p className="text-slate-400">Your caregiver will set up your daily routine.</p>
              </div>
            )}

            {/* Routine Timeline */}
            {!loading && !err && tasks.length > 0 && (
              <section className="space-y-6 relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-6 md:left-10 top-10 bottom-10 w-1 bg-slate-200 -z-10"></div>

                {tasks.map((task, idx) => {
                  const isDone = task.done;
                  const isCurrent = idx === currentIndex;
                  const isUpcoming = !isDone && !isCurrent;
                  const image = getTaskImage(task.title);
                  const description = getTaskDescription(task.title);

                  return (
                    <div
                      key={task.id}
                      className={`flex gap-4 md:gap-6 items-start ${isUpcoming ? "opacity-70" : ""}`}
                    >
                      {/* Timeline Node */}
                      <div className="flex-shrink-0 w-12 md:w-20 flex flex-col items-center">
                        {isDone ? (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#19e619] flex items-center justify-center text-white ring-4 md:ring-8 ring-[#f6f8f6]">
                            <span className="material-symbols-outlined text-xl md:text-2xl">check</span>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-4 border-[#19e619] flex items-center justify-center text-[#19e619] ring-4 md:ring-8 ring-[#f6f8f6] animate-pulse">
                            <div className="w-3 h-3 bg-[#19e619] rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 ring-4 md:ring-8 ring-[#f6f8f6]">
                            <span className="material-symbols-outlined text-xl md:text-2xl">lock_clock</span>
                          </div>
                        )}
                      </div>

                      {/* Task Card */}
                      <div
                        className={`flex-1 bg-white rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 md:gap-6 items-center transition-all ${
                          isCurrent
                            ? "p-5 md:p-8 shadow-xl border-2 border-[#19e619] ring-4 ring-[#19e619]/5 hover:scale-[1.01]"
                            : isDone
                            ? "p-4 md:p-6 border-2 border-[#19e619]/20"
                            : "p-4 md:p-6 border border-slate-200"
                        }`}
                      >
                        {/* Task Image or Emoji */}
                        {image ? (
                          <div
                            className={`flex-shrink-0 rounded-xl overflow-hidden border ${
                              isCurrent
                                ? "w-28 h-28 md:w-40 md:h-40 bg-blue-50 border-blue-100"
                                : isDone
                                ? "w-24 h-24 md:w-32 md:h-32 bg-[#19e619]/10 border-[#19e619]/10"
                                : "w-24 h-24 md:w-32 md:h-32 bg-slate-100"
                            }`}
                          >
                            <img
                              src={image}
                              alt={task.title}
                              className={`w-full h-full object-cover ${isUpcoming ? "grayscale" : ""}`}
                            />
                          </div>
                        ) : (
                          <div
                            className={`flex-shrink-0 rounded-xl flex items-center justify-center ${
                              isCurrent
                                ? "w-28 h-28 md:w-40 md:h-40 bg-[#19e619]/10 border border-[#19e619]/20"
                                : isDone
                                ? "w-24 h-24 md:w-32 md:h-32 bg-[#19e619]/10 border border-[#19e619]/10"
                                : "w-24 h-24 md:w-32 md:h-32 bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <span className={`${isCurrent ? "text-6xl md:text-7xl" : "text-5xl md:text-6xl"}`}>
                              {task.emoji}
                            </span>
                          </div>
                        )}

                        {/* Task Content */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3
                            className={`font-bold mb-1 md:mb-2 ${
                              isCurrent ? "text-xl md:text-3xl font-black" : "text-lg md:text-2xl"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={`text-slate-600 mb-3 md:mb-4 ${
                              isCurrent ? "text-base md:text-xl" : "text-sm md:text-lg"
                            }`}
                          >
                            {isDone ? "" : description}
                          </p>

                          {/* Action / Status */}
                          {isDone ? (
                            <button
                              onClick={() => onUndoTask(task.id)}
                              className="inline-flex items-center gap-2 text-[#19e619] font-bold bg-[#19e619]/10 px-4 py-2 rounded-lg hover:bg-[#19e619]/20 transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined">verified</span>
                              Done!
                            </button>
                          ) : isCurrent ? (
                            <button
                              onClick={() => onMarkDone(task.id)}
                              className="w-full py-4 md:py-5 bg-[#19e619] text-white rounded-xl text-xl md:text-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#15c213] transition-all active:scale-95 shadow-lg shadow-[#19e619]/30"
                            >
                              <span className="material-symbols-outlined text-3xl md:text-4xl">check_circle</span>
                              I'm Done!
                            </button>
                          ) : (
                            <p className="text-slate-400 text-sm md:text-base">Coming up next...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Completion Footer */}
            {!loading && !err && tasks.length > 0 && (
              <div className="flex justify-center pt-4 md:pt-8 pb-8 md:pb-12">
                <div className="bg-[#19e619]/5 border-2 border-dashed border-[#19e619]/30 rounded-3xl p-6 md:p-8 text-center max-w-lg">
                  <span className="material-symbols-outlined text-5xl md:text-6xl text-[#19e619]/40 mb-4">stars</span>
                  {allDone ? (
                    <>
                      <h4 className="text-xl font-bold text-[#19e619] mb-2">You did it!</h4>
                      <p className="text-slate-600">You completed all your tasks today. Amazing work!</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-xl font-bold text-[#19e619] mb-2">Almost there!</h4>
                      <p className="text-slate-600">Finish your routine to earn a new badge today!</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
