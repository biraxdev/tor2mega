import { Router } from "express";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";
import { addDownloadJob } from "../queue";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const status = (req.query.status as string) || undefined;
  const params: unknown[] = [req.userId];
  let sql = "SELECT * FROM downloads WHERE user_id = $1";
  if (status) {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  sql += " ORDER BY created_at DESC LIMIT 200";
  const result = await query(sql, params);
  res.json({ downloads: result.rows });
});

router.post("/", async (req: AuthRequest, res) => {
  const { url, destinationId } = req.body as { url: string; destinationId?: string };
  if (!url) return res.status(400).json({ error: "URL required" });

  let destId = destinationId;
  if (!destId) {
    const dest = await queryOne<{ id: string }>(
      "SELECT id FROM destinations WHERE user_id = $1 AND enabled = true ORDER BY created_at LIMIT 1",
      [req.userId]
    );
    if (!dest) return res.status(400).json({ error: "No enabled destination found" });
    destId = dest.id;
  }

  const dl = await queryOne<{
    id: string;
    source_url: string;
    title: string | null;
    status: string;
    progress: number;
    created_at: string;
  }>(
    `INSERT INTO downloads (user_id, destination_id, source_url, status)
     VALUES ($1, $2, $3, 'queued')
     RETURNING id, source_url, title, status, progress, created_at`,
    [req.userId, destId, url]
  );

  await addDownloadJob(dl!.id, url, destId);
  res.json({ download: dl });
});

router.get("/:id", async (req: AuthRequest, res) => {
  const dl = await queryOne("SELECT * FROM downloads WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  if (!dl) return res.status(404).json({ error: "Download not found" });
  res.json({ download: dl });
});

router.post("/:id/cancel", async (req: AuthRequest, res) => {
  const dl = await queryOne<{ id: string; status: string }>(
    "UPDATE downloads SET status = 'cancelled' WHERE id = $1 AND user_id = $2 AND status IN ('queued','downloading','uploading') RETURNING id, status",
    [req.params.id, req.userId]
  );
  if (!dl) return res.status(404).json({ error: "Download not found or not cancellable" });
  res.json({ download: dl });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  await query("DELETE FROM downloads WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  res.json({ success: true });
});

export default router;
