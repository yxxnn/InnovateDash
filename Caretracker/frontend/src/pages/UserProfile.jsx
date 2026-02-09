import { useEffect, useState, useRef } from "react";
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  const [faceVerifyOpen, setFaceVerifyOpen] = useState(false);
  const [faceVerifySuccess, setFaceVerifySuccess] = useState(false);
  const [faceVerifyLoading, setFaceVerifyLoading] = useState(false);
  const [faceStream, setFaceStream] = useState(null);

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
        const storedName = localStorage.getItem("userName") || "";
        setEditName(storedName);
      } catch (e) {
        setError(e?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, navigate]);

  useEffect(() => {
    if (faceStream && videoRef.current) {
      videoRef.current.srcObject = faceStream;
    }
  }, [faceStream, faceVerifyOpen]);

  useEffect(() => {
    return () => {
      if (faceStream) {
        faceStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [faceStream]);

  async function startFaceVerify() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      setFaceStream(stream);
      setFaceVerifyOpen(true);
    } catch (e) {
      setError("Could not access camera. Please allow camera permission.");
    }
  }

  function cancelFaceVerify() {
    if (faceStream) {
      faceStream.getTracks().forEach((t) => t.stop());
      setFaceStream(null);
    }
    setFaceVerifyOpen(false);
    setFaceVerifyLoading(false);
  }

  function confirmFaceVerify() {
    setFaceVerifyLoading(true);
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
    }
    setTimeout(() => {
      setFaceVerifySuccess(true);
      setFaceVerifyLoading(false);
      cancelFaceVerify();
    }, 1200);
  }

  const displayEmail = (profile?.email ?? storedEmail) || "";
  const storedName = localStorage.getItem("userName") || "";
  const displayName = storedName || displayNameFromEmail(displayEmail);

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
      localStorage.setItem("userName", editName.trim());
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

              {/* Caregiver Code Section */}
              {profile?.residentCode && (
                <div className="mt-8 rounded-lg border-2 border-[#19e619] bg-[#e7f3e7] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#19e619]">qr_code</span>
                    <p className="text-sm font-semibold text-zinc-700">Share with caregiver</p>
                  </div>
                  <p className="text-xs text-zinc-600 mb-3">
                    Caregivers can use this code to add you to their residents list.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-white px-3 py-2 text-center font-mono font-bold text-lg text-zinc-900 border border-zinc-200">
                      {profile.residentCode}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.residentCode);
                      }}
                      className="rounded-lg bg-white border border-zinc-200 px-4 py-2 text-zinc-700 font-semibold hover:bg-zinc-50 flex items-center gap-1 text-sm"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                  </div>
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
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-[#19e619] focus:ring-2 focus:ring-[#19e619]/20 outline-none"
                      />
                    </div>
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

              {/* Face verification (form only) */}
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <p className="text-sm font-semibold text-zinc-700 mb-3">Face verification</p>
                {faceVerifySuccess ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 py-3 text-green-800">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                    <span className="font-semibold">Face verified</span>
                  </div>
                ) : faceVerifyOpen ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-video max-h-48">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-28 h-28 border-4 border-[#19e619] rounded-full opacity-60" />
                      </div>
                    </div>
                    <canvas ref={canvasRef} width={640} height={480} className="hidden" />
                    <p className="text-xs text-zinc-500">Position your face in the circle, then click Verify.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={confirmFaceVerify}
                        disabled={faceVerifyLoading}
                        className="flex-1 rounded-lg bg-[#19e619] py-2.5 font-bold text-zinc-900 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {faceVerifyLoading ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                            Verifying…
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">face</span>
                            Verify
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={cancelFaceVerify}
                        disabled={faceVerifyLoading}
                        className="rounded-lg border border-zinc-300 bg-white py-2.5 px-4 font-semibold text-zinc-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={startFaceVerify}
                    className="w-full rounded-lg border-2 border-[#19e619]/30 bg-[#e7f3e7] py-3 font-bold text-[#0e1b0e] hover:bg-[#19e619]/15 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">face</span>
                    Start face verification
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
