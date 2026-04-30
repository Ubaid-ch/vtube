"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"account" | "password" | "avatar">("account");
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName, email: user.email });
  }, [user]);

  const flash = (m: string, isErr = false) => {
    if (isErr) setErr(m); else setMsg(m);
    setTimeout(() => { setMsg(""); setErr(""); }, 3000);
  };

  const updateAccount = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.patch("/users/update-account", form);
      await refreshUser();
      flash("Profile updated successfully!");
    } catch (err: unknown) {
      flash((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Update failed", true);
    } finally { setLoading(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post("/users/change-password", pwForm);
      setPwForm({ oldPassword: "", newPassword: "" });
      flash("Password changed successfully!");
    } catch (err: unknown) {
      flash((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Password change failed", true);
    } finally { setLoading(false); }
  };

  const updateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatar) return;
    setLoading(true);
    try {
      const fd = new FormData(); fd.append("avatar", avatar);
      await api.patch("/users/avatar", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      flash("Avatar updated!");
    } catch (err: unknown) {
      flash((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed", true);
    } finally { setLoading(false); }
  };

  const updateCover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover) return;
    setLoading(true);
    try {
      const fd = new FormData(); fd.append("coverImage", cover);
      await api.patch("/users/cover-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      flash("Cover image updated!");
    } catch (err: unknown) {
      flash((err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed", true);
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1>⚙️ Profile Settings</h1>
      </div>

      {/* User card */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 28, maxWidth: 580 }}>
        <div className="channel-avatar" style={{ width: 60, height: 60, fontSize: 22 }}>
          {user?.avatar ? <img src={user.avatar} alt="" /> : getInitials(user?.fullName || "U")}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.fullName}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>@{user?.username} • {user?.email}</div>
        </div>
      </div>

      {msg && <div className="alert alert-success" style={{ maxWidth: 580 }}>{msg}</div>}
      {err && <div className="alert alert-error" style={{ maxWidth: 580 }}>{err}</div>}

      <div className="tabs">
        <button className={`tab-btn ${tab === "account" ? "active" : ""}`} onClick={() => setTab("account")}>Account</button>
        <button className={`tab-btn ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>Password</button>
        <button className={`tab-btn ${tab === "avatar" ? "active" : ""}`} onClick={() => setTab("avatar")}>Images</button>
      </div>

      <div style={{ maxWidth: 480 }}>
        {tab === "account" && (
          <form onSubmit={updateAccount}>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-fullname">Full Name</label>
              <input id="prof-fullname" className="form-input" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prof-email">Email</label>
              <input id="prof-email" type="email" className="form-input" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-red" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
          </form>
        )}

        {tab === "password" && (
          <form onSubmit={changePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="old-pw">Current Password</label>
              <input id="old-pw" type="password" className="form-input" value={pwForm.oldPassword} onChange={(e) => setPwForm((f) => ({ ...f, oldPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pw">New Password</label>
              <input id="new-pw" type="password" className="form-input" value={pwForm.newPassword} onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-red" disabled={loading}>{loading ? "Changing..." : "Change Password"}</button>
          </form>
        )}

        {tab === "avatar" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <form onSubmit={updateAvatar}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Avatar</h3>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
                <div className="channel-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
                  {avatarPreview ? <img src={avatarPreview} alt="" /> : user?.avatar ? <img src={user.avatar} alt="" /> : getInitials(user?.fullName || "U")}
                </div>
                <label htmlFor="new-avatar" className="btn btn-outline" style={{ cursor: "pointer" }}>Choose Image</label>
                <input id="new-avatar" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0] || null; setAvatar(f); if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
              </div>
              <button type="submit" className="btn btn-red btn-sm" disabled={!avatar || loading}>Update Avatar</button>
            </form>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

            <form onSubmit={updateCover}>
              <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Cover Image</h3>
              <div className="form-group">
                <input id="new-cover" type="file" accept="image/*" className="form-input form-file" onChange={(e) => setCover(e.target.files?.[0] || null)} />
              </div>
              <button type="submit" className="btn btn-red btn-sm" disabled={!cover || loading}>Update Cover</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
