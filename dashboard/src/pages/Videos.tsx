import { useEffect, useState, useCallback } from "react";
import { api, type Video } from "../api";
import { Search, Play, Trash2, Download, Edit3, Film, X, LayoutGrid, List } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [renaming, setRenaming] = useState<Video | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVideos({
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder: "desc",
      });
      setVideos(data.videos);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.deleteVideo(id);
      setVideos(videos.filter((v) => v.id !== id));
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleRename = async () => {
    if (!renaming || !renameTitle.trim()) return;
    try {
      const { video } = await api.renameVideo(renaming.id, renameTitle.trim());
      setVideos(videos.map((v) => (v.id === video.id ? video : v)));
      setRenaming(null);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleDownload = async (video: Video) => {
    try {
      const info = await api.getVideoDownloadInfo(video.id);
      const a = document.createElement("a");
      a.href = info.downloadUrl;
      a.download = info.filename;
      a.target = "_blank";
      a.click();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">My Videos</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or URL..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
        >
          <option value="">All Status</option>
          <option value="ready">Ready</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-brand"
        >
          <option value="created_at">Newest</option>
          <option value="title">Title</option>
          <option value="size">Size</option>
          <option value="duration">Duration</option>
        </select>
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-brand text-white" : "text-gray-400 hover:text-white"}`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-brand text-white" : "text-gray-400 hover:text-white"}`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">Loading...</div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No videos in your library yet</p>
          <p className="text-sm mt-1">Send a video from the extension or Add URL page</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => (
                <tr key={video.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 rounded bg-gray-800 flex-shrink-0 overflow-hidden">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-3 h-3 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-white truncate max-w-[200px]" title={video.title}>{video.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatSize(video.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDuration(video.duration)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{new Date(video.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      video.status === "ready" ? "bg-green-900 text-green-300" :
                      video.status === "processing" ? "bg-yellow-900 text-yellow-300" :
                      "bg-red-900 text-red-300"
                    }`}>{video.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => video.status === "ready" && setPlaying(video)} disabled={video.status !== "ready"} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white disabled:opacity-30" title="Watch"><Play className="w-4 h-4" /></button>
                      <button onClick={() => handleDownload(video)} disabled={video.status !== "ready"} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white disabled:opacity-30" title="Download"><Download className="w-4 h-4" /></button>
                      <button onClick={() => { setRenaming(video); setRenameTitle(video.title); }} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white" title="Rename"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(video.id)} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group hover:border-gray-700 transition-colors"
            >
              <div
                className="relative aspect-video bg-gray-800 cursor-pointer"
                onClick={() => video.status === "ready" && setPlaying(video)}
              >
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-gray-600" />
                  </div>
                )}
                {video.status === "ready" && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-white" />
                  </div>
                )}
                {video.status !== "ready" && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      video.status === "processing" ? "bg-yellow-900 text-yellow-300" : "bg-red-900 text-red-300"
                    }`}>
                      {video.status}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate mb-1" title={video.title}>{video.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{formatSize(video.size)}</p>
                <p className="text-xs text-gray-600 mb-3">{new Date(video.created_at).toLocaleDateString()}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => video.status === "ready" && setPlaying(video)}
                    disabled={video.status !== "ready"}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white disabled:opacity-30"
                    title="Watch"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(video)}
                    disabled={video.status !== "ready"}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white disabled:opacity-30"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setRenaming(video); setRenameTitle(video.title); }}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white"
                    title="Rename"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {playing && (
        <VideoPlayer video={playing} onClose={() => setPlaying(null)} />
      )}

      {renaming && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setRenaming(null)}>
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Rename Video</h2>
              <button onClick={() => setRenaming(null)} className="p-1 hover:bg-gray-800 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand mb-3"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRenaming(null)} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleRename} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
