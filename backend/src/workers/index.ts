import { query, queryOne } from "../database";
import { downloadVideo } from "../downloader";
import { uploadToMega } from "../uploader/mega";
import { addUploadJob, addCleanupJob } from "../queue";
import { config } from "../config";
import { mkdirSync } from "fs";
import { join } from "path";
import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function setSocketIO(socketIo: IOServer) {
  io = socketIo;
}

function emitProgress(downloadId: string, data: Record<string, unknown>) {
  io?.emit(`download:${downloadId}`, data);
}

async function log(downloadId: string, message: string, level: string) {
  await query(
    "INSERT INTO logs (download_id, message, level) VALUES ($1, $2, $3)",
    [downloadId, message, level]
  );
}

export async function processDownloadJob(job: {
  data: { downloadId: string; url: string; destinationId: string };
}) {
  const { downloadId, url, destinationId } = job.data;

  const download = await queryOne<{ status: string }>(
    "SELECT status FROM downloads WHERE id = $1",
    [downloadId]
  );
  if (!download || download.status === "cancelled") {
    return;
  }

  const outputDir = join(config.download.tmpDir, downloadId);
  mkdirSync(outputDir, { recursive: true });

  await query("UPDATE downloads SET status = 'downloading' WHERE id = $1", [downloadId]);
  await log(downloadId, `Starting download: ${url}`, "info");
  emitProgress(downloadId, { status: "downloading", progress: 0 });

  try {
    const result = await downloadVideo(url, outputDir, (progress) => {
      const pct = Math.round(progress.percent);
      query("UPDATE downloads SET progress = $1 WHERE id = $2", [pct, downloadId]);
      emitProgress(downloadId, { status: "downloading", progress: pct, speed: progress.speed, eta: progress.eta });
    });

    await query(
      "UPDATE downloads SET title = $1, filename = $2, size = $3, progress = 100 WHERE id = $4",
      [result.title, result.filename, result.size, downloadId]
    );
    await log(downloadId, `Download completed: ${result.filename} (${result.size} bytes)`, "success");

    const video = await queryOne<{ id: string }>(
      `INSERT INTO videos (user_id, download_id, title, thumbnail, duration, size, source_url, status)
       SELECT user_id, id, COALESCE(title, 'Untitled'), NULL, $1, $2, source_url, 'processing'
       FROM downloads WHERE id = $3
       RETURNING id`,
      [result.duration || 0, result.size, downloadId]
    );
    if (video) {
      await query("UPDATE downloads SET video_id = $1 WHERE id = $2", [video.id, downloadId]);
    }

    await addUploadJob(downloadId, result.filePath, result.filename, destinationId);
  } catch (err) {
    const errorMsg = (err as Error).message;
    await log(downloadId, `Download failed: ${errorMsg}`, "error");
    await query("UPDATE downloads SET status = 'failed' WHERE id = $1", [downloadId]);
    emitProgress(downloadId, { status: "failed", error: errorMsg });
    throw err;
  }
}

export async function processUploadJob(job: {
  data: { downloadId: string; filePath: string; filename: string; destinationId: string };
}) {
  const { downloadId, filePath, filename, destinationId } = job.data;

  const download = await queryOne<{ status: string }>(
    "SELECT status FROM downloads WHERE id = $1",
    [downloadId]
  );
  if (!download || download.status === "cancelled") {
    return;
  }

  const dest = await queryOne<{ mega_url: string; name: string }>(
    "SELECT mega_url, name FROM destinations WHERE id = $1",
    [destinationId]
  );
  if (!dest) throw new Error("Destination not found");

  await query("UPDATE downloads SET status = 'uploading', progress = 0 WHERE id = $1", [downloadId]);
  await log(downloadId, `Starting upload to Mega destination: ${dest.name}`, "info");
  emitProgress(downloadId, { status: "uploading", progress: 0 });

  try {
    await uploadToMega(filePath, filename, dest.mega_url, downloadId, (progress) => {
      const pct = Math.round(progress.percent);
      query("UPDATE downloads SET progress = $1 WHERE id = $2", [pct, downloadId]);
      emitProgress(downloadId, { status: "uploading", progress: pct });
    });

    await query(
      "UPDATE downloads SET status = 'completed', progress = 100, completed_at = now() WHERE id = $1",
      [downloadId]
    );
    await query("UPDATE videos SET status = 'ready' WHERE download_id = $1", [downloadId]);
    await log(downloadId, "Upload completed successfully", "success");
    emitProgress(downloadId, { status: "completed", progress: 100 });

    await addCleanupJob(filePath);
  } catch (err) {
    const errorMsg = (err as Error).message;
    await log(downloadId, `Upload failed: ${errorMsg}`, "error");
    await query("UPDATE downloads SET status = 'failed' WHERE id = $1", [downloadId]);
    await query("UPDATE videos SET status = 'failed' WHERE download_id = $1", [downloadId]);
    emitProgress(downloadId, { status: "failed", error: errorMsg });
    throw err;
  }
}

export async function processCleanupJob(job: {
  data: { filePath: string };
}) {
  const { filePath } = job.data;
  const fs = await import("fs");
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      const dir = require("path").dirname(filePath);
      if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
      }
    }
  } catch {
    // Non-critical
  }
}
