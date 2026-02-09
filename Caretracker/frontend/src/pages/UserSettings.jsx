import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, updateUserPreferences } from "../api";

export default function UserSettings() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const storedEmail = localStorage.getItem("userEmail") || "";
  const storedName = localStorage.getItem("userName") || "User";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("account");

  // Account settings state
  const [editName, setEditName] = useState(storedName);
  const [editEmail, setEditEmail] = useState(storedEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Notification preferences
  const [notifyTaskComplete, setNotifyTaskComplete] = useState(true);
  const [notifyTaskReminder, setNotifyTaskReminder] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);

  // Privacy settings
  const [allowCaregiverEdit, setAllowCaregiverEdit] = useState(true);
  const [allowCaregiverSee, setAllowCaregiverSee] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate("/login/code");
      return;
    }
    (async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
        setEditEmail(data.email ?? storedEmail);
        setEditName(storedName);
        // Load preference states from profile
        if (data.allowCaregiverSee !== undefined) {
          setAllowCaregiverSee(data.allowCaregiverSee);
        }
        if (data.allowCaregiverEdit !== undefined) {
          setAllowCaregiverEdit(data.allowCaregiverEdit);
        }
      } catch (e) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, navigate, storedEmail, storedName]);

  async function handleSaveProfile() {
    if (!userId) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updated = await updateUserProfile(userId, {
        email: editEmail.trim() || storedEmail,
        name: editName.trim() || storedName,
      });
      setProfile(updated);
      localStorage.setItem("userEmail", updated.email);
      localStorage.setItem("userName", editName.trim());
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/");
  }

  async function handleCaregiverEditChange(newValue) {
    setAllowCaregiverEdit(newValue);
    try {
      await updateUserPreferences(userId, {
        allowCaregiverEdit: newValue,
      });
    } catch (e) {
      setError(e?.message || "Failed to save preference");
      setAllowCaregiverEdit(!newValue);
    }
  }

  async function handleCaregiverSeeChange(newValue) {
    setAllowCaregiverSee(newValue);
    try {
      await updateUserPreferences(userId, {
        allowCaregiverSee: newValue,
      });
    } catch (e) {
      setError(e?.message || "Failed to save preference");
      setAllowCaregiverSee(!newValue);
    }
  }

  async function handleNotificationChange(prefKey, newValue) {
    // Update local state first
    if (prefKey === "complete") setNotifyTaskComplete(newValue);
    if (prefKey === "reminder") setNotifyTaskReminder(newValue);
    if (prefKey === "streak") setNotifyStreak(newValue);

    try {
      await updateUserPreferences(userId, {
        [prefKey]: newValue,
      });
    } catch (e) {
      setError(e?.message || "Failed to save notification preference");
      // Revert on error
      if (prefKey === "complete") setNotifyTaskComplete(!newValue);
      if (prefKey === "reminder") setNotifyTaskReminder(!newValue);
      if (prefKey === "streak") setNotifyStreak(!newValue);
    }
  }

  if (!userId || loading) {
    return (
      <div className="min-h-screen bg-background-light px-4 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full mb-3"></div>
          <p className="text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/pwid")}
          className="mb-8 flex items-center gap-2 text-slate-600 font-semibold hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to My Day
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-lg">Manage your account, notifications, and preferences</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 bg-white rounded-2xl p-4 border border-slate-100 overflow-x-auto">
          {[
            { id: "account", icon: "person", label: "Account" },
            { id: "notifications", icon: "notifications", label: "Notifications" },
            { id: "privacy", icon: "privacy_tip", label: "Privacy & Display" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account Settings Tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {(editName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editName || "User"}</h2>
                  <p className="text-slate-500">{editEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">badge</span>
                      Display Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-primary">mail</span>
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    Save Profile
                  </>
                )}
              </button>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-primary">lock</span>
                <h3 className="text-2xl font-bold text-slate-900">Change Password</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-slate-500 mt-1">At least 8 characters, include numbers and symbols</p>
                </div>
                <button className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-2xl text-primary">notifications_active</span>
                <h3 className="text-2xl font-bold text-slate-900">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "complete",
                    prefKey: "notifyComplete",
                    title: "Task Completed",
                    description: "Get notified when you mark a task as complete",
                    value: notifyTaskComplete,
                    icon: "check_circle",
                  },
                  {
                    id: "reminder",
                    prefKey: "notifyReminder",
                    title: "Task Reminders",
                    description: "Receive gentle reminders for upcoming tasks",
                    value: notifyTaskReminder,
                    icon: "schedule",
                  },
                  {
                    id: "streak",
                    prefKey: "notifyStreak",
                    title: "Streak Milestones",
                    description: "Celebrate your achievements and streak milestones",
                    value: notifyStreak,
                    icon: "local_fire_department",
                  },
                ].map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-2xl text-primary">{notification.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{notification.title}</p>
                        <p className="text-sm text-slate-500">{notification.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notification.value}
                        onChange={(e) => handleNotificationChange(notification.prefKey, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 flex gap-4">
              <span className="material-symbols-outlined text-blue-600 text-3xl flex-shrink-0">info</span>
              <div>
                <p className="font-bold text-blue-900 mb-1">Notification Channels</p>
                <p className="text-sm text-blue-700">You'll receive notifications via push notifications and in-app alerts</p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy & Display Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-2xl text-primary">privacy_tip</span>
                <h3 className="text-2xl font-bold text-slate-900">Privacy & Display</h3>
              </div>

              {/* Privacy Info Box */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8 flex gap-4">
                <span className="material-symbols-outlined text-green-600 text-3xl flex-shrink-0">shield_locked</span>
                <div>
                  <p className="font-bold text-green-900 mb-1">Your data is protected</p>
                  <p className="text-sm text-green-700">Only authorized caregivers can view your task completion data. All communications are encrypted.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: "share",
                    title: "Allow Caregiver to Edit Tasks",
                    description: "Permit caregivers to edit and manage your tasks",
                    value: allowCaregiverEdit,
                    onChangeHandler: handleCaregiverEditChange,
                    icon: "edit",
                  },
                  {
                    id: "darkmode",
                    title: "Allow Caregiver to See Tasks",
                    description: "Permit caregivers to view your tasks and progress",
                    value: allowCaregiverSee,
                    onChangeHandler: handleCaregiverSeeChange,
                    icon: "visibility",
                  },
                ].map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-2xl text-primary">{setting.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900">{setting.title}</p>
                        <p className="text-sm text-slate-500">{setting.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.value}
                        onChange={(e) => setting.onChangeHandler(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-2xl text-slate-600">logout</span>
                <h3 className="text-2xl font-bold text-slate-900">Account Actions</h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
                <p className="text-xs text-slate-500 text-center">You'll be logged out and returned to the home page</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
