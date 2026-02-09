import { Router } from "express";
import { pool } from "../db.js";
import { generateResidentCode } from "../utils/helpers.js";

const router = Router();

/* ------------ USER SIGNUP ------------ */
router.post("/user/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existing = await pool.query(`SELECT id FROM users WHERE email=$1`, [
      email,
    ]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userId = "u_" + Math.random().toString(16).slice(2);
    const userName = name || email.split("@")[0];
    const residentCode = generateResidentCode();

    await pool.query(
      `INSERT INTO users (id,email,password,name,role,created_at_iso,resident_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, email, password, userName, "User", new Date().toISOString(), residentCode]
    );

    res.status(201).json({
      userId,
      email,
      name: userName,
      residentCode,
      message: "User account created successfully",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ USER LOGIN ------------ */
router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const query = await pool.query(
      `SELECT id FROM users WHERE email=$1 AND password=$2 AND role='User'`,
      [email, password]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userId = query.rows[0].id;
    const token = "user_" + Math.random().toString(16).slice(2);

    res.json({ token, userId, email, message: "Login successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ USER FACE LOGIN (no password) ------------ */
router.post("/user/face-login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ message: "Email required" });
    }
    const trimmedEmail = email.trim();
    const query = await pool.query(
      `SELECT id FROM users WHERE email=$1 AND role='User'`,
      [trimmedEmail]
    );
    if (query.rows.length === 0) {
      return res.status(401).json({ message: "No account with this email. Use user1@123 or user2@123." });
    }
    const userId = query.rows[0].id;
    const token = "user_" + Math.random().toString(16).slice(2);
    res.json({ token, userId, email: trimmedEmail, message: "Login successful" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ CAREGIVER LOGIN ------------ */
router.post("/caregiver/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const query = await pool.query(
      `SELECT id, name FROM caregivers WHERE email=$1 AND password=$2`,
      [email, password]
    );

    if (query.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const caregiver = query.rows[0];
    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.json({
      token,
      caregiverId: caregiver.id,
      name: caregiver.name,
      email,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ------------ CAREGIVER SIGNUP ------------ */
router.post("/caregiver/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password required" });
    }

    const existing = await pool.query(
      `SELECT id FROM caregivers WHERE email=$1`,
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const caregiverId = "cg_" + Math.random().toString(16).slice(2);
    await pool.query(
      `INSERT INTO caregivers (id,name,email,password,created_at_iso)
       VALUES ($1,$2,$3,$4,$5)`,
      [caregiverId, name, email, password, new Date().toISOString()]
    );

    const token = "caregiver_" + Math.random().toString(16).slice(2);

    res.status(201).json({
      token,
      caregiverId,
      name,
      email,
      message: "Caregiver account created successfully",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
