import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, getTasks } from "../api";

export default function UserTasks() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "u1";

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [time, setTime] = useState("07:00");
  const [isCritical, setIsCritical] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    try {
      setStatus("");
      setLoading(true);
      const data = await getTasks(userId);
      setTasks(data.tasks || []);
    } catch (e) {
      setStatus(e.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      setStatus("Title is required");
      return;
    }

    setStatus("Saving...");
    try {
      await createTask({
        userId,
        title: title.trim(),
        emoji: emoji.trim() || "📝",
        time,
        isCritical,
        isRecurring,
      });
      setTitle("");
      setEmoji("");
      setIsCritical(false);
      setIsRecurring(true);
      setStatus("Task created successfully!");
      await load();
      setTimeout(() => setStatus(""), 3000);
    } catch (e) {
      setStatus(e.message || "Save failed");
    }
  }

  async function onDelete(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setStatus("");
    try {
      await deleteTask(taskId);
      setStatus("Task deleted");
      await load();
      setTimeout(() => setStatus(""), 3000);
    } catch (e) {
      setStatus(e.message || "Delete failed");
    }
  }

  // Separate tasks by type
  const recurringTasks = tasks.filter(t => t.is_recurring);
  const todayTasks = tasks.filter(t => !t.is_recurring);

  return (
    <div className="bg-[#f6f8f6] min-h-screen text-slate-900">
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
                <h2 className="text-base font-bold leading-tight">Hi, User!</h2>
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
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#19e619] text-white shadow-md shadow-[#19e619]/20 transition-all">
                <span className="material-symbols-outlined text-2xl">add_task</span>
                <span className="text-base font-semibold">Create Tasks</span>
              </button>
              <button
                onClick={() => navigate("/streaks")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 transition-all"
              >
                <span className="material-symbols-outlined text-2xl text-slate-600">trending_up</span>
                <span className="text-base font-medium">My Streaks</span>
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
              <h2 className="text-base font-bold">Hi, User!</h2>
            </div>
            <button
              onClick={() => navigate("/pwid")}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              My Day
            </button>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <header className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Create New Task</h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Build your daily routine one task at a time
              </p>
            </header>

            {/* Status Message */}
            {status && (
              <div className={`p-4 rounded-xl text-sm font-medium text-center ${
                status.includes("success") || status === "Saved" || status === "Task deleted"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : status.includes("failed") || status.includes("required")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {status}
              </div>
            )}

            {/* Create Task Form */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#19e619] to-[#15c213] p-4 md:p-5">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                  Task Details
                </h2>
              </div>

              <form onSubmit={onCreate} className="p-5 md:p-6 space-y-6">
                {/* Task Type Selection */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <span className="material-symbols-outlined text-base align-middle mr-1">calendar_today</span>
                    Task Schedule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRecurring(true)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isRecurring
                          ? "border-[#19e619] bg-[#19e619]/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          isRecurring ? "border-[#19e619]" : "border-slate-300"
                        }`}>
                          {isRecurring && <div className="w-3 h-3 rounded-full bg-[#19e619]"></div>}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-lg">repeat</span>
                            Daily Recurring
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Repeats every day in your routine
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRecurring(false)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        !isRecurring
                          ? "border-[#19e619] bg-[#19e619]/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                          !isRecurring ? "border-[#19e619]" : "border-slate-300"
                        }`}>
                          {!isRecurring && <div className="w-3 h-3 rounded-full bg-[#19e619]"></div>}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-lg">today</span>
                            Just for Today
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            One-time task for today only
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Task Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">title</span>
                      Task Title
                      <span className="text-red-500">*</span>
                    </div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                      placeholder="e.g., Brush Teeth, Take Medicine"
                      required
                    />
                  </label>

                  <label className="block">
                    <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">sentiment_satisfied</span>
                      Emoji Icon
                    </div>
                    <input
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                      placeholder="e.g., 🪥 😊 💊"
                      maxLength="2"
                    />
                    <p className="text-xs text-slate-500 mt-1">Add a fun emoji to represent this task</p>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block">
                    <div className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      Scheduled Time
                    </div>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                    />
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all">
                    <input
                      type="checkbox"
                      checked={isCritical}
                      onChange={(e) => setIsCritical(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-[#19e619] focus:ring-[#19e619] cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-red-500">priority_high</span>
                        Mark as Critical
                      </div>
                      <p className="text-xs text-slate-500">High priority task</p>
                    </div>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-[#19e619] to-[#15c213] text-white rounded-xl hover:shadow-lg hover:shadow-[#19e619]/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Create Task
                  </button>
                </div>
              </form>
            </section>

            {/* Task Lists */}
            <div className="space-y-6">
              {/* Daily Recurring Tasks */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-5">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-2xl">repeat</span>
                      Daily Recurring Tasks
                    </span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {recurringTasks.length}
                    </span>
                  </h2>
                  <p className="text-purple-100 text-sm mt-1">Tasks that repeat every day</p>
                </div>

                <div className="p-5 md:p-6">
                  {loading && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#19e619]"></div>
                      <p className="text-sm text-slate-500 mt-3">Loading tasks...</p>
                    </div>
                  )}

                  {!loading && recurringTasks.length === 0 && (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-6xl text-slate-300">event_repeat</span>
                      <p className="text-slate-500 mt-3">No daily recurring tasks yet</p>
                      <p className="text-sm text-slate-400">Create tasks that repeat every day in your routine</p>
                    </div>
                  )}

                  {!loading && recurringTasks.length > 0 && (
                    <div className="grid gap-3">
                      {recurringTasks.map((task) => (
                        <div
                          key={task.id}
                          className="group relative flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-purple-300 hover:bg-purple-50 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-purple-300 transition-all">
                            {task.emoji || "📝"}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-800">{task.title}</h3>
                              {task.is_critical && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                                  <span className="material-symbols-outlined text-sm">priority_high</span>
                                  Critical
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-sm">repeat</span>
                                Daily
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              {task.time}
                            </div>
                          </div>

                          <button
                            onClick={() => onDelete(task.id)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Today Only Tasks */}
              <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-5">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-2xl">today</span>
                      Today Only Tasks
                    </span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {todayTasks.length}
                    </span>
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">One-time tasks for today</p>
                </div>

                <div className="p-5 md:p-6">
                  {loading && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#19e619]"></div>
                      <p className="text-sm text-slate-500 mt-3">Loading tasks...</p>
                    </div>
                  )}

                  {!loading && todayTasks.length === 0 && (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-6xl text-slate-300">event_available</span>
                      <p className="text-slate-500 mt-3">No tasks for today</p>
                      <p className="text-sm text-slate-400">Create one-time tasks for today's activities</p>
                    </div>
                  )}

                  {!loading && todayTasks.length > 0 && (
                    <div className="grid gap-3">
                      {todayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="group relative flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center text-2xl flex-shrink-0 group-hover:border-blue-300 transition-all">
                            {task.emoji || "📝"}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-800">{task.title}</h3>
                              {task.is_critical && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-200">
                                  <span className="material-symbols-outlined text-sm">priority_high</span>
                                  Critical
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <span className="material-symbols-outlined text-sm">event</span>
                                One-time
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              {task.time}
                            </div>
                          </div>

                          <button
                            onClick={() => onDelete(task.id)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
