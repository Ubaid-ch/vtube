"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import VideoCard from "@/components/VideoCard";
import SkeletonCard from "@/components/SkeletonCard";

interface Video {
  _id: string; title: string; thumbnail: string; duration: number;
  views: number; createdAt: string;
  owner: { _id: string; username: string; fullName: string; avatar?: string };
}

function HomeContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setVideos([]); setPage(1); setHasMore(true); setLoading(true);
    fetchVideos(1, q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const fetchVideos = async (p: number, query: string) => {
    try {
      const params: Record<string, string | number> = { page: p, limit: 16 };
      if (query) params.query = query;
      const r = await api.get("/videos", { params });
      const data = r.data.data;
      const docs = data?.docs || data || [];
      setVideos((v) => p === 1 ? docs : [...v, ...docs]);
      setHasMore(data?.hasNextPage ?? docs.length === 16);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchVideos(next, q);
  };

  return (
    <>
      <div className="page-header">
        <h1>{q ? `Search: "${q}"` : "Home"}</h1>
        {q && <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Showing results for &quot;{q}&quot;</p>}
      </div>

      {loading ? (
        <div className="video-grid">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎬</div>
          <h3>{q ? "No videos found" : "No videos yet"}</h3>
          <p>{q ? "Try a different search term" : "Be the first to upload a video!"}</p>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={v} />)}
          </div>
          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button className="btn btn-gray" onClick={loadMore}>Load More</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="video-grid">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

