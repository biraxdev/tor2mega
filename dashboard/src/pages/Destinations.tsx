import { useEffect, useState } from "react";
import { api, type Destination } from "../api";
import { Plus, Edit2, Trash2, Power } from "lucide-react";
import { formatDate } from "../components/utils";

const DEFAULT_MEGA_URL = "https://mega.nz/filerequest/bNDOuR4lSVo";

export default function Destinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [name, setName] = useState("");
  const [megaUrl, setMegaUrl] = useState(DEFAULT_MEGA_URL);

  const load = () => {
    api.getDestinations().then((data) => setDestinations(data.destinations)).catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateDestination(editing.id, { name, mega_url: megaUrl });
      } else {
        await api.createDestination(name, megaUrl);
      }
      setShowForm(false);
      setEditing(null);
      setName("");
      setMegaUrl(DEFAULT_MEGA_URL);
      load();
    } catch (e) { setError((e as Error).message); }
  };

  const toggle = async (dest: Destination) => {
    try { await api.updateDestination(dest.id, { enabled: !dest.enabled }); load(); } catch (e) { setError((e as Error).message); }
  };

  const remove = async (id: string) => {
    try { await api.deleteDestination(id); load(); } catch (e) { setError((e as Error).message); }
  };

  const edit = (dest: Destination) => {
    setEditing(dest);
    setName(dest.name);
    setMegaUrl(dest.mega_url);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Destinations</h1>
        <button
          onClick={() => { setEditing(null); setName(""); setMegaUrl(DEFAULT_MEGA_URL); setShowForm(true); }}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Destination
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mega File Request URL</label>
            <input type="text" value={megaUrl} onChange={(e) => setMegaUrl(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold">{editing ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Mega URL</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Created</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-8 text-gray-500">No destinations yet</td></tr>
            ) : (
              destinations.map((dest) => (
                <tr key={dest.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 text-gray-200">{dest.name}</td>
                  <td className="p-3 text-gray-500 max-w-xs truncate">{dest.mega_url}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${dest.enabled ? "bg-green-900 text-green-300" : "bg-gray-700 text-gray-400"}`}>
                      {dest.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{formatDate(dest.created_at)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggle(dest)} className="p-1 hover:bg-gray-700 rounded" title={dest.enabled ? "Disable" : "Enable"}>
                        <Power className={`w-4 h-4 ${dest.enabled ? "text-green-400" : "text-gray-500"}`} />
                      </button>
                      <button onClick={() => edit(dest)} className="p-1 hover:bg-gray-700 rounded" title="Edit">
                        <Edit2 className="w-4 h-4 text-blue-400" />
                      </button>
                      <button onClick={() => remove(dest.id)} className="p-1 hover:bg-gray-700 rounded" title="Delete">
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
