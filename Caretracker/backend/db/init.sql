-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at_iso TEXT NOT NULL
);

-- Caregivers
CREATE TABLE IF NOT EXISTS caregivers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at_iso TEXT NOT NULL
);

-- Task Groups
CREATE TABLE IF NOT EXISTS task_groups (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at_iso TEXT NOT NULL
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  time TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT TRUE,
  created_date_iso TEXT NOT NULL,
  group_id TEXT
);

-- Task logs (daily completion)
CREATE TABLE IF NOT EXISTS task_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  date_iso TEXT NOT NULL,
  done_at_iso TEXT NOT NULL
);

-- Notification preferences (THIS is what your app crashed on)
CREATE TABLE IF NOT EXISTS notification_prefs (
  user_id TEXT PRIMARY KEY,
  quiet_start TEXT DEFAULT '22:00',
  quiet_end   TEXT DEFAULT '07:00',
  followup_minutes INT DEFAULT 15
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at_iso TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);
