import { Pool, QueryResult } from "pg";
import { config } from "../config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  return pool.query(text, params);
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const res = await query(text, params);
  return (res.rows[0] as T) || null;
}
