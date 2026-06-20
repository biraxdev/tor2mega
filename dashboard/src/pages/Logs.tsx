import { useEffect, useState } from "react";
import { api, type LogEntry } from "../api";
import { formatDate } from "../components/utils";

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    const load = () => {
      api.getLogs(level ? { level } : undefined).then((data) => setLogs(data.logs)).catch((e) => setError(e.message));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [level]);

  const levelColor = (lvl: string) => {
    const colors: Record<string, string> = {
      success: "text-green-400",
      error: "text-red-400",
      warn: "text-orange-400",
      info: "text-blue-400",
    };
    return colors[lvl] || "text-gray-400";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Logs</h1>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
        >
          <option value="">All levels</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="warn">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No logs found</div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {logs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-gray-800/30 flex items-start gap-3">
                <span className={`text-xs font-semibold uppercase w-16 ${levelColor(log.level)}`}>{log.level}</span>
                <span className="text-sm text-gray-300 flex-1">{log.message}</span>
                {log.download_title && <span className="text-xs text-gray-600 max-w-xs truncate">{log.download_title}</span>}
                <span className="text-xs text-gray-600 whitespace-nowrap">{formatDate(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
