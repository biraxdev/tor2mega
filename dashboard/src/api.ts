const API_URL = import.meta.env.VITE_API_URL || "/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  register: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string } }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () => request<{ user: { id: string; email: string } }>("/auth/me"),

  getStats: () => request<{ stats: Stats }>("/stats"),
  getDownloads: (status?: string) =>
    request<{ downloads: Download[] }>(
      `/downloads${status ? `?status=${status}` : ""}`
    ),
  createDownload: (url: string, destinationId?: string) =>
    request<{ download: Download }>("/downloads", {
      method: "POST",
      body: JSON.stringify({ url, destinationId }),
    }),
  cancelDownload: (id: string) =>
    request<{ download: Download }>(`/downloads/${id}/cancel`, { method: "POST" }),
  deleteDownload: (id: string) =>
    request(`/downloads/${id}`, { method: "DELETE" }),

  getDestinations: () => request<{ destinations: Destination[] }>("/destinations"),
  createDestination: (name: string, megaUrl: string) =>
    request<{ destination: Destination }>("/destinations", {
      method: "POST",
      body: JSON.stringify({ name, megaUrl }),
    }),
  updateDestination: (id: string, data: Partial<Destination>) =>
    request<{ destination: Destination }>(`/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteDestination: (id: string) =>
    request(`/destinations/${id}`, { method: "DELETE" }),

  getLogs: (params?: { downloadId?: string; level?: string }) =>
    request<{ logs: LogEntry }>(
      `/logs${params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : ""}`
    ),

  getSettings: () => request<{ settings: Settings }>("/settings"),
  updateSettings: (data: Partial<Settings>) =>
    request<{ settings: Settings }>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getVideos: (params?: { search?: string; status?: string; sortBy?: string; sortOrder?: string }) =>
    request<{ videos: Video[] }>(
      `/videos${params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : ""}`
    ),
  getVideo: (id: string) => request<{ video: Video }>(`/videos/${id}`),
  renameVideo: (id: string, title: string) =>
    request<{ video: Video }>(`/videos/${id}/rename`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),
  deleteVideo: (id: string) =>
    request(`/videos/${id}`, { method: "DELETE" }),
  getVideoStreamUrl: (id: string) => `${API_URL}/videos/${id}/proxy`,
  getVideoDownloadInfo: (id: string) =>
    request<{ downloadUrl: string; filename: string }>(`/videos/${id}/download`, { method: "POST" }),
};

export interface Stats {
  totalDownloads: number;
  totalUploads: number;
  filesToday: number;
  successRate: number;
  activeQueue: number;
  storageSent: number;
}

export interface Download {
  id: string;
  user_id: string;
  destination_id: string | null;
  source_url: string;
  title: string | null;
  filename: string | null;
  size: number;
  status: string;
  progress: number;
  created_at: string;
  completed_at: string | null;
}

export interface Destination {
  id: string;
  name: string;
  mega_url: string;
  enabled: boolean;
  created_at: string;
}

export interface LogEntry {
  id: string;
  download_id: string;
  message: string;
  level: string;
  created_at: string;
  download_title?: string;
}

export interface Settings {
  max_concurrent_downloads: number;
  max_uploads: number;
  max_file_size_mb: number;
  retry_count: number;
  auto_delete_logs_days: number;
  cleanup_delay_hours: number;
  mega_file_request_url: string;
}

export interface Video {
  id: string;
  user_id: string;
  download_id: string | null;
  title: string;
  thumbnail: string | null;
  duration: number;
  size: number;
  source_url: string;
  status: string;
  created_at: string;
}
