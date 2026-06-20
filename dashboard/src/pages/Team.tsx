import { useEffect, useState } from "react";
import { api } from "../api";
import { Users, Plus, Trash2, Mail } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    fetch("/api/team/members", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((data) => setMembers(data.members || []))
      .catch((e) => setError(e.message));
  };

  useEffect(() => { load(); }, []);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite");
      }
      setInviteEmail("");
      setShowInvite(false);
      load();
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const remove = async (id: string) => {
    try {
      await fetch(`/api/team/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      load();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Invite Member
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg p-3 mb-4">{error}</div>}

      {showInvite && (
        <form onSubmit={invite} className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-4 flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="member@email.com"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
            required
          />
          <button type="submit" disabled={loading} className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Sending..." : "Send Invite"}
          </button>
          <button type="button" onClick={() => setShowInvite(false)} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
        </form>
      )}

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-8 text-gray-500">No team members</td></tr>
            ) : (
              members.map((m) => (
                <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-3 text-gray-200 flex items-center gap-2"><Mail className="w-3 h-3 text-gray-500" />{m.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${m.role === "admin" ? "bg-purple-900 text-purple-300" : "bg-blue-900 text-blue-300"}`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    {m.role !== "admin" && (
                      <button onClick={() => remove(m.id)} className="p-1 hover:bg-gray-700 rounded">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
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
