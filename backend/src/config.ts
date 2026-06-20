import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://tor2mega:tor2mega@localhost:5432/tor2mega",

  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  megaFileRequestUrl:
    process.env.MEGA_FILE_REQUEST_URL ||
    "https://mega.nz/filerequest/bNDOuR4lSVo",

  download: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || "3", 10),
    maxUploads: parseInt(process.env.MAX_UPLOADS || "2", 10),
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || "0", 10),
    retryCount: parseInt(process.env.RETRY_COUNT || "3", 10),
    tmpDir: process.env.TMP_DIR || "./tmp/downloads",
  },

  ytDlpPath: process.env.YT_DLP_PATH || "yt-dlp",
  ffmpegPath: process.env.FFMPEG_PATH || "ffmpeg",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY || undefined,
};
