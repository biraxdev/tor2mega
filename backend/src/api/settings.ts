import { Router } from "express";
import { query, queryOne } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const settings = await queryOne(
    `SELECT max_concurrent_downloads, max_uploads, max_file_size_mb, retry_count, auto_delete_logs_days, cleanup_delay_hours
     FROM settings WHERE user_id = $1`,
    [req.userId]
  );
  if (!settings) {
    await query("INSERT INTO settings (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [req.userId]);
    return res.json({
      settings: {
        max_concurrent_downloads: 3,
        max_uploads: 2,
        max_file_size_mb: 0,
        retry_count: 3,
        auto_delete_logs_days: 7,
        cleanup_delay_hours: 24,
      },
    });
  }
  res.json({ settings });
});

router.put("/", async (req: AuthRequest, res) => {
  const {
    max_concurrent_downloads,
    max_uploads,
    max_file_size_mb,
    retry_count,
    auto_delete_logs_days,
    cleanup_delay_hours,
  } = req.body as Record<string, number>;

  const settings = await queryOne(
    `INSERT INTO settings (user_id, max_concurrent_downloads, max_uploads, max_file_size_mb, retry_count, auto_delete_logs_days, cleanup_delay_hours)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id) DO UPDATE SET
       max_concurrent_downloads = EXCLUDED.max_concurrent_downloads,
       max_uploads = EXCLUDED.max_uploads,
       max_file_size_mb = EXCLUDED.max_file_size_mb,
       retry_count = EXCLUDED.retry_count,
       auto_delete_logs_days = EXCLUDED.auto_delete_logs_days,
       cleanup_delay_hours = EXCLUDED.cleanup_delay_hours
     RETURNING *`,
    [
      req.userId,
      max_concurrent_downloads ?? 3,
      max_uploads ?? 2,
      max_file_size_mb ?? 0,
      retry_count ?? 3,
      auto_delete_logs_days ?? 7,
      cleanup_delay_hours ?? 24,
    ]
  );
  res.json({ settings });
});

export default router;
