"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo, getInitials } from "@/lib/utils";
import LikeButton from "./LikeButton";

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  owner: { _id: string; username: string; fullName: string; avatar?: string };
}

export default function CommentSection({ videoId }: { videoId: string }) {
  const { user, isLoggedIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    api.get(`/comments/${videoId}`).then((r) => {
      setComments(r.data.data?.docs || r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [videoId]);

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      const r = await api.post(`/comments/${videoId}`, { content: text });
      const newComment = r.data.data;
      newComment.owner = { _id: user!._id, username: user!.username, fullName: user!.fullName, avatar: user!.avatar };
      setComments((c) => [newComment, ...c]);
      setText("");
    } catch {}
    setPosting(false);
  };

  const deleteComment = async (id: string) => {
    try {
      await api.delete(`/comments/c/${id}`);
      setComments((c) => c.filter((x) => x._id !== id));
    } catch {}
  };

  const saveEdit = async (id: string) => {
    try {
      await api.patch(`/comments/c/${id}`, { content: editText });
      setComments((c) => c.map((x) => x._id === id ? { ...x, content: editText } : x));
      setEditId(null);
    } catch {}
  };

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
        {comments.length} Comments
      </h3>

      <form onSubmit={postComment} style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <div className="comment-avatar">
          {user?.avatar ? <img src={user.avatar} alt="" /> : getInitials(user?.fullName || "U")}
        </div>
        <div style={{ flex: 1 }}>
          <input
            className="form-input"
            placeholder="Add a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onClick={() => {
              if (!isLoggedIn) {
                window.location.href = "/login";
              }
            }}
            id="comment-input"
          />
          {text && isLoggedIn && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className="btn btn-gray btn-sm" onClick={() => setText("")}>Cancel</button>
              <button type="submit" className="btn btn-red btn-sm" disabled={posting}>
                {posting ? "Posting..." : "Comment"}
              </button>
            </div>
          )}
        </div>
      </form>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading comments...</p>
      ) : comments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No comments yet. Be the first!</p>
        </div>
      ) : (
        comments.map((c) => (
          <div key={c._id} className="comment">
            <div className="comment-avatar">
              {c.owner?.avatar ? <img src={c.owner.avatar} alt="" /> : getInitials(c.owner?.fullName || "U")}
            </div>
            <div className="comment-body">
              <div className="comment-author">
                {c.owner?.fullName}
                <span>{timeAgo(c.createdAt)}</span>
              </div>
              {editId === c._id ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    className="form-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ padding: "6px 10px" }}
                  />
                  <button className="btn btn-red btn-sm" onClick={() => saveEdit(c._id)}>Save</button>
                  <button className="btn btn-gray btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                </div>
              ) : (
                <div className="comment-text">{c.content}</div>
              )}
              <div className="comment-actions">
                <LikeButton entityId={c._id} type="comment" />
                {user?._id === c.owner?._id && (
                  <>
                    <button className="comment-action-btn" onClick={() => { setEditId(c._id); setEditText(c.content); }}>✏️ Edit</button>
                    <button className="comment-action-btn" onClick={() => deleteComment(c._id)}>🗑️ Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
