import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "companioncare",
  password: process.env.DB_PASSWORD || "companioncarepw",
  database: process.env.DB_NAME || "companioncare",
});
