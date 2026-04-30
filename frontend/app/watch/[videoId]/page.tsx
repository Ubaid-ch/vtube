"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatViews, timeAgo, getInitials } from "@/lib/utils";
import LikeButton from "@/components/LikeButton";
import SubscribeButton from "@/components/SubscribeButton";
import CommentSection from "@/components/CommentSection";
import VideoCard from "@/components/VideoCard";

interface VideoDetail {
  _id: string; title: string; description: string;
  videoFile: string; thumbnail: string; duration: number;
  views: number; isPublished: boolean; createdAt: string;
  likesCount: number; isLikedByMe: boolean;
  owner: { _id: string; username: string; fullName: string; avatar?: string; subscribersCount: number; isSubscribed: boolean; };
}

export default function WatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [related, setRelated] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    api.get(`/videos/${videoId}`)
      .then((r) => setVideo(r.data.data))
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
    api.get("/videos", { params: { limit: 10 } })
      .then((r) => setRelated(r.data.data?.docs || r.data.data || []))
      .catch(() => {});
  }, [videoId, router]);

  if (loading) return (
    <div style={{ display: "flex", gap: 24 }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ aspectRatio: "16/9", borderRadius: 12 }} />
        <div className="skeleton" style={{ height: 28, marginTop: 16, borderRadius: 6 }} />
      </div>
    </div>
  );

  if (!video) return null;

  return (
    <div className="watch-layout">
      <div className="watch-main">
        {/* Player */}
        <div className="video-player">
          <video src={video.videoFile} controls autoPlay poster={video.thumbnail} />
        </div>

        {/* Title & actions */}
        <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>{video.title}</h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {formatViews(video.views)} views • {timeAgo(video.createdAt)}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <LikeButton entityId={video._id} type="video" initialLiked={video.isLikedByMe} initialCount={video.likesCount} />
          </div>
        </div>

        {/* Owner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", margin: "16px 0", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="channel-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>
              {video.owner?.avatar ? <img src={video.owner.avatar} alt="" /> : getInitials(video.owner?.fullName || "C")}
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{video.owner?.fullName}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>@{video.owner?.username}</div>
            </div>
          </div>
          {user?._id !== video.owner?._id && (
            <SubscribeButton channelId={video.owner._id} initialSubscribed={video.owner.isSubscribed} initialCount={video.owner.subscribersCount} />
          )}
        </div>

        {/* Description */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          {video.description}
        </div>

        <CommentSection videoId={video._id} />
      </div>

      {/* Related videos */}
      <div className="watch-side">
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>More Videos</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(related as VideoDetail[]).filter((v) => v._id !== videoId).slice(0, 8).map((v) => (
            <VideoCard key={v._id} video={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
