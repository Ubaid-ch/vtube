"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/?q=${encodeURIComponent(query.trim())}`);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        V<span>Tube</span>
      </Link>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          aria-label="Search"
        />
        <button type="submit" aria-label="Submit search">🔍</button>
      </form>

      <div className="navbar-right">
        {isLoggedIn ? (
          <>
            <Link href="/upload" className="btn btn-gray btn-sm" style={{ borderRadius: "20px" }}>
              ＋ Upload
            </Link>
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                className="avatar-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                aria-label="User menu"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : (
                  getInitials(user?.fullName || "U")
                )}
              </button>
              {dropdownOpen && (
                <div className="dropdown">
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.fullName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{user?.username}</div>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}>👤 Your Profile</Link>
                  <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>📊 Dashboard</Link>
                  <Link href="/liked" onClick={() => setDropdownOpen(false)}>❤️ Liked Videos</Link>
                  <hr className="dropdown-divider" />
                  <button onClick={logout}>🚪 Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline btn-sm">Sign in</Link>
            <Link href="/register" className="btn btn-red btn-sm">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
