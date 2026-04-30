"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface LikeButtonProps {
  entityId: string;
  type: "video" | "comment" | "tweet";
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({ entityId, type, initialLiked = false, initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const toggle = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const endpoint =
        type === "video" ? `/likes/toggle/v/${entityId}` :
        type === "comment" ? `/likes/toggle/c/${entityId}` :
        `/likes/toggle/t/${entityId}`;
      await api.post(endpoint);
      setLiked((l) => !l);
      setCount((c) => liked ? c - 1 : c + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={`like-btn ${liked ? "liked" : ""}`} onClick={toggle} disabled={loading} id={`like-btn-${entityId}`}>
      {liked ? "❤️" : "🤍"} {count > 0 ? count : ""}
    </button>
  );
}
