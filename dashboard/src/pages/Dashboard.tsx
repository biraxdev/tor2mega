import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Stats, type Video } from "../api";
import { Film, Loader, HardDrive, Clock, Play, ArrowRight } from "lucide-react";
import { formatBytes } from "../components/utils";

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => {
      Promise.all([
        api.getStats().then((data) => setStats(data.stats)),
        api.getVideos({ sortBy: "created_at", sortOrder: "desc" }).then((data) => setVideos(data.videos || [])),
      ]).catch((e) => setError(e.message));
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;
  if (!stats) return <div className="p-6 text-gray-400">Loading...</div>;

  const totalVideos = videos.length;
  const processing = videos.filter((v) => v.status === "processing" || v.status === "downloading" || v.status === "uploading").length;
  const storageUsed = videos.reduce((sum, v) => sum + (v.size || 0), 0);
  const recentlyAdded = videos.slice(0, 6);

  const cards = [
    { label: "Total Videos", value: totalVideos, icon: Film, color: "text-brand-light" },
    { label: "Processing", value: processing, icon: Loader, color: "text-blue-400" },
    { label: "Storage Used", value: formatBytes(storageUsed), icon: HardDrive, color: "text-green-400" },
    { label: "Recently Added", value: recentlyAdded.length, icon: Clock, color: "text-orange-400" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recently Added</h2>
        <Link to="/dashboard/videos" className="text-sm text-brand-light hover:text-white flex items-center gap-1">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {recentlyAdded.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
          No videos yet. Use the browser or extension to add videos to your library.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentlyAdded.map((video) => (
            <Link
              key={video.id}
              to="/dashboard/videos"
              className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors group"
            >
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Film className="w-8 h-8 text-gray-600" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-white truncate">{video.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {video.duration > 0 ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")}` : "—"}
                  {" · "}
                  {formatBytes(video.size)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
