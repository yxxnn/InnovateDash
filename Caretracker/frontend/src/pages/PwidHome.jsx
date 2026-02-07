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
  const [selectedTask, setSelectedTask] = useState(null);

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

  const userEmail = localStorage.getItem("userEmail") || "";
  const userDisplayName = userEmail ? userEmail.split("@")[0] : "User";

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
        <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col justify-between p-4">
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
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#19e619] text-white shadow-md shadow-[#19e619]/20 transition-all">
                <span className="material-symbols-outlined text-2xl">wb_sunny</span>
                <span className="text-base font-semibold">My Day</span>
              </button>
              <button
                onClick={() => navigate("/user-tasks")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">add_task</span>
                <span className="text-base font-medium">Create Tasks</span>
              </button>
              <button
                onClick={() => navigate("/streaks")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">trending_up</span>
                <span className="text-base font-medium">My Streaks</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all">
                <span className="material-symbols-outlined text-2xl text-slate-600">help</span>
                <span className="text-base font-medium">Help</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">person</span>
                <span className="text-base font-medium">Profile</span>
              </button>
            </nav>
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-all"
            >
              <span className="material-symbols-outlined text-xl text-slate-500">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#f6f8f6] p-3 md:p-6">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-full bg-[#19e619]/20 flex items-center justify-center border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-lg">person</span>
              </div>
              <h2 className="text-base font-bold">Hi, {userDisplayName}!</h2>
            </button>
            <button
              onClick={() => navigate("/user-tasks")}
              className="px-3 py-1.5 text-xs font-semibold bg-[#19e619] text-white rounded-lg hover:bg-[#15c213] transition-colors"
            >
              Create Tasks
            </button>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* Progress Header Card */}
            <header className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold mb-1">Morning Routine</h1>
                  <p className="text-slate-500 text-sm md:text-base">
                    {allDone
                      ? "Amazing! You completed everything!"
                      : "You are doing a great job!"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-black text-[#19e619]">{progress}%</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-4 md:h-5 rounded-full overflow-hidden">
                <div
                  className="bg-[#19e619] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    boxShadow: "0 0 12px rgba(25,230,25,0.35)",
                  }}
                ></div>
              </div>
            </header>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-[#19e619] animate-spin">progress_activity</span>
                <p className="mt-3 text-slate-500 text-sm md:text-base">Loading your tasks...</p>
              </div>
            )}

            {/* Error State */}
            {err && (
              <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-red-200">
                <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
                <p className="text-red-500 mb-3 text-sm md:text-base">{err}</p>
                <button
                  onClick={load}
                  className="px-4 py-2 bg-[#19e619] text-white rounded-lg text-sm font-bold hover:bg-[#15c213] transition-all"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !err && tasks.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-slate-100">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">event_available</span>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No tasks for today</h3>
                <p className="text-slate-400 text-sm">Your caregiver will set up your daily routine.</p>
              </div>
            )}

            {/* Routine Timeline */}
            {!loading && !err && tasks.length > 0 && (
              <section className="space-y-4 relative">
                {/* Vertical Line Connector */}
                <div className="absolute left-5 md:left-8 top-8 bottom-8 w-0.5 bg-slate-200 -z-10"></div>

                {tasks.map((task, idx) => {
                  const isDone = task.done;
                  const isCurrent = idx === currentIndex;
                  const isUpcoming = !isDone && !isCurrent;
                  const image = getTaskImage(task.title);
                  const description = getTaskDescription(task.title);

                  return (
                    <div
                      key={task.id}
                      className={`flex gap-3 md:gap-4 items-start ${isUpcoming ? "opacity-70" : ""}`}
                    >
                      {/* Timeline Node */}
                      <div className="flex-shrink-0 w-10 md:w-16 flex flex-col items-center">
                        {isDone ? (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#19e619] flex items-center justify-center text-white ring-3 md:ring-6 ring-[#f6f8f6]">
                            <span className="material-symbols-outlined text-base md:text-xl">check</span>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-3 border-[#19e619] flex items-center justify-center text-[#19e619] ring-3 md:ring-6 ring-[#f6f8f6] animate-pulse">
                            <div className="w-2 h-2 bg-[#19e619] rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 ring-3 md:ring-6 ring-[#f6f8f6]">
                            <span className="material-symbols-outlined text-base md:text-xl">lock_clock</span>
                          </div>
                        )}
                      </div>

                      {/* Task Card */}
                      <div
                        onClick={() => setSelectedTask(task)}
                        className={`flex-1 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 md:gap-4 items-center transition-all cursor-pointer ${
                          isCurrent
                            ? "p-4 md:p-6 shadow-lg border-2 border-[#19e619] ring-3 ring-[#19e619]/10 hover:scale-[1.01]"
                            : isDone
                            ? "p-3 md:p-4 border-2 border-[#19e619]/20"
                            : "p-3 md:p-4 border border-slate-200 hover:shadow-md"
                        }`}
                      >
                        {/* Task Image or Emoji */}
                        {image ? (
                          <div
                            className={`flex-shrink-0 rounded-lg overflow-hidden border ${
                              isCurrent
                                ? "w-20 h-20 md:w-28 md:h-28 bg-blue-50 border-blue-100"
                                : isDone
                                ? "w-16 h-16 md:w-24 md:h-24 bg-[#19e619]/10 border-[#19e619]/10"
                                : "w-16 h-16 md:w-24 md:h-24 bg-slate-100"
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
                            className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? "w-20 h-20 md:w-28 md:h-28 bg-[#19e619]/10 border border-[#19e619]/20"
                                : isDone
                                ? "w-16 h-16 md:w-24 md:h-24 bg-[#19e619]/10 border border-[#19e619]/10"
                                : "w-16 h-16 md:w-24 md:h-24 bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <span className={`${isCurrent ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"}`}>
                              {task.emoji}
                            </span>
                          </div>
                        )}

                        {/* Task Content */}
                        <div className="flex-1 text-center sm:text-left">
                          <h3
                            className={`font-bold mb-1 ${
                              isCurrent ? "text-base md:text-xl font-black" : "text-sm md:text-lg"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={`text-slate-600 mb-2 ${
                              isCurrent ? "text-sm md:text-base" : "text-xs md:text-sm"
                            }`}
                          >
                            {task.time} {isDone ? "" : `• ${description}`}
                          </p>

                          {/* Action / Status */}
                          {isDone ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUndoTask(task.id);
                              }}
                              className="inline-flex items-center gap-1.5 text-[#19e619] text-xs md:text-sm font-bold bg-[#19e619]/10 px-3 py-1.5 rounded-lg hover:bg-[#19e619]/20 transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">verified</span>
                              Done!
                            </button>
                          ) : isCurrent ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkDone(task.id);
                              }}
                              className="w-full py-2.5 md:py-3.5 bg-[#19e619] text-white rounded-lg text-base md:text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#15c213] transition-all active:scale-95 shadow-md shadow-[#19e619]/30"
                            >
                              <span className="material-symbols-outlined text-xl md:text-2xl">check_circle</span>
                              I'm Done!
                            </button>
                          ) : (
                            <p className="text-slate-400 text-xs md:text-sm">Coming up next...</p>
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
              <div className="flex justify-center pt-2 md:pt-4 pb-6 md:pb-8">
                <div className="bg-[#19e619]/5 border-2 border-dashed border-[#19e619]/30 rounded-2xl p-4 md:p-6 text-center max-w-md">
                  <span className="material-symbols-outlined text-4xl md:text-5xl text-[#19e619]/40 mb-3">stars</span>
                  {allDone ? (
                    <>
                      <h4 className="text-base md:text-lg font-bold text-[#19e619] mb-1">You did it!</h4>
                      <p className="text-slate-600 text-sm">You completed all your tasks today. Amazing work!</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-base md:text-lg font-bold text-[#19e619] mb-1">Almost there!</h4>
                      <p className="text-slate-600 text-sm">Finish your routine to earn a new badge today!</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          onClick={() => setSelectedTask(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {getTaskImage(selectedTask.title) && (
                <img
                  src={getTaskImage(selectedTask.title)}
                  alt={selectedTask.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Time</div>
                  <div className="font-semibold">{selectedTask.time}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className={`font-semibold ${selectedTask.done ? "text-[#19e619]" : "text-slate-600"}`}>
                    {selectedTask.done ? "Completed" : "Pending"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Priority</div>
                  <div className="font-semibold">
                    {selectedTask.isCritical ? "Critical" : "Normal"}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Emoji</div>
                  <div className="text-2xl">{selectedTask.emoji}</div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Instructions</div>
                <div className="text-sm text-slate-700">
                  {getTaskDescription(selectedTask.title)}
                </div>
              </div>

              <div className="flex gap-2">
                {selectedTask.done ? (
                  <button
                    onClick={() => {
                      onUndoTask(selectedTask.id);
                      setSelectedTask(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                  >
                    Mark as Incomplete
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onMarkDone(selectedTask.id);
                      setSelectedTask(null);
                    }}
                    className="flex-1 py-2.5 bg-[#19e619] text-white rounded-lg font-semibold hover:bg-[#15c213] transition-colors"
                  >
                    Mark as Done
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
