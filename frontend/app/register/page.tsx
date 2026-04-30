"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatar(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatar) { setError("Avatar is required"); return; }
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("username", form.username);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("avatar", avatar);
      if (coverImage) fd.append("coverImage", coverImage);
      await api.post("/users/register", fd, { headers: { "Content-Type": "multipart/form-data" } });
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-logo">V<span>Tube</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join VTube today</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          {/* Avatar preview */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <label htmlFor="avatar-input" style={{ cursor: "pointer" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg-hover)", border: "2px dashed var(--border)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                {avatarPreview ? <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📷"}
              </div>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Upload avatar *</p>
            </label>
            <input id="avatar-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">Full Name</label>
            <input id="reg-fullname" name="fullName" className="form-input" placeholder="John Doe" value={form.fullName} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" className="form-input" placeholder="johndoe" value={form.username} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <input id="reg-email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={handle} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="cover-input">Cover Image (optional)</label>
            <input id="cover-input" type="file" accept="image/*" className="form-input form-file" onChange={(e) => setCoverImage(e.target.files?.[0] || null)} />
          </div>

          <button
            id="register-submit" type="submit"
            className="btn btn-red" style={{ width: "100%", justifyContent: "center", borderRadius: 10, padding: "14px" }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
