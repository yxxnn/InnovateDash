const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function getTodayTasks(userId) {
  const res = await fetch(`${BASE}/tasks/today?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to load tasks");
  return res.json();
}

export async function toggleTaskDone(taskId, userId) {
  const res = await fetch(`${BASE}/tasks/${taskId}/done`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

export async function getCaregiverOverview() {
  const res = await fetch(`${BASE}/caregiver/overview`);
  if (!res.ok) throw new Error("Failed to load overview");
  return res.json();
}
