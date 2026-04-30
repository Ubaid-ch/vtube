"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo, getInitials } from "@/lib/utils";
import LikeButton from "@/components/LikeButton";

interface Tweet { 
  _id: string; 
  content: string; 
  createdAt: string; 
  owner?: { _id: string; username: string; fullName?: string; avatar?: string; };
}

export default function TweetsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tab, setTab] = useState<"mine" | "feed">("mine");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const endpoint = tab === "mine" ? `/tweets/user/${user._id}` : `/tweets/feed`;
    api.get(endpoint)
      .then((r) => setTweets(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, tab]);

  useEffect(() => {
    if (!authLoading && !user && typeof window !== "undefined") {
       window.location.href = "/login";
    }
  }, [user, authLoading]);

  const postTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const r = await api.post("/tweets", { content });
      setTweets((t) => [r.data.data, ...t]);
      setContent("");
    } catch {}
    setPosting(false);
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/tweets/${id}`, { content: editText });
      setTweets((t) => t.map((tw) => tw._id === id ? { ...tw, content: editText } : tw));
      setEditId(null);
    } catch {}
  };

  const deleteTweet = async (id: string) => {
    try {
      await api.delete(`/tweets/${id}`);
      setTweets((t) => t.filter((tw) => tw._id !== id));
    } catch {}
  };

  return (
    <>
      <div className="page-header">
        <h1>✉️ Tweets</h1>
        <p>Share thoughts with your community</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          <button className={`tab-btn ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>My Tweets</button>
          <button className={`tab-btn ${tab === "feed" ? "active" : ""}`} onClick={() => setTab("feed")}>Subscribed Feed</button>
        </div>

        {/* Compose */}
        {tab === "mine" && (
          <div className="tweet-card" style={{ marginBottom: 24 }}>
            <form onSubmit={postTweet} style={{ display: "flex", gap: 12 }}>
            <div className="comment-avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : getInitials(user?.fullName || "U")}
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                className="form-input form-textarea"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                id="tweet-input"
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <button type="submit" className="btn btn-red btn-sm" disabled={posting || !content.trim()} id="tweet-submit">
                  {posting ? "Posting..." : "Tweet"}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}

        {/* List */}
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading tweets...</p>
        ) : tweets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✉️</div>
            <h3>{tab === "mine" ? "No tweets yet" : "No tweets in your feed"}</h3>
            <p>{tab === "mine" ? "Post your first tweet above" : "Subscribe to channels to see their tweets here"}</p>
          </div>
        ) : (
          tweets.map((t) => {
            const tweetOwner = t.owner || user;
            return (
              <div key={t._id} className="tweet-card">
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="comment-avatar">
                    {tweetOwner?.avatar ? <img src={tweetOwner.avatar} alt="" /> : getInitials(tweetOwner?.fullName || tweetOwner?.username || "U")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                      {tweetOwner?.fullName || tweetOwner?.username} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>• {timeAgo(t.createdAt)}</span>
                    </div>
                    {editId === t._id ? (
                      <div>
                        <textarea className="form-input form-textarea" value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button className="btn btn-red btn-sm" onClick={() => saveEdit(t._id)}>Save</button>
                          <button className="btn btn-gray btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ lineHeight: 1.6 }}>{t.content}</p>
                    )}
                    <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                      <LikeButton entityId={t._id} type="tweet" />
                      {user?._id === tweetOwner?._id && (
                        <>
                          <button className="comment-action-btn" onClick={() => { setEditId(t._id); setEditText(t.content); }}>✏️ Edit</button>
                          <button className="comment-action-btn" onClick={() => deleteTweet(t._id)}>🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
