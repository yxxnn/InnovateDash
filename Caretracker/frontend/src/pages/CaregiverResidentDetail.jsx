import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile, getTasks, createTask, updateTask, deleteTask, getTodayTasks, getStreaks } from "../api";

export default function CaregiverResidentDetail() {
  const { residentId } = useParams();
  const navigate = useNavigate();
  const caregiverName = localStorage.getItem("caregiverName") || "Caregiver";

  const [resident, setResident] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [independenceScore, setIndependenceScore] = useState(0);

  // Task management
  const [editingTask, setEditingTask] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    emoji: "📝",
    time: "10:00 AM",
    isCritical: false,
  });

  async function loadData() {
    setLoading(true);
    try {
      const [profile, allTasks, todayTasksData, streakData] = await Promise.all([
        getUserProfile(residentId),
        getTasks(residentId),
        getTodayTasks(residentId),
        getStreaks(residentId),
      ]);

      setResident(profile);
      setTasks(allTasks.tasks || []);
      setTodayTasks(todayTasksData.tasks || []);
      setStreak(streakData.currentStreak || 0);

      // Calculate independence score based on completion rate
      const totalTasks = allTasks.tasks?.length || 0;
      const doneTasks = allTasks.tasks?.filter((t) => t.done)?.length || 0;
      const completionRate = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;
      setIndependenceScore(Math.round(completionRate));
    } catch (e) {
      console.error("Error loading resident data:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [residentId]);

  async function handleAddTask() {
    if (!newTaskData.title.trim()) {
      alert("Please enter a task name");
      return;
    }

    try {
      await createTask({
        userId: residentId,
        title: newTaskData.title,
        emoji: newTaskData.emoji,
        time: newTaskData.time,
        isCritical: newTaskData.isCritical,
      });

      setNewTaskData({ title: "", emoji: "📝", time: "10:00 AM", isCritical: false });
      setShowAddTask(false);
      await loadData();
    } catch (e) {
      alert("Failed to add task: " + e.message);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this task?")) return;

    try {
      await deleteTask(taskId);
      await loadData();
    } catch (e) {
      alert("Failed to delete task: " + e.message);
    }
  }

  async function handleToggleTask(taskId, isDone) {
    try {
      await updateTask(taskId, { done: !isDone });
      await loadData();
    } catch (e) {
      alert("Failed to update task: " + e.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full mb-3"></div>
          <p className="text-slate-500">Loading resident data...</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Resident not found</p>
          <button onClick={() => navigate("/caregiver")} className="mt-4 text-primary font-semibold hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const completedToday = todayTasks.filter((t) => t.done).length;
  const totalToday = todayTasks.length;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 lg:px-20 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/caregiver")} className="text-slate-600 hover:text-slate-900">
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Caregiver Portal</h2>
              <p className="text-xs text-slate-500">Managing: <span className="font-semibold text-slate-900">{resident?.name || "User"}</span> (@{resident?.email?.split("@")[0] || "user"})</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
            {(caregiverName || "C")[0].toUpperCase()}
          </div>
        </div>
      </header>

      <main className="px-4 lg:px-20 py-8">
        {/* User Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="size-24 lg:size-32 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-5xl font-bold text-primary">
                {(resident.name || "U")[0].toUpperCase()}
              </div>
              <div className="absolute bottom-1 right-1 bg-primary size-5 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <h1 className="text-3xl font-bold">{resident.name || "User"}</h1>
                  <p className="text-sm text-slate-500 font-semibold">@{resident.email?.split("@")[0] || "user"}</p>
                </div>
                {completedToday === totalToday && totalToday > 0 ? (
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">Tasks Complete</span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-200">In Progress</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <span className="material-symbols-outlined text-sm">email</span>
                <p className="text-sm font-medium">{resident.email}</p>
              </div>
              <p className="text-xs text-slate-400">{completedToday} of {totalToday} tasks completed today</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-2 bg-primary text-white hover:opacity-90 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add Task
            </button>
          </div>
        </div>

        {/* Add Task Form */}
        {showAddTask && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-4">Add New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task name (e.g., Take Medicine)"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={newTaskData.emoji}
                  onChange={(e) => setNewTaskData({ ...newTaskData, emoji: e.target.value })}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="📝">📝 General</option>
                  <option value="💊">💊 Medicine</option>
                  <option value="🪥">🪥 Hygiene</option>
                  <option value="🍽️">🍽️ Meals</option>
                  <option value="🧹">🧹 Chores</option>
                </select>
                <input
                  type="text"
                  placeholder="Time (e.g., 10:00 AM)"
                  value={newTaskData.time}
                  onChange={(e) => setNewTaskData({ ...newTaskData, time: e.target.value })}
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTaskData.isCritical}
                    onChange={(e) => setNewTaskData({ ...newTaskData, isCritical: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Critical</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold hover:opacity-90 transition-all"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 bg-slate-100 text-slate-900 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Current Routine Progress */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Today's Tasks</h3>
                <span className="text-xs font-medium text-slate-500">
                  {completedToday} of {totalToday} completed
                </span>
              </div>
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        task.done
                          ? "bg-slate-50 border-slate-100"
                          : "bg-white border-2 border-primary"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button
                          onClick={() => handleToggleTask(task.id, task.done)}
                          className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            task.done ? "bg-primary/20 text-primary" : "bg-primary text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined">{task.done ? "check_circle" : task.emoji}</span>
                        </button>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{task.emoji} {task.title}</p>
                          <p className="text-xs text-slate-500">{task.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.isCritical && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Critical</span>}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          task.done
                            ? "text-primary bg-primary/10"
                            : "text-slate-400 bg-slate-100"
                        }`}>
                          {task.done ? "Done" : "Pending"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">No tasks for today</div>
                )}
              </div>
            </div>

            {/* All Tasks Management */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">All Tasks</h3>
                <span className="text-xs font-medium text-slate-500">{tasks.length} total</span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{task.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.isCritical && <span className="text-[10px] font-bold text-red-600">⚠️</span>}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">No tasks yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Independence Insights */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Independence Insights</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-4">Task completion consistency</p>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {[60, 75, 65, 85, 95, 40, 30].map((value, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full">
                        <div className="w-full bg-primary/20 rounded-t hover:bg-primary transition-all cursor-pointer" style={{ height: `${value}%` }}></div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Streak</span>
                    <span className="text-sm font-bold text-primary">{streak} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Independence Score</span>
                    <span className="text-sm font-bold">{independenceScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Privacy Status</span>
                    <span className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Secured
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Send Encouragement */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold mb-4 text-center">Send Encouragement</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-all text-left">
                  <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    grade
                  </span>
                  <div>
                    <p className="text-sm font-bold">Great Job</p>
                    <p className="text-[10px] text-slate-400">Send a Star</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-all text-left">
                  <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  <div>
                    <p className="text-sm font-bold">Sending Love</p>
                    <p className="text-[10px] text-slate-400">Send a Heart</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-primary hover:bg-primary/5 px-4 py-3 rounded-lg transition-all text-left">
                  <span className="material-symbols-outlined text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    thumb_up
                  </span>
                  <div>
                    <p className="text-sm font-bold">You Got This</p>
                    <p className="text-[10px] text-slate-400">Send Thumbs Up</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
