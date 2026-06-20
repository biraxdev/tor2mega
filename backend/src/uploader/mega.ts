import { createReadStream, statSync } from "fs";
import { basename } from "path";
import { query, queryOne } from "../database";
import { config } from "../config";

export interface UploadProgress {
  percent: number;
  uploaded: number;
  total: number;
}

function parseFileRequestUrl(url: string): { id: string; key: string } {
  const match = url.match(/filerequest\/([a-zA-Z0-9_-]+)(?:#([a-zA-Z0-9_-]+))?/);
  if (!match) throw new Error("Invalid Mega file request URL");
  return { id: match[1], key: match[2] || "" };
}

export async function uploadToMega(
  filePath: string,
  filename: string,
  megaUrl: string,
  downloadId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  const { id: requestId } = parseFileRequestUrl(megaUrl);
  const stat = statSync(filePath);
  const totalSize = stat.size;

  await log(downloadId, `Starting upload to Mega (file request: ${requestId})`, "info");

  try {
    const mega = await import("megajs");
    
    const fileRequestUrl = `https://mega.nz/filerequest/${requestId}`;
    
    // Use megajs to upload via file request
    // megajs supports uploading to file requests via the FileRequest API
    const stream = createReadStream(filePath);
    
    await new Promise<void>((resolve, reject) => {
      const uploadHandle = (mega.File as any).uploadToRequest(
        fileRequestUrl,
        stream,
        { name: filename },
        (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        }
      );

      if (uploadHandle && onProgress) {
        let uploaded = 0;
        stream.on("data", (chunk: any) => {
          uploaded += chunk.length;
          const percent = Math.round((uploaded / totalSize) * 100);
          onProgress({ percent, uploaded, total: totalSize });
        });
      }
    });

    await log(downloadId, `Upload completed: ${filename} (${formatBytes(totalSize)})`, "success");
  } catch (err) {
    // Fallback: try using the Mega API directly for file request uploads
    await log(downloadId, `megajs upload failed, trying direct API: ${(err as Error).message}`, "warn");
    await uploadToMegaDirect(filePath, filename, requestId, downloadId, onProgress);
  }
}

async function uploadToMegaDirect(
  filePath: string,
  filename: string,
  requestId: string,
  downloadId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<void> {
  // Use Mega's web API to upload via file request
  // This is a simplified implementation using fetch to the Mega API
  const stat = statSync(filePath);
  const totalSize = stat.size;
  
  // Step 1: Get upload URL from Mega
  const apiUrl = "https://g.api.mega.co.nz/cs";
  const requestData = [
    {
      a: "fr",  // file request command
      fr: requestId,
    },
  ];

  const response = await fetch(`${apiUrl}?id=1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });

  const result = await response.json() as unknown[];
  const frData = result[0] as { p: string; s: number; u: string; fr: { hs: string } };
  
  if (!frData || !frData.p) {
    throw new Error("Failed to get file request upload URL from Mega");
  }

  await log(downloadId, `Got upload URL from Mega`, "info");

  // Step 2: Encrypt and upload the file
  // Mega requires AES encryption. We'll use a random key.
  const { randomBytes, createCipher } = await import("crypto");
  
  const fileKey = randomBytes(32);
  const iv = randomBytes(16);
  const metaMac = Buffer.alloc(8); // Will be computed during encryption
  
  // Create AES-CTR cipher for file data
  const cipher = createCipher("aes-256-ctr", fileKey);
  (cipher as any).setIVOnly(iv);

  // Step 3: Upload encrypted data
  const uploadUrl = `${frData.p}/0`;
  const stream = createReadStream(filePath);
  const encryptedStream = stream.pipe(cipher);

  let uploaded = 0;
  stream.on("data", (chunk: any) => {
    uploaded += chunk.length;
    if (onProgress) {
      onProgress({
        percent: Math.round((uploaded / totalSize) * 100),
        uploaded,
        total: totalSize,
      });
    }
  });

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: encryptedStream as any,
    headers: {
      "Content-Length": String(totalSize),
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status ${uploadResponse.status}`);
  }

  const completionToken = await uploadResponse.text();

  // Step 4: Complete the upload with Mega
  const completeData = [
    {
      a: "frp",  // file request put
      fr: requestId,
      s: totalSize,
      t: completionToken,
      k: fileKey.toString("base64"),
      n: filename,
    },
  ];

  const completeResponse = await fetch(`${apiUrl}?id=2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(completeData),
  });

  const completeResult = await completeResponse.json() as unknown[];
  if (!completeResult || (completeResult[0] as { error?: number })?.error) {
    throw new Error("Failed to complete Mega upload");
  }

  await log(downloadId, `Upload completed via direct API: ${filename}`, "success");
}

async function log(downloadId: string, message: string, level: string) {
  await query(
    "INSERT INTO logs (download_id, message, level) VALUES ($1, $2, $3)",
    [downloadId, message, level]
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
