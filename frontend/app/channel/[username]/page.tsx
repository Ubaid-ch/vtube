"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getInitials, timeAgo } from "@/lib/utils";
import VideoCard from "@/components/VideoCard";
import SubscribeButton from "@/components/SubscribeButton";

interface Channel {
  _id: string; username: string; fullName: string; email: string;
  avatar?: string; coverImage?: string;
  subscribersCount: number; channelsSubscribedToCount: number; isSubscribed: boolean;
}
interface Video { _id: string; title: string; thumbnail: string; duration: number; views: number; createdAt: string; owner: { _id: string; username: string; fullName: string; avatar?: string }; }
interface Tweet { _id: string; content: string; createdAt: string; }

export default function ChannelPage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tab, setTab] = useState<"videos" | "tweets">("videos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    api.get(`/users/channel/${username}`)
      .then(async (r) => {
        const ch = r.data.data;
        setChannel(ch);
        const [vr, tr] = await Promise.allSettled([
          api.get("/videos", { params: { userId: ch._id, limit: 20 } }),
          api.get(`/tweets/user/${ch._id}`),
        ]);
        if (vr.status === "fulfilled") setVideos(vr.value.data.data?.docs || vr.value.data.data || []);
        if (tr.status === "fulfilled") setTweets(tr.value.data.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div style={{ padding: 32 }}><div className="skeleton" style={{ height: 180, borderRadius: 12 }} /></div>;
  if (!channel) return <div className="empty-state"><h3>Channel not found</h3></div>;

  return (
    <>
      {/* Cover */}
      {channel.coverImage ? (
        <img src={channel.coverImage} alt="Cover" className="channel-cover" />
      ) : (
        <div className="channel-cover" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)" }} />
      )}

      {/* Info */}
      <div className="channel-info">
        <div className="channel-avatar">
          {channel.avatar ? <img src={channel.avatar} alt={channel.fullName} /> : getInitials(channel.fullName)}
        </div>
        <div style={{ paddingBottom: 8, flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>{channel.fullName}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            @{channel.username} • {channel.subscribersCount} subscribers • {videos.length} videos
          </p>
        </div>
        {user?._id !== channel._id && (
          <div style={{ paddingBottom: 8 }}>
            <SubscribeButton channelId={channel._id} initialSubscribed={channel.isSubscribed} initialCount={channel.subscribersCount} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: 24 }}>
        <button className={`tab-btn ${tab === "videos" ? "active" : ""}`} onClick={() => setTab("videos")}>Videos</button>
        <button className={`tab-btn ${tab === "tweets" ? "active" : ""}`} onClick={() => setTab("tweets")}>Tweets</button>
      </div>

      {tab === "videos" && (
        videos.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📹</div><h3>No videos yet</h3></div>
        ) : (
          <div className="video-grid">
            {videos.map((v) => <VideoCard key={v._id} video={{ ...v, owner: channel }} />)}
          </div>
        )
      )}

      {tab === "tweets" && (
        tweets.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">✉️</div><h3>No tweets yet</h3></div>
        ) : (
          <div style={{ maxWidth: 640 }}>
            {tweets.map((t) => (
              <div key={t._id} className="tweet-card">
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="comment-avatar">
                    {channel.avatar ? <img src={channel.avatar} alt="" /> : getInitials(channel.fullName)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{channel.fullName} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>• {timeAgo(t.createdAt)}</span></div>
                    <p style={{ marginTop: 6, lineHeight: 1.6 }}>{t.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </>
  );
}
