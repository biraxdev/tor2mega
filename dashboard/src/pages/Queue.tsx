import { useEffect, useState } from "react";
import { api, type Download } from "../api";
import { formatBytes } from "../components/utils";

export default function Queue() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => {
      api.getDownloads().then((data) => {
        setDownloads(data.downloads.filter((d) => ["queued", "downloading", "uploading"].includes(d.status)));
      }).catch((e) => setError(e.message));
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="p-6 text-red-400">Error: {error}</div>;

  const queueItems = downloads.filter((d) => d.status === "queued");
  const activeItems = downloads.filter((d) => d.status !== "queued");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Queue (Real-time)</h1>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">Active ({activeItems.length})</h2>
        {activeItems.length === 0 ? (
          <div className="text-gray-500 text-sm">No active downloads</div>
        ) : (
          <div className="space-y-3">
            {activeItems.map((dl) => (
              <div key={dl.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-200 font-medium text-sm">{dl.title || dl.source_url}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    dl.status === "downloading" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300"
                  }`}>{dl.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${dl.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-10 text-right">{dl.progress}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">{formatBytes(dl.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">Waiting ({queueItems.length})</h2>
        {queueItems.length === 0 ? (
          <div className="text-gray-500 text-sm">Queue is empty</div>
        ) : (
          <div className="space-y-2">
            {queueItems.map((dl, i) => (
              <div key={dl.id} className="bg-gray-900 rounded-lg p-3 border border-gray-800 flex items-center gap-3">
                <span className="text-gray-600 font-mono text-sm w-6">#{i + 1}</span>
                <span className="text-gray-300 text-sm flex-1 truncate">{dl.title || dl.source_url}</span>
                <span className="text-xs text-gray-500">{formatBytes(dl.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
