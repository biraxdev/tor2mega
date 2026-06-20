import { Router } from "express";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../database";
import { signToken, authMiddleware, AuthRequest } from "./middleware";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = await queryOne("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await queryOne<{ id: string }>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
    [email, hash]
  );

  await query("INSERT INTO settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [user!.id]);

  const token = signToken(user!.id);
  res.json({ token, user: { id: user!.id, email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = await queryOne<{ id: string; password_hash: string }>(
    "SELECT id, password_hash FROM users WHERE email = $1",
    [email]
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, email } });
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await queryOne<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = $1",
    [req.userId]
  );
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
