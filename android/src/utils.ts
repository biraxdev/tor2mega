export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: "#60a5fa",
    downloading: "#60a5fa",
    uploading: "#a78bfa",
    completed: "#4ade80",
    failed: "#f87171",
    cancelled: "#9ca3af",
  };
  return colors[status] || "#9ca3af";
}
