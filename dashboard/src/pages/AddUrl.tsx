import { useState } from "react";
import { api, type Destination } from "../api";
import { useNavigate } from "react-router-dom";
import { Send, Plus } from "lucide-react";
import { useEffect } from "react";

export default function AddUrl() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destId, setDestId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.getDestinations().then((data) => {
      const enabled = data.destinations.filter((d) => d.enabled);
      setDestinations(enabled);
      if (enabled.length > 0) setDestId(enabled[0].id);
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await api.createDownload(url.trim(), destId || undefined);
      setSuccess(true);
      setUrl("");
      setTimeout(() => navigate("/downloads"), 1500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Add URL Manually</h1>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}
      {success && <div className="bg-green-900/30 border border-green-800 text-green-300 text-sm rounded-lg p-3 mb-4">Added to queue! Redirecting...</div>}

      <form onSubmit={submit} className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Video URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Destination</label>
          <select
            value={destId}
            onChange={(e) => setDestId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
          >
            <option value="">Default destination</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send to Mega"}
        </button>
      </form>

      <div className="mt-4">
        <button
          onClick={() => navigate("/destinations")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand-light"
        >
          <Plus className="w-4 h-4" /> Manage destinations
        </button>
      </div>
    </div>
  );
}
