"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import VideoCard from "@/components/VideoCard";
import SkeletonCard from "@/components/SkeletonCard";

interface Video { _id: string; title: string; thumbnail: string; duration: number; views: number; createdAt: string; owner: { _id: string; username: string; fullName: string; avatar?: string }; }

export default function LikedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/likes/videos")
      .then((r) => setVideos(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h1>❤️ Liked Videos</h1>
        <p>{videos.length} liked videos</p>
      </div>
      {loading ? (
        <div className="video-grid">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>No liked videos yet</h3>
          <p>Videos you like will appear here</p>
        </div>
      ) : (
        <div className="video-grid">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </>
  );
}
