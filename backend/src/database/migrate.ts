import { pool } from "./index";

const MIGRATIONS = [
  `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`,

  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mega_url TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    title TEXT,
    filename TEXT,
    size BIGINT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
  )`,

  `CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    download_id UUID REFERENCES downloads(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'info',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    max_concurrent_downloads INTEGER DEFAULT 3,
    max_uploads INTEGER DEFAULT 2,
    max_file_size_mb INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 3,
    auto_delete_logs_days INTEGER DEFAULT 7,
    cleanup_delay_hours INTEGER DEFAULT 24
  )`,

  `CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads(status)`,
  `CREATE INDEX IF NOT EXISTS idx_destinations_user_id ON destinations(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_logs_download_id ON logs(download_id)`,
  `ALTER TABLE settings ADD COLUMN IF NOT EXISTS cleanup_delay_hours INTEGER DEFAULT 24`,

  `CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin'`,

  `CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    invited_email TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, user_id)
  )`,

  `CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members(organization_id)`,

  `CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    download_id UUID REFERENCES downloads(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled',
    thumbnail TEXT,
    duration INTEGER DEFAULT 0,
    size BIGINT DEFAULT 0,
    source_url TEXT NOT NULL,
    mega_url TEXT,
    status TEXT NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)`,
  `CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC)`,
  `ALTER TABLE downloads ADD COLUMN IF NOT EXISTS video_id UUID REFERENCES videos(id) ON DELETE SET NULL`,
];

export async function runMigrations() {
  for (const sql of MIGRATIONS) {
    await pool.query(sql);
  }
  console.log("[migrate] All migrations applied");
}
