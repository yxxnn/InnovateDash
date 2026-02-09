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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lateMessage, setLateMessage] = useState(null);
  const [undoReasonPicker, setUndoReasonPicker] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [savedGroups, setSavedGroups] = useState([]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load saved groups from localStorage
  useEffect(() => {
    const groupsData = localStorage.getItem(`groups-${userId}`);
    if (groupsData) {
      try {
        setSavedGroups(JSON.parse(groupsData));
      } catch (e) {
        console.error("Failed to load groups:", e);
      }
    }
  }, [userId]);

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

  // Helper function to parse time window from task.time
  function parseTimeWindow(timeString) {
    // Example: "8:00 AM" or "8:00–9:00 AM" or "8:00 - 9:00 AM"
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)?(?:\s*[-–]\s*(\d+):(\d+)\s*(AM|PM))?/i);
    if (!match) return null;

    const startHour = parseInt(match[1]);
    const startMin = parseInt(match[2]);
    const startPeriod = match[3]?.toUpperCase();
    
    let endHour, endMin, endPeriod;
    if (match[4]) {
      endHour = parseInt(match[4]);
      endMin = parseInt(match[5]);
      endPeriod = match[6]?.toUpperCase() || startPeriod;
    } else {
      // No end time, assume 1-hour window
      endHour = startHour + 1;
      endMin = startMin;
      endPeriod = startPeriod;
    }

    // Convert to 24-hour format
    let start24 = startHour;
    let end24 = endHour;
    
    if (startPeriod === 'PM' && startHour !== 12) start24 += 12;
    if (startPeriod === 'AM' && startHour === 12) start24 = 0;
    if (endPeriod === 'PM' && endHour !== 12) end24 += 12;
    if (endPeriod === 'AM' && endHour === 12) end24 = 0;

    return {
      startHour: start24,
      startMin,
      endHour: end24,
      endMin
    };
  }

  function isWithinTimeWindow(task) {
    const window = parseTimeWindow(task.time);
    if (!window) return true; // If we can't parse, assume it's okay

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const windowStart = window.startHour * 60 + window.startMin;
    const windowEnd = window.endHour * 60 + window.endMin;

    return currentMinutes >= windowStart && currentMinutes <= windowEnd;
  }

  function isBeforeTimeWindow(task) {
    const window = parseTimeWindow(task.time);
    if (!window) return false; // If we can't parse, don't lock it

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const windowStart = window.startHour * 60 + window.startMin;

    return currentMinutes < windowStart;
  }

  function getTimeUntilStart(task) {
    const window = parseTimeWindow(task.time);
    if (!window) return "";

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const windowStart = window.startHour * 60 + window.startMin;
    const minutesUntil = windowStart - currentMinutes;

    if (minutesUntil <= 0) return "";

    const hours = Math.floor(minutesUntil / 60);
    const mins = minutesUntil % 60;

    if (hours > 0) {
      return `in ${hours}h ${mins}m`;
    } else {
      return `in ${mins}m`;
    }
  }

  async function onMarkDone(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const isOnTime = isWithinTimeWindow(task);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: true, completedLate: !isOnTime } : t))
    );

    // Show late message if completed late
    if (!isOnTime) {
      setLateMessage({
        taskTitle: task.title,
        taskId: taskId
      });
      setTimeout(() => setLateMessage(null), 4000);
    }

    try {
      const result = await toggleTaskDone(taskId, userId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: result.done, completedLate: !isOnTime } : t))
      );
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: false, completedLate: false } : t))
      );
    }
  }

  async function onUndoTask(taskId, reason) {
    const task = tasks.find(t => t.id === taskId);
    
    // Log the reason
    console.log(`Task ${taskId} (${task.title}) unmarked. Reason: ${reason}`);
    
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: false, completedLate: false } : t))
    );

    try {
      const result = await toggleTaskDone(taskId, userId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: result.done, completedLate: false } : t))
      );
    } catch (e) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, done: true } : t))
      );
    }
  }

  function handleUndoClick(taskId) {
    setUndoReasonPicker(taskId);
  }

  function handleReasonSelected(reason) {
    const taskId = undoReasonPicker;
    setUndoReasonPicker(null);
    onUndoTask(taskId, reason);
  }

  const completed = tasks.filter((t) => t.done).length;
  const toGo = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  // Group tasks based on saved groups from localStorage
  const groupedTasks = () => {
    // Create a map of task IDs in groups
    const taskToGroup = new Map();
    savedGroups.forEach(group => {
      group.tasks.forEach(groupTask => {
        taskToGroup.set(groupTask.id, group.id);
      });
    });

    // Map groups with their actual tasks from today's tasks (with done status)
    const groups = savedGroups.map(group => {
      const groupTaskIds = new Set(group.tasks.map(t => t.id));
      const matchedTasks = tasks.filter(task => groupTaskIds.has(task.id));
      return {
        id: group.id,
        name: group.name,
        tasks: matchedTasks
      };
    }).filter(g => g.tasks.length > 0); // Only show groups with tasks for today

    // Find ungrouped tasks (tasks not in any group)
    const groupedTaskIds = new Set();
    savedGroups.forEach(group => {
      group.tasks.forEach(task => groupedTaskIds.add(task.id));
    });
    const ungrouped = tasks.filter(task => !groupedTaskIds.has(task.id));

    return { groups, ungrouped };
  };

  const { groups, ungrouped } = groupedTasks();

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Format current time
  const formatTime = () => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return { hours, minutes: minutesStr, ampm };
  };

  const { hours, minutes, ampm } = formatTime();

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "";
  const userDisplayName = userName || (userEmail ? userEmail.split("@")[0] : "User");
  // Find the first undone and unlocked task index (this is the "current" task)
  const currentIndex = tasks.findIndex((t) => !t.done && !isBeforeTimeWindow(t));

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
            <button 
              onClick={() => navigate("/settings")}
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

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Header Card */}
            <header className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                {/* Current Time */}
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">
                    Current Time
                  </span>
                  <div className="text-6xl font-black text-slate-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-5xl text-primary">schedule</span>
                    {hours}:{minutes} <span className="text-3xl font-bold text-slate-400">{ampm}</span>
                  </div>
                </div>

                {/* Done and To Go Counters */}
                <div className="flex items-center gap-6">
                  {/* Done Counter */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex flex-col items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-3xl">check_circle</span>
                      <span className="text-xl font-black">{completed}</span>
                    </div>
                    <span className="font-bold text-slate-700">Done</span>
                  </div>

                  {/* To Go Counter */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-200 flex flex-col items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-3xl">pending</span>
                      <span className="text-xl font-black">{toGo}</span>
                    </div>
                    <span className="font-bold text-slate-500">To Go</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-800">
                    {allDone ? "All Done! 🎉" : "Morning Routine Progress"}
                  </span>
                  <span className="text-primary">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
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
              <section className="space-y-4">
                {/* Render Groups */}
                {groups.map(group => {
                  const isExpanded = expandedGroups[group.id];
                  const groupCompleted = group.tasks.filter(t => t.done).length;
                  const groupTotal = group.tasks.length;

                  return (
                    <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* Group Header */}
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-2xl text-[#19e619]">
                            {isExpanded ? 'expand_more' : 'chevron_right'}
                          </span>
                          <h3 className="text-lg md:text-xl font-bold text-slate-800">{group.name}</h3>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-semibold rounded-full">
                            {groupCompleted}/{groupTotal}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 md:w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#19e619] transition-all duration-300"
                              style={{ width: `${(groupCompleted / groupTotal) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </button>

                      {/* Group Tasks */}
                      {isExpanded && (
                        <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-3 relative">
                          {/* Vertical Line Connector */}
                          <div className="absolute left-7 md:left-10 top-4 bottom-4 w-0.5 bg-slate-200"></div>

                          {group.tasks.map((task, idx) => {
                            const isDone = task.done;
                            const isLocked = !isDone && isBeforeTimeWindow(task);
                            const allTasksInGroup = group.tasks;
                            const currentInGroup = allTasksInGroup.findIndex((t) => !t.done && !isBeforeTimeWindow(t));
                            const isCurrent = idx === currentInGroup;
                            const isUpcoming = !isDone && !isCurrent && !isLocked;
                            const image = getTaskImage(task.title);
                            const description = getTaskDescription(task.title);
                            const timeUntil = isLocked ? getTimeUntilStart(task) : "";

                            return (
                              <div
                                key={task.id}
                                className={`flex gap-3 md:gap-4 items-start ${isLocked ? "opacity-80" : isUpcoming ? "opacity-70" : ""}`}
                              >
                                {/* Timeline Node */}
                                <div className="flex-shrink-0 w-10 md:w-16 flex flex-col items-center">
                                  {isDone ? (
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white ring-3 md:ring-6 ring-white ${
                                      task.completedLate ? 'bg-yellow-500' : 'bg-[#19e619]'
                                    }`}>
                                      <span className="material-symbols-outlined text-base md:text-xl">check</span>
                                    </div>
                                  ) : isCurrent ? (
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-3 border-[#19e619] flex items-center justify-center text-[#19e619] ring-3 md:ring-6 ring-white animate-pulse">
                                      <div className="w-2 h-2 bg-[#19e619] rounded-full"></div>
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 ring-3 md:ring-6 ring-white">
                                      <span className="material-symbols-outlined text-base md:text-xl">lock_clock</span>
                                    </div>
                                  )}
                                </div>

                                {/* Task Card */}
                                <div
                                  onClick={() => !isLocked && setSelectedTask(task)}
                                  className={`flex-1 bg-slate-50 rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 md:gap-4 items-center transition-all ${
                                    isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                                  } ${
                                    isCurrent
                                      ? "p-4 md:p-6 shadow-lg border-2 border-[#19e619] ring-3 ring-[#19e619]/10 hover:scale-[1.01]"
                                      : isDone
                                      ? "p-3 md:p-4 border-2 border-[#19e619]/20"
                                      : isLocked
                                      ? "p-3 md:p-4 border-2 border-slate-300"
                                      : "p-3 md:p-4 border border-slate-200 hover:shadow-md"
                                  }`}
                                >
                                  {/* Task Image or Emoji */}
                                  {image ? (
                                    <div
                                      className={`flex-shrink-0 rounded-lg overflow-hidden border ${
                                        isCurrent
                                          ? "w-20 h-20 md:w-24 md:h-24 bg-blue-50 border-blue-100"
                                          : isDone
                                          ? "w-16 h-16 md:w-20 md:h-20 bg-[#19e619]/10 border-[#19e619]/10"
                                          : isLocked
                                          ? "w-16 h-16 md:w-20 md:h-20 bg-slate-200 border-slate-300"
                                          : "w-16 h-16 md:w-20 md:h-20 bg-slate-100"
                                      }`}
                                    >
                                      <img
                                        src={image}
                                        alt={task.title}
                                        className={`w-full h-full object-cover ${isLocked || isUpcoming ? "grayscale" : ""}`}
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
                                        isCurrent
                                          ? "w-20 h-20 md:w-24 md:h-24 bg-[#19e619]/10 border border-[#19e619]/20"
                                          : isDone
                                          ? "w-16 h-16 md:w-20 md:h-20 bg-[#19e619]/10 border border-[#19e619]/10"
                                          : isLocked
                                          ? "w-16 h-16 md:w-20 md:h-20 bg-slate-200 border border-slate-300"
                                          : "w-16 h-16 md:w-20 md:h-20 bg-slate-100 border border-slate-200"
                                      }`}
                                    >
                                      <span className={`${isCurrent ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"} ${isLocked ? "grayscale" : ""}`}>
                                        {task.emoji}
                                      </span>
                                    </div>
                                  )}

                                  {/* Task Content */}
                                  <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h3
                                        className={`font-bold ${
                                          isCurrent ? "text-base md:text-lg font-black" : "text-sm md:text-base"
                                        }`}
                                      >
                                        {task.title}
                                      </h3>
                                      {/* Badges for Recurring and Critical */}
                                      {task.isRecurring && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">repeat</span>
                                          Recurring
                                        </span>
                                      )}
                                      {!task.isRecurring && (
                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">today</span>
                                          Today Only
                                        </span>
                                      )}
                                      {task.isCritical && (
                                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">priority_high</span>
                                          Critical
                                        </span>
                                      )}
                                    </div>
                                    <p
                                      className={`text-slate-600 mb-2 ${
                                        isCurrent ? "text-sm md:text-base" : "text-xs md:text-sm"
                                      }`}
                                    >
                                      {task.time} {isDone ? "" : isLocked ? "" : `• ${description}`}
                                    </p>

                                    {/* Action / Status */}
                                    {isDone ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUndoClick(task.id);
                                        }}
                                        className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                          task.completedLate 
                                            ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                            : 'text-[#19e619] bg-[#19e619]/10 hover:bg-[#19e619]/20'
                                        }`}
                                      >
                                        <span className="material-symbols-outlined text-base">
                                          {task.completedLate ? 'schedule' : 'verified'}
                                        </span>
                                        {task.completedLate ? 'Done (Late)' : 'Done!'}
                                      </button>
                                    ) : isLocked ? (
                                      <div className="flex items-center gap-2 text-slate-500">
                                        <span className="material-symbols-outlined text-lg">lock</span>
                                        <p className="text-xs md:text-sm font-semibold">Locked {timeUntil}</p>
                                      </div>
                                    ) : isCurrent ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onMarkDone(task.id);
                                        }}
                                        className="w-full sm:w-auto py-2 md:py-2.5 px-6 bg-[#19e619] text-white rounded-lg text-sm md:text-base font-bold flex items-center justify-center gap-2 hover:bg-[#15c213] transition-all active:scale-95 shadow-md shadow-[#19e619]/30"
                                      >
                                        <span className="material-symbols-outlined text-lg md:text-xl">check_circle</span>
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
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Ungrouped Tasks */}
                {ungrouped.length > 0 && (
                  <div className="space-y-4 relative">
                    {/* Section Header */}
                    {groups.length > 0 && (
                      <h3 className="text-lg font-bold text-slate-700 px-2">Other Tasks</h3>
                    )}
                    
                    {/* Vertical Line Connector */}
                    <div className="absolute left-5 md:left-8 top-12 bottom-8 w-0.5 bg-slate-200 -z-10"></div>

                    {ungrouped.map((task, idx) => {
                      const isDone = task.done;
                      const isLocked = !isDone && isBeforeTimeWindow(task);
                      const ungroupedCurrentIndex = ungrouped.findIndex((t) => !t.done && !isBeforeTimeWindow(t));
                      const isCurrent = idx === ungroupedCurrentIndex;
                      const isUpcoming = !isDone && !isCurrent && !isLocked;
                      const image = getTaskImage(task.title);
                      const description = getTaskDescription(task.title);
                      const timeUntil = isLocked ? getTimeUntilStart(task) : "";

                      return (
                        <div
                          key={task.id}
                          className={`flex gap-3 md:gap-4 items-start ${isLocked ? "opacity-80" : isUpcoming ? "opacity-70" : ""}`}
                        >
                          {/* Timeline Node */}
                          <div className="flex-shrink-0 w-10 md:w-16 flex flex-col items-center">
                            {isDone ? (
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white ring-3 md:ring-6 ring-[#f6f8f6] ${
                                task.completedLate ? 'bg-yellow-500' : 'bg-[#19e619]'
                              }`}>
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
                            onClick={() => !isLocked && setSelectedTask(task)}
                            className={`flex-1 bg-white rounded-xl shadow-sm flex flex-col sm:flex-row gap-3 md:gap-4 items-center transition-all ${
                              isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                            } ${
                              isCurrent
                                ? "p-4 md:p-6 shadow-lg border-2 border-[#19e619] ring-3 ring-[#19e619]/10 hover:scale-[1.01]"
                                : isDone
                                ? "p-3 md:p-4 border-2 border-[#19e619]/20"
                                : isLocked
                                ? "p-3 md:p-4 border-2 border-slate-300 bg-slate-50"
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
                                    : isLocked
                                    ? "w-16 h-16 md:w-24 md:h-24 bg-slate-200 border-slate-300"
                                    : "w-16 h-16 md:w-24 md:h-24 bg-slate-100"
                                }`}
                              >
                                <img
                                  src={image}
                                  alt={task.title}
                                  className={`w-full h-full object-cover ${isLocked || isUpcoming ? "grayscale" : ""}`}
                                />
                              </div>
                            ) : (
                              <div
                                className={`flex-shrink-0 rounded-lg flex items-center justify-center ${
                                  isCurrent
                                    ? "w-20 h-20 md:w-28 md:h-28 bg-[#19e619]/10 border border-[#19e619]/20"
                                    : isDone
                                    ? "w-16 h-16 md:w-24 md:h-24 bg-[#19e619]/10 border border-[#19e619]/10"
                                    : isLocked
                                    ? "w-16 h-16 md:w-24 md:h-24 bg-slate-200 border border-slate-300"
                                    : "w-16 h-16 md:w-24 md:h-24 bg-slate-100 border border-slate-200"
                                }`}
                              >
                                <span className={`${isCurrent ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"} ${isLocked ? "grayscale" : ""}`}>
                                  {task.emoji}
                                </span>
                              </div>
                            )}

                            {/* Task Content */}
                            <div className="flex-1 text-center sm:text-left">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3
                                  className={`font-bold ${
                                    isCurrent ? "text-base md:text-xl font-black" : "text-sm md:text-lg"
                                  }`}
                                >
                                  {task.title}
                                </h3>
                                {/* Badges for Recurring and Critical */}
                                {task.isRecurring && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">repeat</span>
                                    Recurring
                                  </span>
                                )}
                                {!task.isRecurring && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">today</span>
                                    Today Only
                                  </span>
                                )}
                                {task.isCritical && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-md flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">priority_high</span>
                                    Critical
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-slate-600 mb-2 ${
                                  isCurrent ? "text-sm md:text-base" : "text-xs md:text-sm"
                                }`}
                              >
                                {task.time} {isDone ? "" : isLocked ? "" : `• ${description}`}
                              </p>

                              {/* Action / Status */}
                              {isDone ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUndoClick(task.id);
                                  }}
                                  className={`inline-flex items-center gap-1.5 text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${
                                    task.completedLate 
                                      ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                                      : 'text-[#19e619] bg-[#19e619]/10 hover:bg-[#19e619]/20'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-base">
                                    {task.completedLate ? 'schedule' : 'verified'}
                                  </span>
                                  {task.completedLate ? 'Done (Late)' : 'Done!'}
                                </button>
                              ) : isLocked ? (
                                <div className="flex items-center gap-2 text-slate-500">
                                  <span className="material-symbols-outlined text-lg">lock</span>
                                  <p className="text-xs md:text-sm font-semibold">Locked {timeUntil}</p>
                                </div>
                              ) : isCurrent ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkDone(task.id);
                                  }}
                                  className="w-full py-2.5 md:py-3.5 bg-[#19e619] text-white rounded text-base md:text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#15c213] transition-all active:scale-95 shadow-md shadow-[#19e619]/30"
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
                  </div>
                )}
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
                      handleUndoClick(selectedTask.id);
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

      {/* Late Completion Message */}
      {lateMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-md border-2 border-yellow-400">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-2xl">👍</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 mb-1">You completed this a bit late</h4>
                <p className="text-sm text-slate-600">That's okay! Keep going! 👍</p>
              </div>
              <button
                onClick={() => setLateMessage(null)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Reason Picker */}
      {undoReasonPicker && (
        <div
          onClick={() => setUndoReasonPicker(null)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-2 text-center">Why are you unmarking this?</h3>
            <p className="text-sm text-slate-500 mb-6 text-center">Just tap one to let us know</p>

            <div className="space-y-3">
              <button
                onClick={() => handleReasonSelected('Accidentally tapped')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                  ⏱
                </div>
                <span className="text-lg font-semibold text-slate-700">Accidentally tapped</span>
              </button>

              <button
                onClick={() => handleReasonSelected("Didn't actually do it")}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                  😵
                </div>
                <span className="text-lg font-semibold text-slate-700">Didn't actually do it</span>
              </button>

              <button
                onClick={() => handleReasonSelected('Not sure')}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-4 group"
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">
                  ❓
                </div>
                <span className="text-lg font-semibold text-slate-700">Not sure</span>
              </button>
            </div>

            <button
              onClick={() => setUndoReasonPicker(null)}
              className="w-full mt-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
