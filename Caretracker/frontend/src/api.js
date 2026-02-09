// frontend/src/api.js

const BASE =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export { BASE };

// Safely parse JSON or show real backend error
async function jsonOrThrow(res) {
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    // Backend returned HTML or plain text
    throw new Error(`Not JSON (${res.status}): ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }

  return data;
}

/* ================= CAREGIVER ================= */

export const getCaregiverOverview = () =>
  fetch(`${BASE}/caregiver/overview`).then(jsonOrThrow);

/* ================= USER FACE LOGIN (no password) ================= */
export const userFaceLogin = (email) =>
  fetch(`${BASE}/user/face-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  }).then(jsonOrThrow);

export const getCaregiverProfile = (caregiverId) =>
  fetch(`${BASE}/caregiver/profile?caregiverId=${encodeURIComponent(caregiverId)}`).then(jsonOrThrow);

export const updateCaregiverProfile = (caregiverId, payload) =>
  fetch(`${BASE}/caregiver/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ caregiverId, ...payload }),
  }).then(jsonOrThrow);

/* ================= USER TASKS ================= */

export const getUserProfile = (userId) =>
  fetch(`${BASE}/user/profile?userId=${encodeURIComponent(userId)}`).then(jsonOrThrow);

export const updateUserProfile = (userId, payload) =>
  fetch(`${BASE}/user/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ...payload }),
  }).then(jsonOrThrow);

export const getTodayTasks = (userId) =>
  fetch(`${BASE}/tasks/today?userId=${encodeURIComponent(userId)}`)
    .then(jsonOrThrow);

export const toggleTaskDone = (taskId, userId) =>
  fetch(`${BASE}/tasks/${taskId}/done`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).then(jsonOrThrow);

export const getTasks = (userId) =>
  fetch(`${BASE}/tasks?userId=${encodeURIComponent(userId)}`)
    .then(jsonOrThrow);

export const createTask = (payload) =>
  fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(jsonOrThrow);

export const deleteTask = (taskId) =>
  fetch(`${BASE}/tasks/${taskId}`, {
    method: "DELETE",
  }).then(jsonOrThrow);

export const updateTask = (taskId, payload) =>
  fetch(`${BASE}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(jsonOrThrow);

/* ================= STREAKS ================= */

export const getStreaks = (userId) =>
  fetch(`${BASE}/streaks?userId=${encodeURIComponent(userId)}`)
    .then(jsonOrThrow);

/* ================= NOTIFICATIONS ================= */

export const getNotifications = (userId) =>
  fetch(`${BASE}/notifications?userId=${encodeURIComponent(userId)}`)
    .then(jsonOrThrow);

export const markNotificationRead = (id) =>
  fetch(`${BASE}/notifications/${id}/read`, {
    method: "POST",
  }).then(jsonOrThrow);

export const getNotificationPrefs = (userId) =>
  fetch(`${BASE}/prefs/notifications?userId=${encodeURIComponent(userId)}`)
    .then(jsonOrThrow);

export const updateNotificationPrefs = (payload) =>
  fetch(`${BASE}/prefs/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(jsonOrThrow);
