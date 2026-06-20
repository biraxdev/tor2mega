import { Router } from "express";
import { query } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const downloadId = req.query.downloadId as string | undefined;
  const level = req.query.level as string | undefined;
  const params: unknown[] = [];
  let sql = `
    SELECT l.id, l.download_id, l.message, l.level, l.created_at,
           d.title AS download_title
    FROM logs l
    LEFT JOIN downloads d ON d.id = l.download_id
    WHERE d.user_id = $1
  `;
  params.push(req.userId);

  if (downloadId) {
    params.push(downloadId);
    sql += ` AND l.download_id = $${params.length}`;
  }
  if (level) {
    params.push(level);
    sql += ` AND l.level = $${params.length}`;
  }
  sql += " ORDER BY l.created_at DESC LIMIT 500";

  const result = await query(sql, params);
  res.json({ logs: result.rows });
});

export default router;
