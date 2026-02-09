import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCaregiverOverview, getTasks, getUserProfile, getStreaks, getCaregiverWeeklyStats, getCaregiverRecentActivity } from "../api";

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const caregiverId = localStorage.getItem("caregiverId");
  const caregiverName = localStorage.getItem("caregiverName") || "Caregiver";

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeNow: 0, avgStreak: 0, weeklyTrend: [] });
  const [recentActivity, setRecentActivity] = useState(null);

  async function loadResidents() {
    setLoading(true);
    try {
      // Get overview data for this caregiver
      const overviewData = await getCaregiverOverview(caregiverId);
      const overview = overviewData.overview || [];

      // For each resident in overview, build resident details
      const residentDetails = overview.map((resident) => {
        const total = resident.total || 0;
        const done = resident.done || 0;
        const canSeeTasks = resident.canSeeTasks !== false; // Default to true if not specified
        const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          id: resident.userId,
          name: resident.name || "User",
          email: "user@example.com",
          facility: "Care Facility",
          completionPercentage: canSeeTasks ? percentage : 0,
          tasksCompleted: canSeeTasks ? done : 0,
          tasksTotal: canSeeTasks ? total : 0,
          status: canSeeTasks ? (percentage === 100 ? "Completed" : percentage >= 80 ? "Almost Done" : percentage >= 50 ? "In Progress" : "Just Started") : "Insights Only",
          statusBadge: canSeeTasks ? (percentage === 100 ? "✅" : "⚠️") : "🔒",
          lastActivity: canSeeTasks ? `${done}/${total} tasks completed` : "Tasks hidden - view insights only",
          canSeeTasks,
        };
      });

      setResidents(residentDetails);

      // Fetch streak data for statistics
      await loadStats(residentDetails);
    } catch (e) {
      console.error("Error loading overview:", e);
      setResidents([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(residentDetails) {
    try {
      // Get streaks for all residents
      const streakPromises = residentDetails.map((resident) =>
        getStreaks(resident.id)
          .then((data) => data.currentStreak || 0)
          .catch(() => 0)
      );

      const streaks = await Promise.all(streakPromises);
      const avgStreak = streaks.length > 0 ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0;

      // Fetch real weekly trend data from backend
      const weeklyStatsData = await getCaregiverWeeklyStats();
      const weeklyTrend = weeklyStatsData.weeklyTrend || [0, 0, 0, 0, 0, 0, 0];

      // Active count = residents with < 100% completion
      const activeCount = residentDetails.filter((r) => r.completionPercentage < 100).length;

      // Fetch recent activity
      const activityData = await getCaregiverRecentActivity();
      setRecentActivity(activityData);

      setStats({
        activeNow: activeCount,
        avgStreak: avgStreak,
        weeklyTrend: weeklyTrend,
      });
    } catch (e) {
      console.error("Error loading stats:", e);
      // Fallback stats
      setRecentActivity(null);
      setStats({
        activeNow: residentDetails.filter((r) => r.completionPercentage < 100).length,
        avgStreak: 0,
        weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
      });
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);

  const getStatusColor = (percentage) => {
    if (percentage === 100) return "bg-green-100 text-green-700";
    if (percentage >= 80) return "bg-blue-100 text-blue-700";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Caregiver Dashboard</h1>
              <p className="text-slate-500 text-lg mt-1 font-medium">
                {residents.length > 0 ? `Managing ${residents.length} resident${residents.length !== 1 ? "s" : ""}` : "No residents assigned"}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 pr-4 rounded-xl shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {(caregiverName || "C")[0].toUpperCase()}
                </div>
                <span className="font-bold text-slate-700">{caregiverName}</span>
              </div>
            </div>
          </header>

          {/* Residents Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">My Residents</h2>
              <button 
                onClick={() => navigate("/caregiver/add-resident")}
                className="text-primary font-bold flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined font-bold">add_circle</span>
                Add Resident
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full mb-3"></div>
                  <p className="text-slate-500">Loading residents...</p>
                </div>
              </div>
            ) : residents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {residents.map((resident) => (
                  <div
                    key={resident.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/caregiver/resident/${resident.id}`)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-3xl font-bold ${
                        resident.canSeeTasks ? "bg-slate-100 text-slate-400" : "bg-slate-200 text-slate-500"
                      }`}>
                        {resident.canSeeTasks ? (
                          (resident.name || "U")[0].toUpperCase()
                        ) : (
                          <span className="material-symbols-outlined text-2xl">lock</span>
                        )}
                      </div>
                      <div className={`${resident.canSeeTasks ? getStatusColor(resident.completionPercentage) : "bg-slate-100 text-slate-600"} font-bold px-3 py-1 rounded-full text-sm`}>
                        {resident.canSeeTasks ? `${resident.completionPercentage}% Done` : "🔒 Insights"}
                      </div>
                    </div>

                    {/* Resident Info */}
                    <h3 className="text-xl font-bold text-slate-900">{resident.name}</h3>
                    <p className="text-sm text-slate-500 font-semibold mb-4">@{resident.email?.split("@")[0] || "user"}</p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${resident.completionPercentage}%` }}></div>
                    </div>

                    {/* Status */}
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">
                      <span>{resident.canSeeTasks ? "Daily Tasks" : "View Mode"}</span>
                      <span className={resident.canSeeTasks ? (resident.completionPercentage === 100 ? "text-primary flex items-center gap-1" : "text-slate-400") : "text-slate-500 flex items-center gap-1"}>
                        {resident.canSeeTasks ? (
                          resident.completionPercentage === 100 ? (
                            <>
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Completed
                            </>
                          ) : (
                            resident.status
                          )
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Insights Only
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add New Card */}
                <div 
                  onClick={() => navigate("/caregiver/add-resident")}
                  className="bg-slate-100/50 rounded-2xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary transition-all cursor-pointer min-h-[220px]"
                >
                  <span className="material-symbols-outlined text-4xl mb-2">person_add</span>
                  <span className="font-bold">Add New Resident</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <p className="text-slate-500 text-lg">No residents assigned yet</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Right Sidebar - Insights */}
      <aside className="w-96 bg-white border-l border-slate-100 p-8 flex flex-col gap-8 overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-900">Insights</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background-light p-4 rounded-2xl border border-slate-50">
            <p className="text-sm font-medium text-slate-500 mb-1">Active Now</p>
            <p className="text-3xl font-black text-slate-900">{stats.activeNow}</p>
          </div>
          <div className="bg-background-light p-4 rounded-2xl border border-slate-50">
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Streak</p>
            <p className="text-3xl font-black text-primary">{stats.avgStreak}d</p>
          </div>
        </div>

        {/* Weekly Consistency Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-700">Consistency This Week</h3>
            {stats.weeklyTrend.length > 0 && (
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                +{Math.max(0, stats.weeklyTrend[6] - stats.weeklyTrend[0])}%
              </span>
            )}
          </div>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {stats.weeklyTrend.map((value, i) => (
              <div key={i} className={`w-full ${i === stats.weeklyTrend.length - 1 ? "bg-slate-100" : "bg-primary/20"} rounded-t-lg transition-all hover:bg-primary`} style={{ height: `${value}%` }}></div>
            ))}
          </div>
          <div className="flex justify-between px-1 text-[10px] font-bold text-slate-400 uppercase">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex flex-col gap-4 min-h-0 flex-1">
          <h3 className="font-bold text-slate-700 flex-shrink-0">Recent Activity</h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {recentActivity && recentActivity.activities && recentActivity.activities.length > 0 ? (
              recentActivity.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 items-center p-3 rounded-xl ${
                    activity.isAllCompleted
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-slate-50 border border-slate-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      activity.isAllCompleted
                        ? "bg-blue-100 text-blue-600"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {activity.emoji || "✓"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {recentActivity.userName} completed "{activity.task}"
                    </p>
                    <p className="text-xs text-slate-500">{activity.date}</p>
                  </div>
                </div>
              ))
            ) : recentActivity && recentActivity.allTasksCompletedToday ? (
              <div className="flex gap-4 items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-xl">done_all</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {recentActivity.userName} completed all daily tasks! 🎉
                  </p>
                  <p className="text-xs text-slate-500">
                    {recentActivity.completedToday}/{recentActivity.totalTasks} tasks complete
                  </p>
                </div>
              </div>
            ) : residents.length > 0 ? (
              <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">No new activity yet</p>
                  <p className="text-xs text-slate-500">Check back for updates</p>
                </div>
              </div>
            ) : null}
            {residents.length > 0 && stats.avgStreak > 0 && (
              <div className="flex gap-4 items-center p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-75">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">trending_up</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Avg streak: {stats.avgStreak} days</p>
                  <p className="text-xs text-slate-500">{residents.length} {residents.length === 1 ? "resident" : "residents"} tracked</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
