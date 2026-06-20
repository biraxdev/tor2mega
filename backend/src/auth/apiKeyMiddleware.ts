import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { queryOne } from "../database";
import { AuthRequest, authMiddleware } from "./middleware";

export async function apiKeyMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (apiKey) {
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const keyRecord = await queryOne<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM api_keys WHERE key_hash = $1",
      [keyHash]
    );

    if (!keyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    await queryOne("UPDATE api_keys SET last_used = now() WHERE id = $1", [keyRecord.id]);
    req.userId = keyRecord.user_id;
    return next();
  }

  return authMiddleware(req, res, next);
}

export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    const key = authReq.userId || req.ip || "anonymous";
    const now = Date.now();

    let record = requests.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      requests.set(key, record);
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: "Rate limit exceeded", retryAfter: Math.ceil((record.resetTime - now) / 1000) });
    }

    record.count++;
    next();
  };
}
