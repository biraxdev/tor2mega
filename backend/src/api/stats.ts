import { Router } from "express";
import { query } from "../database";
import { authMiddleware, AuthRequest } from "../auth/middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req: AuthRequest, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRs, completedRs, completedTodayRs, storageRs, activeRs, failedRs] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1", [req.userId]),
    query("SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1 AND status = 'completed'", [req.userId]),
    query(
      "SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1 AND status = 'completed' AND completed_at >= $2",
      [req.userId, today]
    ),
    query(
      "SELECT COALESCE(SUM(size), 0)::bigint AS total FROM downloads WHERE user_id = $1 AND status = 'completed'",
      [req.userId]
    ),
    query(
      `SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1 AND status IN ('queued','downloading','uploading')`,
      [req.userId]
    ),
    query("SELECT COUNT(*)::int AS count FROM downloads WHERE user_id = $1 AND status = 'failed'", [req.userId]),
  ]);

  const totalDownloads = totalRs.rows[0].count;
  const totalCompleted = completedRs.rows[0].count;
  const totalFailed = failedRs.rows[0].count;
  const finished = totalCompleted + totalFailed;
  const successRate = finished > 0 ? Math.round((totalCompleted / finished) * 100) : 100;

  res.json({
    stats: {
      totalDownloads,
      totalUploads: totalCompleted,
      filesToday: completedTodayRs.rows[0].count,
      successRate,
      activeQueue: activeRs.rows[0].count,
      storageSent: parseInt(storageRs.rows[0].total, 10),
    },
  });
});

export default router;
