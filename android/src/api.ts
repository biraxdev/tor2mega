import * as SecureStore from "expo-secure-store";

const API_URL_KEY = "tor2mega_api_url";
const TOKEN_KEY = "tor2mega_token";

export async function getApiUrl(): Promise<string> {
  return (await SecureStore.getItemAsync(API_URL_KEY)) || "http://localhost:3000";
}

export async function setApiUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(API_URL_KEY, url);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
  return !!(await getToken());
}

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

export interface Video {
  id: string;
  title: string;
  thumbnail: string | null;
  duration: number;
  size: number;
  source_url: string;
  status: string;
  created_at: string;
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = await getApiUrl();
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getStats: () => request<{ stats: Stats }>("/stats"),
  getDownloads: () => request<{ downloads: Download[] }>("/downloads"),
  createDownload: (url: string, destinationId?: string) =>
    request<{ download: Download }>("/downloads", {
      method: "POST",
      body: JSON.stringify({ url, destinationId }),
    }),
  getDestinations: () => request<{ destinations: Destination[] }>("/destinations"),
  getVideos: (search?: string) =>
    request<{ videos: Video[] }>(`/videos${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  renameVideo: (id: string, title: string) =>
    request<{ video: Video }>(`/videos/${id}/rename`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),
  deleteVideo: (id: string) =>
    request(`/videos/${id}`, { method: "DELETE" }),
  getVideoStreamUrl: async (id: string): Promise<string> => {
    const baseUrl = await getApiUrl();
    return `${baseUrl}/api/videos/${id}/proxy`;
  },
};
