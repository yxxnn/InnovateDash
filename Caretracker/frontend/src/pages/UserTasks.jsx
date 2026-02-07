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
        emoji: emoji.trim() || "-",
        time,
        isCritical,
      });
      setTitle("");
      setEmoji("");
      setIsCritical(false);
      setStatus("Saved");
      await load();
    } catch (e) {
      setStatus(e.message || "Save failed");
    }
  }

  async function onDelete(taskId) {
    setStatus("");
    try {
      await deleteTask(taskId);
      await load();
    } catch (e) {
      setStatus(e.message || "Delete failed");
    }
  }

  return (
    <div className="bg-[#f6f8f6] min-h-screen text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col justify-between p-4">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-3 p-2">
              <div className="w-11 h-11 rounded-full bg-[#19e619]/20 flex items-center justify-center overflow-hidden border-2 border-[#19e619]">
                <span className="material-symbols-outlined text-[#19e619] text-2xl">person</span>
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">Hi, User!</h2>
                <p className="text-xs text-slate-500">Ready for today?</p>
              </div>
            </div>

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

          <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-xl md:text-2xl font-bold">Create Tasks</h1>
          <p className="text-sm text-slate-500">
            Tasks here appear in your daily routine.
          </p>
        </header>

        <section className="bg-white rounded-xl p-4 md:p-5 border border-slate-100">
          <form onSubmit={onCreate} className="grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-slate-500 mb-1">Title</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#19e619]/30"
                  placeholder="e.g. Wash Face"
                />
              </label>
              <label className="text-sm">
                <div className="text-xs text-slate-500 mb-1">Emoji (optional)</div>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#19e619]/30"
                  placeholder="e.g. :)"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">
                <div className="text-xs text-slate-500 mb-1">Time</div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#19e619]/30"
                />
              </label>
              <label className="text-sm flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                />
                <span className="text-sm">Critical task</span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-[#19e619] text-white rounded-lg hover:bg-[#15c213]"
              >
                Add Task
              </button>
              {status && <span className="text-xs text-slate-500">{status}</span>}
            </div>
          </form>
        </section>

        <section className="bg-white rounded-xl p-4 md:p-5 border border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-base md:text-lg font-bold">All Tasks</h2>
              <p className="text-xs text-slate-500">From caregiver and you</p>
            </div>
            <div className="text-xs text-slate-500">
              {tasks.length} total
            </div>
          </div>

          {loading && (
            <div className="text-sm text-slate-500">Loading tasks...</div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="text-sm text-slate-500">No tasks yet.</div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base">
                    {task.emoji || "-"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {task.time}
                      {task.isCritical ? " - Critical" : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
          </div>
        </main>
      </div>
    </div>
  );
}
