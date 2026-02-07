import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api";

function displayNameFromEmail(email) {
  if (!email) return "User";
  const local = email.split("@")[0];
  return local || "User";
}

export default function UserProfile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const storedEmail = localStorage.getItem("userEmail") || "";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/login/code");
      return;
    }
    (async () => {
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
        setEditEmail(data.email ?? "");
      } catch (e) {
        setError(e?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, navigate]);

  const displayEmail = (profile?.email ?? storedEmail) || "";
  const displayName = displayNameFromEmail(displayEmail);

  async function handleSave() {
    if (!userId) return;
    setError("");
    setSaving(true);
    try {
      const updated = await updateUserProfile(userId, {
        email: editEmail.trim() || displayEmail,
      });
      setProfile(updated);
      localStorage.setItem("userEmail", updated.email);
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    navigate("/");
  }

  if (!userId) return null;

  return (
    <div className="min-h-screen bg-[#f0f9f0] px-4 py-8 pb-16">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/pwid")}
          className="mb-6 flex items-center gap-2 text-[#0e1b0e] font-semibold hover:underline"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          Back to My Day
        </button>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
            Loading profile…
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-black/5">
            {/* Cover / header strip */}
            <div className="h-28 bg-gradient-to-br from-[#19e619]/20 to-[#0e1b0e]/10" />

            <div className="relative px-6 pb-8">
              {/* Avatar */}
              <div className="-mt-14 mb-4 flex justify-center">
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-[#e7f3e7] text-4xl font-bold text-[#19e619] shadow-lg"
                  aria-hidden
                >
                  {(displayName || "U")[0].toUpperCase()}
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-bold text-zinc-900">{displayName}</h1>
                <p className="mt-1 text-zinc-500">{displayEmail}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e7f3e7] px-3 py-1 text-sm font-semibold text-[#0e1b0e]">
                  <span className="material-symbols-outlined text-lg">person</span>
                  Companion User
                </div>
                {profile?.createdAt && (
                  <p className="mt-3 text-xs text-zinc-400">
                    Member since{" "}
                    {new Date(profile.createdAt).toLocaleDateString("en-SG", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Edit section */}
              <div className="mt-8 border-t border-zinc-100 pt-6">
                {editing ? (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-zinc-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none"
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 rounded-lg bg-[#19e619] py-3 font-bold text-zinc-900 shadow-md hover:bg-[#15c213] disabled:opacity-60"
                      >
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setError("");
                        }}
                        className="rounded-lg border border-zinc-300 bg-white px-4 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#19e619]/30 bg-[#e7f3e7] py-3 font-bold text-[#0e1b0e] hover:bg-[#19e619]/15"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit profile
                  </button>
                )}
              </div>

              {/* Logout */}
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
