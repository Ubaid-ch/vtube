"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";

interface Playlist { _id: string; name: string; description: string; createdAt: string; }

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/playlists/user/${user._id}`)
      .then((r) => setPlaylists(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const r = await api.post("/playlists", form);
      setPlaylists((p) => [r.data.data, ...p]);
      setForm({ name: "", description: "" });
      setShowForm(false);
    } catch {}
    setCreating(false);
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm("Delete this playlist?")) return;
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists((p) => p.filter((pl) => pl._id !== id));
    } catch {}
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>📋 Playlists</h1>
        </div>
        <button className="btn btn-red btn-sm" onClick={() => setShowForm((s) => !s)} id="new-playlist-btn">
          ＋ New Playlist
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 480 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Create Playlist</h3>
          <form onSubmit={create}>
            <div className="form-group">
              <label className="form-label" htmlFor="pl-name">Name</label>
              <input id="pl-name" className="form-input" placeholder="Playlist name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pl-desc">Description</label>
              <input id="pl-desc" className="form-input" placeholder="Optional description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" className="btn btn-red btn-sm" disabled={creating}>{creating ? "Creating..." : "Create"}</button>
              <button type="button" className="btn btn-gray btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to organize videos</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {playlists.map((pl) => (
            <div key={pl._id} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{pl.name}</h3>
              {pl.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{pl.description}</p>}
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Created {timeAgo(pl.createdAt)}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="btn btn-sm" style={{ background: "rgba(255,68,68,0.15)", color: "#ff6666" }} onClick={() => deletePlaylist(pl._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
