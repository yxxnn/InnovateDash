import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, getTasks, updateTask } from "../api";

export default function UserTasks() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId") || "u1";

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";
  const userDisplayName = userName || (userEmail ? userEmail.split("@")[0] : "User");

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("");
  const [time, setTime] = useState("07:00");
  const [isCritical, setIsCritical] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [view, setView] = useState("landing"); // landing, create, group
  const [groups, setGroups] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState("");
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskData, setEditingTaskData] = useState({});

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
      // Stay on create view to allow creating more tasks
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

  function startEditingTask(task) {
    setEditingTaskId(task.id);
    setEditingTaskData({
      title: task.title,
      emoji: task.emoji,
      time: task.time,
      isCritical: task.is_critical,
      isRecurring: task.is_recurring,
    });
  }

  async function saveEditedTask() {
    if (!editingTaskId) return;
    setStatus("Saving...");
    try {
      await updateTask(editingTaskId, editingTaskData);
      setStatus("Task updated successfully!");
      setEditingTaskId(null);
      setEditingTaskData({});
      await load();
      setTimeout(() => setStatus(""), 3000);
    } catch (e) {
      setStatus(e.message || "Update failed");
    }
  }

  function cancelEditingTask() {
    setEditingTaskId(null);
    setEditingTaskData({});
  }

  // Drag and drop handlers
  function handleDragStart(task) {
    setDraggedTask(task);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(groupId) {
    if (!draggedTask) return;
    
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        if (!group.tasks.find(t => t.id === draggedTask.id)) {
          return { ...group, tasks: [...group.tasks, draggedTask] };
        }
      }
      return group;
    }));
    
    setDraggedTask(null);
  }

  function removeFromGroup(groupId, taskId) {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, tasks: group.tasks.filter(t => t.id !== taskId) };
      }
      return group;
    }));
  }

  function createNewGroup() {
    if (!newGroupName.trim()) {
      setStatus("Group name is required");
      setTimeout(() => setStatus(""), 3000);
      return;
    }
    
    const newGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      tasks: []
    };
    
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName("");
    setShowNewGroupModal(false);
    setStatus("Group created successfully!");
    setTimeout(() => setStatus(""), 3000);
  }

  function deleteGroup(groupId) {
    if (!confirm("Are you sure you want to delete this group? Tasks will not be deleted.")) return;
    
    setGroups(prev => prev.filter(group => group.id !== groupId));
    setStatus("Group deleted");
    setTimeout(() => setStatus(""), 3000);
  }

  function startEditingGroup(groupId, currentName) {
    setEditingGroupId(groupId);
    setEditingGroupName(currentName);
  }

  function saveGroupName() {
    if (!editingGroupName.trim()) {
      setStatus("Group name cannot be empty");
      setTimeout(() => setStatus(""), 3000);
      return;
    }

    setGroups(prev => prev.map(group => 
      group.id === editingGroupId ? { ...group, name: editingGroupName.trim() } : group
    ));
    
    setEditingGroupId(null);
    setEditingGroupName("");
    setStatus("Group name updated!");
    setTimeout(() => setStatus(""), 3000);
  }

  function cancelEditing() {
    setEditingGroupId(null);
    setEditingGroupName("");
  }

  function saveGroups() {
    console.log("Saved groups:", groups);
    localStorage.setItem(`groups-${userId}`, JSON.stringify(groups));
    setShowSaveConfirmation(true);
  }

  // Load groups on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem(`groups-${userId}`);
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (e) {
        console.error("Failed to load groups:", e);
      }
    }
  }, [userId]);

  // Auto-save groups whenever they change
  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem(`groups-${userId}`, JSON.stringify(groups));
    }
  }, [groups, userId]);

  // Separate tasks by type
  const recurringTasks = tasks.filter(t => t.is_recurring);
  const todayTasks = tasks.filter(t => !t.is_recurring);

  return (
    <div className="bg-[#f6f8f6] min-h-screen text-slate-900">
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
              <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-[#19e619] text-white shadow-md shadow-[#19e619]/20 transition-all">
                <span className="material-symbols-outlined text-2xl">edit_note</span>
                <span className="text-base font-semibold">Manage Tasks</span>
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
              <h2 className="text-base font-bold">Hi, {userDisplayName}!</h2>
            </div>
            {view !== "landing" && (
              <button
                onClick={() => setView("landing")}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Landing View */}
            {view === "landing" && (
              <>
                <header className="text-center">
                  <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">Manage Your Tasks</h1>
                  <p className="text-sm md:text-lg text-slate-500">
                    Create, organize, and view your task groups
                  </p>
                </header>

                <div className="grid md:grid-cols-2 gap-4 md:gap-6 mt-8 max-w-2xl mx-auto">
                  {/* Create New Task Button */}
                  <button
                    onClick={() => setView("create")}
                    className="group relative bg-gradient-to-br from-[#19e619] to-[#15c213] rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-4xl md:text-5xl">add_circle</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold mb-2">Manage Tasks  </h2>
                      <p className="text-xs md:text-sm text-white/90">
                        Add a new task to your daily routine
                      </p>
                    </div>
                  </button>

                  {/* Group Tasks Button */}
                  <button
                    onClick={() => setView("group")}
                    className="group relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined text-4xl md:text-5xl">workspaces</span>
                      </div>
                      <h2 className="text-lg md:text-xl font-bold mb-2">Group Tasks</h2>
                      <p className="text-xs md:text-sm text-white/90">
                        Organize tasks into custom routines
                      </p>
                    </div>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-8">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined">analytics</span>
                    Quick Overview
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-3xl font-black text-[#19e619]">{tasks.length}</div>
                      <div className="text-sm text-slate-600 mt-1">Total Tasks</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-3xl font-black text-purple-600">{tasks.filter(t => t.is_recurring).length}</div>
                      <div className="text-sm text-slate-600 mt-1">Daily Tasks</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl col-span-2 md:col-span-1">
                      <div className="text-3xl font-black text-blue-600">{tasks.filter(t => !t.is_recurring).length}</div>
                      <div className="text-sm text-slate-600 mt-1">One-Time Tasks</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Create Task View */}
            {view === "create" && (
              <>
                <div className="flex items-center justify-between">
                  <header className="text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Create New Task</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">
                      Build your daily routine one task at a time
                    </p>
                  </header>
                  <button
                    onClick={() => setView("landing")}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                  </button>
                </div>

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

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditingTask(task)}
                              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-200"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Today Only Tasks */}}
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

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditingTask(task)}
                              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-blue-200"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => onDelete(task.id)}
                              className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-red-200 hover:border-red-300"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
              </>
            )}

            {/* Group Tasks View */}
            {view === "group" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <header className="text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Group Your Tasks</h1>
                    <p className="text-sm md:text-base text-slate-500 mt-1">
                      Create custom groups and drag tasks to organize your routines
                    </p>
                  </header>
                  <button
                    onClick={() => setView("landing")}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Back
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Available Tasks */}
                  <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-4 md:p-5">
                      <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-2xl">list</span>
                        Available Tasks
                      </h2>
                      <p className="text-slate-200 text-sm mt-1">Drag these to groups below</p>
                    </div>

                    <div className="p-5 md:p-6 max-h-96 overflow-y-auto">
                      {loading && (
                        <div className="text-center py-8">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-[#19e619]"></div>
                          <p className="text-sm text-slate-500 mt-3">Loading tasks...</p>
                        </div>
                      )}

                      {!loading && tasks.length === 0 && (
                        <div className="text-center py-12">
                          <span className="material-symbols-outlined text-6xl text-slate-300">inbox</span>
                          <p className="text-slate-500 mt-3">No tasks available</p>
                          <p className="text-sm text-slate-400 mb-4">Create some tasks first</p>
                          <button
                            onClick={() => setView("create")}
                            className="px-4 py-2 bg-[#19e619] text-white rounded-lg font-semibold hover:bg-[#15c213] transition-colors"
                          >
                            Create Task
                          </button>
                        </div>
                      )}

                      {!loading && tasks.length > 0 && (
                        <div className="space-y-2">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={() => handleDragStart(task)}
                              className="group flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-[#19e619] hover:bg-[#19e619]/5 transition-all cursor-move active:scale-95"
                            >
                              <div className="w-10 h-10 rounded-lg bg-white border-2 border-slate-200 flex items-center justify-center text-xl flex-shrink-0 group-hover:border-[#19e619] transition-all">
                                {task.emoji || "📝"}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-sm font-bold text-slate-800">{task.title}</h3>
                                  {task.is_critical && (
                                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-600">
                                      <span className="material-symbols-outlined text-xs">priority_high</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  {task.time}
                                </div>
                              </div>

                              <span className="material-symbols-outlined text-slate-400 group-hover:text-[#19e619]">
                                drag_indicator
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Group Drop Zones */}
                  <div className="space-y-4">
                    {groups.map((group, index) => {
                      const gradients = [
                        'bg-gradient-to-r from-orange-400 to-orange-500',
                        'bg-gradient-to-r from-blue-400 to-blue-500',
                        'bg-gradient-to-r from-indigo-500 to-indigo-600',
                        'bg-gradient-to-r from-purple-500 to-purple-600',
                        'bg-gradient-to-r from-pink-500 to-pink-600',
                        'bg-gradient-to-r from-green-500 to-green-600',
                        'bg-gradient-to-r from-teal-500 to-teal-600',
                        'bg-gradient-to-r from-cyan-500 to-cyan-600',
                      ];
                      const gradient = gradients[index % gradients.length];
                      
                      return (
                        <section
                          key={group.id}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(group.id)}
                          className={`bg-white rounded-2xl shadow-sm border-2 transition-all ${
                            draggedTask ? 'border-dashed border-[#19e619] bg-[#19e619]/5' : 'border-slate-200'
                          }`}
                        >
                          <div className={`p-4 ${gradient}`}>
                            <div className="flex items-center justify-between">
                              {editingGroupId === group.id ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="text"
                                    value={editingGroupName}
                                    onChange={(e) => setEditingGroupName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && saveGroupName()}
                                    className="flex-1 px-3 py-1.5 rounded-lg text-slate-800 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveGroupName}
                                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-white text-xl">check</span>
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-white text-xl">close</span>
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl">workspaces</span>
                                    {group.name}
                                    <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full ml-2">
                                      {group.tasks.length}
                                    </span>
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => startEditingGroup(group.id, group.name)}
                                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                      title="Edit group name"
                                    >
                                      <span className="material-symbols-outlined text-white text-lg">edit</span>
                                    </button>
                                    <button
                                      onClick={() => deleteGroup(group.id)}
                                      className="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                                      title="Delete group"
                                    >
                                      <span className="material-symbols-outlined text-white text-lg">delete</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="p-4 min-h-[120px]">
                            {group.tasks.length === 0 ? (
                              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                <span className="material-symbols-outlined text-4xl text-slate-300">add_circle</span>
                                <p className="text-slate-400 text-sm mt-2">Drop tasks here</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {group.tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg flex-shrink-0">
                                      {task.emoji || "📝"}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-sm font-bold text-slate-800 truncate">{task.title}</h4>
                                      <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        {task.time}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => removeFromGroup(group.id, task.id)}
                                      className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-red-400 text-lg">close</span>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}

                    {/* Create New Group Button */}
                    <button
                      onClick={() => setShowNewGroupModal(true)}
                      className="w-full p-6 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-[#19e619]/10 hover:to-[#19e619]/20 border-2 border-dashed border-slate-300 hover:border-[#19e619] rounded-2xl transition-all group"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-[#19e619]/10 transition-colors">
                          <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-[#19e619]">add_circle</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-600 group-hover:text-[#19e619]">Create New Group</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={saveGroups}
                    className="px-8 py-3.5 text-base font-semibold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">save</span>
                    Save Groups
                  </button>
                </div>

                {status && (
                  <div className={`p-4 rounded-xl text-sm font-medium text-center ${
                    status.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {status}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create New Group Modal */}
      {showNewGroupModal && (
        <div
          onClick={() => setShowNewGroupModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Create New Group</h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createNewGroup()}
                  placeholder="e.g., Morning Routine, Exercise Plan"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createNewGroup}
                  className="flex-1 py-3 bg-gradient-to-r from-[#19e619] to-[#15c213] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#19e619]/30 transition-all"
                >
                  Create Group
                </button>
                <button
                  onClick={() => {
                    setShowNewGroupModal(false);
                    setNewGroupName("");
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTaskId && (
        <div
          onClick={cancelEditingTask}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Edit Task</h3>
              <button
                onClick={cancelEditingTask}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingTaskData.title || ""}
                  onChange={(e) => setEditingTaskData({...editingTaskData, title: e.target.value})}
                  placeholder="Task title"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Emoji</label>
                <input
                  type="text"
                  value={editingTaskData.emoji || ""}
                  onChange={(e) => setEditingTaskData({...editingTaskData, emoji: e.target.value})}
                  placeholder="😊"
                  maxLength="2"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                <input
                  type="time"
                  value={editingTaskData.time || ""}
                  onChange={(e) => setEditingTaskData({...editingTaskData, time: e.target.value})}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTaskData.isCritical || false}
                    onChange={(e) => setEditingTaskData({...editingTaskData, isCritical: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-semibold text-slate-700">Critical</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTaskData.isRecurring ?? true}
                    onChange={(e) => setEditingTaskData({...editingTaskData, isRecurring: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-sm font-semibold text-slate-700">Recurring</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveEditedTask}
                  className="flex-1 py-3 bg-gradient-to-r from-[#19e619] to-[#15c213] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#19e619]/30 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={cancelEditingTask}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div
          onClick={() => setShowSaveConfirmation(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Groups Saved!</h3>
            <p className="text-slate-600 mb-6">
              Your task groups have been successfully saved. You can continue organizing your tasks or return to the main page.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSaveConfirmation(false);
                  setView("landing");
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                Go to Main Page
              </button>
              <button
                onClick={() => setShowSaveConfirmation(false)}
                className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Continue Organizing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
