import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config";

export const redisConnection: any = config.redis.url
  ? new IORedis(config.redis.url, { maxRetriesPerRequest: null })
  : new IORedis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
    });

export const downloadQueue = new Queue("download_queue", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: config.download.retryCount,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const uploadQueue = new Queue("upload_queue", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: config.download.retryCount,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const cleanupQueue = new Queue("cleanup_queue", {
  connection: redisConnection as any,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export async function addDownloadJob(
  downloadId: string,
  url: string,
  destinationId: string
) {
  await downloadQueue.add("download", { downloadId, url, destinationId });
}

export async function addUploadJob(
  downloadId: string,
  filePath: string,
  filename: string,
  destinationId: string
) {
  await uploadQueue.add("upload", {
    downloadId,
    filePath,
    filename,
    destinationId,
  });
}

export async function addCleanupJob(filePath: string, delayMs = 0) {
  await cleanupQueue.add("cleanup", { filePath }, { delay: delayMs });
}
