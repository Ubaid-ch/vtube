"use client";

import Link from "next/link";
import { formatDuration, formatViews, timeAgo, getInitials } from "@/lib/utils";

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  createdAt: string;
  owner: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
}

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link href={`/watch/${video._id}`} style={{ textDecoration: "none" }}>
      <div className="video-card">
        <div className="video-thumb">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} loading="lazy" />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
              🎬
            </div>
          )}
          <span className="video-duration">{formatDuration(video.duration)}</span>
        </div>
        <div className="video-info">
          <div className="video-owner-avatar">
            {video.owner?.avatar ? (
              <img src={video.owner.avatar} alt={video.owner.fullName} />
            ) : (
              getInitials(video.owner?.fullName || "U")
            )}
          </div>
          <div className="video-meta">
            <div className="video-title">{video.title}</div>
            <div className="video-owner-name">{video.owner?.fullName}</div>
            <div className="video-stats">
              {formatViews(video.views)} views • {timeAgo(video.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
