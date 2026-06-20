import { spawn } from "child_process";
import { existsSync, statSync } from "fs";
import { config } from "../config";

export interface DownloadResult {
  filePath: string;
  filename: string;
  title: string;
  size: number;
  duration: number;
}

export interface DownloadProgress {
  percent: number;
  speed: string;
  eta: string;
}

export async function downloadVideo(
  url: string,
  outputDir: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<DownloadResult> {
  return new Promise((resolve, reject) => {
    const args = [
      "--no-warnings",
      "--no-playlist",
      "--newline",
      "--progress",
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", `${outputDir}/%(title).80s.%(ext)s`,
      "--print-json",
      url,
    ];

    const proc = spawn(config.ytDlpPath, args, {
      cwd: outputDir,
      env: { ...process.env, PATH: `${config.ffmpegPath}:${process.env.PATH}` },
    });

    let jsonOutput = "";
    let lastProgress = 0;

    proc.stdout.on("data", (data: Buffer) => {
      const text = data.toString();
      if (text.trim().startsWith("{")) {
        jsonOutput += text;
      }
      const progressMatch = text.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        const percent = parseFloat(progressMatch[1]);
        if (percent > lastProgress) {
          lastProgress = percent;
          const speedMatch = text.match(/at\s+([\d.]+\w+\/s)/);
          const etaMatch = text.match(/ETA\s+(\d{2}:\d{2})/);
          onProgress?.({
            percent,
            speed: speedMatch ? speedMatch[1] : "",
            eta: etaMatch ? etaMatch[1] : "",
          });
        }
      }
    });

    proc.stderr.on("data", (data: Buffer) => {
      const text = data.toString();
      const progressMatch = text.match(/(\d+\.?\d*)%/);
      if (progressMatch) {
        const percent = parseFloat(progressMatch[1]);
        if (percent > lastProgress) {
          lastProgress = percent;
          const speedMatch = text.match(/at\s+([\d.]+\w+\/s)/);
          const etaMatch = text.match(/ETA\s+(\d{2}:\d{2})/);
          onProgress?.({
            percent,
            speed: speedMatch ? speedMatch[1] : "",
            eta: etaMatch ? etaMatch[1] : "",
          });
        }
      }
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp exited with code ${code}`));
      }

      let metadata: { title?: string; _filename?: string } = {};
      try {
        metadata = JSON.parse(jsonOutput);
      } catch {
        // If JSON parse fails, we'll try to find the file
      }

      let filename = metadata._filename;
      let filePath = filename ? `${outputDir}/${filename}` : "";

      if (!filePath || !existsSync(filePath)) {
        // Try to find the most recent file in outputDir
        const fs = require("fs");
        const files = fs.readdirSync(outputDir) as string[];
        const mediaFiles = files.filter((f: string) =>
          /\.(mp4|webm|mkv|mov)$/i.test(f)
        );
        if (mediaFiles.length === 0) {
          return reject(new Error("No output file found after download"));
        }
        // Get the most recently modified file
        let latest = mediaFiles[0];
        let latestMtime = 0;
        for (const f of mediaFiles) {
          const stat = statSync(`${outputDir}/${f}`);
          if (stat.mtimeMs > latestMtime) {
            latestMtime = stat.mtimeMs;
            latest = f;
          }
        }
        filename = latest;
        filePath = `${outputDir}/${latest}`;
      }

      const stat = statSync(filePath);
      resolve({
        filePath,
        filename,
        title: metadata.title || filename,
        size: stat.size,
        duration: (metadata as Record<string, unknown>).duration as number || 0,
      });
    });

    proc.on("error", (err) => reject(err));
  });
}
