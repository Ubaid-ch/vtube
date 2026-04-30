"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const items = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/liked", icon: "❤️", label: "Liked Videos" },
  { href: "/playlists", icon: "📋", label: "Playlists" },
  { href: "/tweets", icon: "✉️", label: "Tweets" },
];

const creatorItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/upload", icon: "📤", label: "Upload Video" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isLoggedIn, user } = useAuth();

  return (
    <aside className="sidebar">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`sidebar-item ${pathname === item.href ? "active" : ""}`}
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}

      {isLoggedIn && (
        <>
          <hr className="sidebar-divider" />
          <div className="sidebar-section">Creator</div>
          {creatorItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${pathname === item.href ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <hr className="sidebar-divider" />
          <div className="sidebar-section">You</div>
          {user && (
            <Link
              href={`/channel/${user.username}`}
              className={`sidebar-item ${pathname === `/channel/${user.username}` ? "active" : ""}`}
            >
              <span className="sidebar-icon">📺</span>
              <span>Your Channel</span>
            </Link>
          )}
          <Link
            href="/profile"
            className={`sidebar-item ${pathname === "/profile" ? "active" : ""}`}
          >
            <span className="sidebar-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </>
      )}
    </aside>
  );
}
