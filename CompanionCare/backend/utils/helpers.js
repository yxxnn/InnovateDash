/* ---------------- TIME HELPERS ---------------- */
export function todayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function nowHHMM() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hh}:${mm}`;
}

export function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function inQuietHours(now, start, end) {
  const n = hhmmToMinutes(now);
  const s = hhmmToMinutes(start);
  const e = hhmmToMinutes(end);
  if (s <= e) return n >= s && n < e;
  return n >= s || n < e;
}

// If your task time is like "07:00" then return it directly.
// If it's like "9:00 AM", convert it.
export function taskTimeToHHMM(timeStr) {
  const t = timeStr.trim();

  // already 24h format "07:00"
  if (/^\d{2}:\d{2}$/.test(t)) return t;

  // convert "9:00 AM"
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;

  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === "AM" && hh === 12) hh = 0;
  if (ap === "PM" && hh !== 12) hh += 12;
  return `${pad2(hh)}:${pad2(mm)}`;
}

/* ---------------- ID & NOTIFICATION HELPERS ---------------- */
import { pool } from "../db.js";

export async function insertNotification({ userId, taskId = null, type, message }) {
  await pool.query(
    `INSERT INTO notifications (id, user_id, task_id, type, message, created_at_iso)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      "n_" + Math.random().toString(16).slice(2),
      userId,
      taskId,
      type,
      message,
      new Date().toISOString(),
    ]
  );
}

export function generateResidentCode() {
  return (
    Math.random().toString(36).substring(2, 8).toUpperCase() +
    Math.random().toString(36).substring(2, 4).toUpperCase()
  );
}

export async function canCaregiverSeeUser(caregiverId, userId) {
  if (!caregiverId) return true;

  try {
    const assigned = await pool.query(
      `SELECT COUNT(*) FROM caregiver_residents WHERE caregiver_id=$1 AND user_id=$2`,
      [caregiverId, userId]
    );

    if (assigned.rows[0].count === 0) return false;

    const user = await pool.query(
      `SELECT allow_caregiver_see FROM users WHERE id=$1`,
      [userId]
    );

    if (user.rows.length === 0) return false;

    return user.rows[0].allow_caregiver_see;
  } catch (e) {
    console.error("Error checking caregiver permission:", e);
    return false;
  }
}
