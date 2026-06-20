import { useEffect, useState, useRef } from "react";
import { api, type Download } from "../api";
import { formatBytes, formatDate, statusColor } from "../components/utils";
import { X, Trash2 } from "lucide-react";

export default function Downloads() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const prevDownloads = useRef<Record<string, { progress: number; time: number }>>({});
  const [speeds, setSpeeds] = useState<Record<string, { speed: string; eta: string }>>({});

  const load = () => {
    api.getDownloads().then((data) => {
      const now = Date.now();
      const newSpeeds: Record<string, { speed: string; eta: string }> = {};
      (data.downloads || []).forEach((dl) => {
        const prev = prevDownloads.current[dl.id];
        if (prev && dl.status === "downloading" && dl.progress > prev.progress) {
          const elapsed = (now - prev.time) / 1000;
          const progressDelta = dl.progress - prev.progress;
          const sizePerSec = (dl.size * progressDelta) / (100 * elapsed);
          const remainingProgress = 100 - dl.progress;
          const etaSec = (remainingProgress / progressDelta) * elapsed;
          newSpeeds[dl.id] = {
            speed: sizePerSec > 0 ? `${formatBytes(sizePerSec)}/s` : "—",
            eta: etaSec > 0 && etaSec < 3600 ? `${Math.floor(etaSec / 60)}m ${Math.floor(etaSec % 60)}s` : etaSec > 0 ? "—" : "—",
          };
        } else if (dl.status === "downloading" && speeds[dl.id]) {
          newSpeeds[dl.id] = speeds[dl.id];
        }
        prevDownloads.current[dl.id] = { progress: dl.progress, time: now };
      });
      setSpeeds(newSpeeds);
      setDownloads(data.downloads);
      setLoading(false);
    }).catch((e) => {
      setError(e.message);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const cancel = async (id: string) => {
    try { await api.cancelDownload(id); load(); } catch (e) { setError((e as Error).message); }
  };

  const remove = async (id: string) => {
    try { await api.deleteDownload(id); load(); } catch (e) { setError((e as Error).message); }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Downloads</h1>
      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Source URL</th>
              <th className="text-left p-3 font-medium">Size</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Progress</th>
              <th className="text-left p-3 font-medium">Speed</th>
              <th className="text-left p-3 font-medium">ETA</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Completed</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {downloads.length === 0 ? (
              <tr><td colSpan={10} className="text-center p-8 text-gray-500">No downloads yet</td></tr>
            ) : (
              downloads.map((dl) => (
                <tr key={dl.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 text-gray-200 max-w-xs truncate">{dl.title || dl.source_url}</td>
                  <td className="p-3 text-gray-500 max-w-xs truncate">{dl.source_url}</td>
                  <td className="p-3 text-gray-400">{formatBytes(dl.size)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusColor(dl.status)}`}>
                      {dl.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${dl.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{dl.progress}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{dl.status === "downloading" && speeds[dl.id] ? speeds[dl.id].speed : "—"}</td>
                  <td className="p-3 text-gray-400 text-xs">{dl.status === "downloading" && speeds[dl.id] ? speeds[dl.id].eta : "—"}</td>
                  <td className="p-3 text-gray-500 text-xs">{formatDate(dl.created_at)}</td>
                  <td className="p-3 text-gray-500 text-xs">{formatDate(dl.completed_at)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {["queued", "downloading", "uploading"].includes(dl.status) && (
                        <button onClick={() => cancel(dl.id)} className="p-1 hover:bg-gray-700 rounded" title="Cancel">
                          <X className="w-4 h-4 text-orange-400" />
                        </button>
                      )}
                      <button onClick={() => remove(dl.id)} className="p-1 hover:bg-gray-700 rounded" title="Delete">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
