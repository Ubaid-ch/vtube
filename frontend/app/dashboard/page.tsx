"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatViews, timeAgo } from "@/lib/utils";

interface Stats { totalViews: number; totalSubscribers: number; totalLikes: number; totalVideos: number; }
interface Video { _id: string; title: string; thumbnail: string; views: number; isPublished: boolean; createdAt: string; }

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/videos")])
      .then(([s, v]) => {
        setStats(s.data.data);
        setVideos(v.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const togglePublish = async (id: string) => {
    try {
      const r = await api.patch(`/videos/toggle/publish/${id}`);
      setVideos((vs) => vs.map((v) => v._id === id ? { ...v, isPublished: r.data.data.isPublished } : v));
    } catch {}
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      setVideos((vs) => vs.filter((v) => v._id !== id));
    } catch {}
  };

  if (loading) return <div style={{ padding: 32 }}><div className="spinner" style={{ margin: "0 auto" }} /></div>;

  return (
    <>
      <div className="page-header">
        <h1>Channel Dashboard</h1>
        <p>Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: "👁️", value: formatViews(stats?.totalViews || 0), label: "Total Views" },
          { icon: "👥", value: (stats?.totalSubscribers || 0).toLocaleString(), label: "Subscribers" },
          { icon: "❤️", value: (stats?.totalLikes || 0).toLocaleString(), label: "Total Likes" },
          { icon: "🎬", value: (stats?.totalVideos || 0).toLocaleString(), label: "Videos" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Videos table */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Your Videos</h2>
        <Link href="/upload" className="btn btn-red btn-sm">＋ Upload New</Link>
      </div>

      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📹</div>
          <h3>No videos yet</h3>
          <p>Upload your first video to get started</p>
          <Link href="/upload" className="btn btn-red" style={{ marginTop: 16 }}>Upload Video</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Video</th>
                <th>Status</th>
                <th>Views</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={v.thumbnail} alt={v.title} style={{ width: 80, aspectRatio: "16/9", objectFit: "cover", borderRadius: 6 }} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{v.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${v.isPublished ? "badge-green" : "badge-gray"}`}>
                      {v.isPublished ? "Published" : "Private"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{formatViews(v.views)}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{timeAgo(v.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-gray btn-sm" onClick={() => togglePublish(v._id)}>
                        {v.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <Link href={`/watch/${v._id}`} className="btn btn-outline btn-sm">View</Link>
                      <button className="btn btn-sm" style={{ background: "rgba(255,68,68,0.15)", color: "#ff6666" }} onClick={() => deleteVideo(v._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
