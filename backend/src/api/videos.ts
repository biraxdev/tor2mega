import { Router } from "express";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();
router.use(authMiddleware);

function stripMegaUrl(row: Record<string, unknown>): Record<string, unknown> {
  const { mega_url, ...rest } = row;
  return rest;
}

router.get("/", async (req: AuthRequest, res) => {
  const search = (req.query.search as string) || undefined;
  const status = (req.query.status as string) || undefined;
  const sortBy = (req.query.sortBy as string) || "created_at";
  const sortOrder = (req.query.sortOrder as string) || "desc";

  const params: unknown[] = [req.userId];
  let sql = "SELECT * FROM videos WHERE user_id = $1";
  let paramIdx = 2;

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (title ILIKE $${paramIdx} OR source_url ILIKE $${paramIdx})`;
    paramIdx++;
  }
  if (status) {
    params.push(status);
    sql += ` AND status = $${paramIdx}`;
    paramIdx++;
  }

  const validSorts = ["created_at", "title", "size", "duration"];
  const sort = validSorts.includes(sortBy) ? sortBy : "created_at";
  const order = sortOrder === "asc" ? "ASC" : "DESC";
  sql += ` ORDER BY ${sort} ${order} LIMIT 200`;

  const result = await query(sql, params);
  res.json({ videos: result.rows.map(stripMegaUrl) });
});

router.get("/:id", async (req: AuthRequest, res) => {
  const video = await queryOne("SELECT * FROM videos WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.userId,
  ]);
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json({ video: stripMegaUrl(video) });
});

router.put("/:id/rename", async (req: AuthRequest, res) => {
  const { title } = req.body as { title: string };
  if (!title?.trim()) return res.status(400).json({ error: "Title required" });

  const video = await queryOne(
    "UPDATE videos SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [title.trim(), req.params.id, req.userId]
  );
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json({ video: stripMegaUrl(video) });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const video = await queryOne<{ id: string }>(
    "DELETE FROM videos WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json({ success: true });
});

router.get("/:id/stream", async (req: AuthRequest, res) => {
  const video = await queryOne<{ mega_url: string | null; title: string; status: string }>(
    "SELECT mega_url, title, status FROM videos WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  if (!video) return res.status(404).json({ error: "Video not found" });
  if (video.status !== "ready") return res.status(409).json({ error: "Video not ready" });
  if (!video.mega_url) return res.status(404).json({ error: "No stream URL available" });

  res.json({ streamUrl: `/api/videos/${req.params.id}/proxy` });
});

router.get("/:id/proxy", async (req: AuthRequest, res) => {
  const video = await queryOne<{ mega_url: string | null; status: string }>(
    "SELECT mega_url, status FROM videos WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  if (!video) return res.status(404).json({ error: "Video not found" });
  if (video.status !== "ready" || !video.mega_url) {
    return res.status(404).json({ error: "Video not available" });
  }

  try {
    const response = await fetch(video.mega_url);
    if (!response.ok) return res.status(502).json({ error: "Storage error" });

    const contentType = response.headers.get("content-type") || "video/mp4";
    const contentLength = response.headers.get("content-length");

    res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);
    res.setHeader("Accept-Ranges", "bytes");

    if (response.body) {
      const reader = response.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      };
      pump();
    } else {
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch {
    res.status(502).json({ error: "Failed to fetch video" });
  }
});

router.post("/:id/download", async (req: AuthRequest, res) => {
  const video = await queryOne<{ mega_url: string | null; title: string; status: string }>(
    "SELECT mega_url, title, status FROM videos WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  if (!video) return res.status(404).json({ error: "Video not found" });
  if (video.status !== "ready" || !video.mega_url) {
    return res.status(404).json({ error: "Video not available" });
  }
  res.json({ downloadUrl: video.mega_url, filename: `${video.title}.mp4` });
});

export default router;
