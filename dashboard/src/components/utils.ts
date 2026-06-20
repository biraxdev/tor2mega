export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: "bg-blue-900 text-blue-300",
    downloading: "bg-blue-900 text-blue-300",
    uploading: "bg-purple-900 text-purple-300",
    completed: "bg-green-900 text-green-300",
    failed: "bg-red-900 text-red-300",
    cancelled: "bg-gray-700 text-gray-300",
  };
  return colors[status] || "bg-gray-700 text-gray-300";
}
