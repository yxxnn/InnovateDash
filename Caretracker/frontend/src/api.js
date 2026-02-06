const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const getCaregiverOverview = () =>
  fetch(`${BASE}/caregiver/overview`).then((r) => r.json());

export const getTodayTasks = (userId) =>
  fetch(`${BASE}/tasks/today?userId=${userId}`).then((r) => r.json());

export const toggleTaskDone = (taskId, userId) =>
  fetch(`${BASE}/tasks/${taskId}/done`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  }).then((r) => r.json());

export const getTasks = (userId) =>
  fetch(`${BASE}/tasks?userId=${userId}`).then((r) => r.json());

export const createTask = (payload) =>
  fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

export const deleteTask = (taskId) =>
  fetch(`${BASE}/tasks/${taskId}`, { method: "DELETE" }).then((r) => r.json());
