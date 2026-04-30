"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SubscribeButtonProps {
  channelId: string;
  initialSubscribed?: boolean;
  initialCount?: number;
}

export default function SubscribeButton({ channelId, initialSubscribed = false, initialCount = 0 }: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
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
      await api.post(`/subscriptions/c/${channelId}`);
      setSubscribed((s) => !s);
      setCount((c) => subscribed ? c - 1 : c + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button
        className={`btn ${subscribed ? "btn-subscribed" : "btn-red"}`}
        onClick={toggle}
        disabled={loading}
        id={`subscribe-btn-${channelId}`}
      >
        {loading ? "..." : subscribed ? "Unsubscribe" : "Subscribe"}
      </button>
      <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
        {count.toLocaleString()} subscribers
      </span>
    </div>
  );
}
