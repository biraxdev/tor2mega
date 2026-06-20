import { Router } from "express";
import crypto from "crypto";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();
router.use(authMiddleware);

function generateApiKey(): string {
  const prefix = "t2m_";
  const bytes = crypto.randomBytes(32);
  return prefix + bytes.toString("hex");
}

router.get("/", async (req: AuthRequest, res) => {
  const keys = await query(
    "SELECT id, name, key_prefix, created_at, last_used FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC",
    [req.userId]
  );
  res.json({ keys: keys.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { name } = req.body as { name: string };
  if (!name) return res.status(400).json({ error: "Name required" });

  const rawKey = generateApiKey();
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 10) + "...";

  await queryOne(
    "INSERT INTO api_keys (user_id, name, key_hash, key_prefix) VALUES ($1, $2, $3, $4) RETURNING id",
    [req.userId, name, keyHash, keyPrefix]
  );

  res.json({ key: rawKey, keyPrefix });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await query("DELETE FROM api_keys WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
  res.json({ ok: true });
});

export default router;
