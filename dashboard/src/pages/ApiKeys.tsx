import { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Copy, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used: string | null;
}

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/api-keys", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => setKeys(data.keys || []))
      .catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: keyName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create key");
      }
      const data = await res.json();
      setNewKey(data.key);
      setKeyName("");
      setShowCreate(false);
      load();
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      load();
    } catch (e) { setError((e as Error).message); }
  };

  const copyKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => { setCopied(false); setNewKey(null); }, 3000);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Create Key
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {newKey && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-300 mb-2 font-semibold">API Key created! Copy it now — you won't see it again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-gray-900 px-3 py-2 rounded text-green-400 text-sm font-mono break-all">{newKey}</code>
            <button onClick={copyKey} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={create} className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-4 flex gap-2">
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Key name (e.g. Mobile App)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
            required
          />
          <button type="submit" disabled={loading} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Creating..." : "Create"}
          </button>
          <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
        </form>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Key</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Last Used</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-8 text-gray-500">No API keys yet</td></tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 text-gray-200 flex items-center gap-2"><KeyRound className="w-3 h-3 text-gray-500" />{k.name}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{k.key_prefix}...</td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-gray-500 text-xs">{k.last_used ? new Date(k.last_used).toLocaleDateString() : "Never"}</td>
                  <td className="p-3">
                    <button onClick={() => remove(k.id)} className="p-1 hover:bg-gray-700 rounded">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
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
