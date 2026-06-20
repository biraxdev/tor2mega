import { Router } from "express";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";
import { config } from "../config";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const result = await query(
    "SELECT id, name, mega_url, enabled, created_at FROM destinations WHERE user_id = $1 ORDER BY created_at DESC",
    [req.userId]
  );
  res.json({ destinations: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, megaUrl } = req.body as { name: string; megaUrl: string };
  if (!name || !megaUrl) return res.status(400).json({ error: "Name and megaUrl required" });

  const dest = await queryOne(
    `INSERT INTO destinations (user_id, name, mega_url, enabled)
     VALUES ($1, $2, $3, true)
     RETURNING id, name, mega_url, enabled, created_at`,
    [req.userId, name, megaUrl]
  );
  res.json({ destination: dest });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const { name, megaUrl, enabled } = req.body as {
    name?: string;
    megaUrl?: string;
    enabled?: boolean;
  };
  const dest = await queryOne(
    `UPDATE destinations
     SET name = COALESCE($3, name), mega_url = COALESCE($4, mega_url), enabled = COALESCE($5, enabled)
     WHERE id = $1 AND user_id = $2
     RETURNING id, name, mega_url, enabled, created_at`,
    [req.params.id, req.userId, name, megaUrl, enabled]
  );
  if (!dest) return res.status(404).json({ error: "Destination not found" });
  res.json({ destination: dest });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await query("DELETE FROM destinations WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  res.json({ success: true });
});

export default router;
