import { useEffect, useState } from "react";
import { api, type Settings as SettingsType, isAuthenticated, getToken } from "../api";
import { Copy, Check } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getSettings().then((data) => setSettings(data.settings)).catch((e) => setError(e.message));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError((e as Error).message); }
  };

  const copyToken = () => {
    const token = getToken();
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!settings) return <div className="p-6 text-gray-400">Loading...</div>;

  const fields = [
    { key: "max_concurrent_downloads", label: "Max Concurrent Downloads", type: "number" },
    { key: "max_uploads", label: "Max Uploads", type: "number" },
    { key: "max_file_size_mb", label: "Max File Size (MB, 0 = unlimited)", type: "number" },
    { key: "retry_count", label: "Retry Count", type: "number" },
    { key: "auto_delete_logs_days", label: "Auto Delete Logs (days)", type: "number" },
    { key: "cleanup_delay_hours", label: "Cleanup Delay (hours)", type: "number" },
  ] as const;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <form onSubmit={save} className="bg-gray-900 rounded-xl p-5 border border-gray-800 space-y-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase">Download Configuration</h2>
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
            <input
              type={field.type}
              value={settings[field.key]}
              onChange={(e) => setSettings({ ...settings, [field.key]: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Mega File Request URL</label>
          <input
            type="text"
            value={settings.mega_file_request_url || ""}
            onChange={(e) => setSettings({ ...settings, mega_file_request_url: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
            placeholder="https://mega.nz/filerequest/..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Settings</button>
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
        </div>
      </form>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">API Token</h2>
        <p className="text-sm text-gray-500 mb-3">Use this token to configure the Tor Browser extension.</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={isAuthenticated() ? getToken() || "" : ""}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono"
          />
          <button onClick={copyToken} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg" title="Copy token">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
