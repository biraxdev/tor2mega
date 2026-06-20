import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import { config } from "./config";
import { runMigrations } from "./database/migrate";
import { pool } from "./database";
import authRoutes from "./auth/routes";
import downloadsRoutes from "./api/downloads";
import destinationsRoutes from "./api/destinations";
import statsRoutes from "./api/stats";
import logsRoutes from "./api/logs";
import settingsRoutes from "./api/settings";
import teamRoutes from "./api/team";
import billingRoutes from "./api/billing";
import apiKeysRoutes from "./api/apiKeys";
import videosRoutes from "./api/videos";
import { rateLimitMiddleware } from "./auth/apiKeyMiddleware";
import { setSocketIO } from "./workers";
import { Worker } from "bullmq";
import { redisConnection, downloadQueue, uploadQueue, cleanupQueue } from "./queue";
import { processDownloadJob, processUploadJob, processCleanupJob } from "./workers";

async function main() {
  await runMigrations();

  const app = express();
  app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://tor2web.netlify.app",
      /\.onrender\.com$/,
    ],
    credentials: true,
  }));
  app.use(express.json());

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api/downloads", downloadsRoutes);
  app.use("/api/destinations", destinationsRoutes);
  app.use("/api/stats", statsRoutes);
  app.use("/api/logs", logsRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/team", teamRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/api-keys", apiKeysRoutes);
  app.use("/api/videos", videosRoutes);
  app.use("/api/public", rateLimitMiddleware(100, 60000), downloadsRoutes);

  const server = http.createServer(app);
  const io = new IOServer(server, { cors: { origin: "*" } });
  setSocketIO(io);

  const downloadWorker = new Worker("download_queue", processDownloadJob, {
    connection: redisConnection,
    concurrency: config.download.maxConcurrent,
  });
  const uploadWorker = new Worker("upload_queue", processUploadJob, {
    connection: redisConnection,
    concurrency: config.download.maxUploads,
  });
  const cleanupWorker = new Worker("cleanup_queue", processCleanupJob, {
    connection: redisConnection,
    concurrency: 1,
  });

  downloadWorker.on("failed", (job, err) => {
    console.error(`[download-worker] Job ${job?.id} failed:`, err.message);
  });
  uploadWorker.on("failed", (job, err) => {
    console.error(`[upload-worker] Job ${job?.id} failed:`, err.message);
  });

  server.listen(config.port, () => {
    console.log(`[tor2mega] Server running on port ${config.port}`);
    console.log(`[tor2mega] Workers: download(${config.download.maxConcurrent}), upload(${config.download.maxUploads}), cleanup(1)`);
  });

  process.on("SIGTERM", async () => {
    await downloadWorker.close();
    await uploadWorker.close();
    await cleanupWorker.close();
    await pool.end();
    await redisConnection.quit();
    server.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[tor2mega] Fatal error:", err);
  process.exit(1);
});
