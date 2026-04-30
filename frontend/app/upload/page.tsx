"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnail(file);
    if (file) setThumbPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) { setError("Video file is required"); return; }
    if (!thumbnail) { setError("Thumbnail is required"); return; }
    setError(""); setLoading(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("videoFile", videoFile);
      fd.append("thumbnail", thumbnail);
      await api.post("/videos", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100)),
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Upload Video</h1>
        <p>Share your content with the world</p>
      </div>

      <div style={{ maxWidth: 640 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          {/* Thumbnail */}
          <div className="form-group">
            <label className="form-label">Thumbnail *</label>
            <label htmlFor="thumb-input" style={{ cursor: "pointer", display: "block" }}>
              <div className="upload-dropzone" style={{ padding: thumbPreview ? 0 : 48 }}>
                {thumbPreview ? (
                  <img src={thumbPreview} alt="Thumbnail preview" style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 10 }} />
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                    <p style={{ color: "var(--text-secondary)" }}>Click to upload thumbnail</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>PNG, JPG, WEBP</p>
                  </>
                )}
              </div>
            </label>
            <input id="thumb-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumb} required />
          </div>

          {/* Video file */}
          <div className="form-group">
            <label className="form-label" htmlFor="video-input">Video File *</label>
            <label htmlFor="video-input" style={{ cursor: "pointer", display: "block" }}>
              <div className="upload-dropzone">
                {videoFile ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
                    <p style={{ fontWeight: 600 }}>{videoFile.name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                      {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📹</div>
                    <p style={{ color: "var(--text-secondary)" }}>Click to upload video</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>MP4, WEBM, MOV</p>
                  </>
                )}
              </div>
            </label>
            <input id="video-input" type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-title">Title *</label>
            <input id="upload-title" name="title" className="form-input" placeholder="Give your video a title" value={form.title} onChange={handle} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="upload-desc">Description *</label>
            <textarea id="upload-desc" name="description" className="form-input form-textarea" placeholder="Tell viewers about your video" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))} required />
          </div>

          {loading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div style={{ height: 6, background: "var(--bg-hover)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--red)", transition: "width 0.3s", borderRadius: 3 }} />
              </div>
            </div>
          )}

          <button id="upload-submit" type="submit" className="btn btn-red" style={{ width: "100%", justifyContent: "center", borderRadius: 10, padding: 14 }} disabled={loading}>
            {loading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      </div>
    </>
  );
}
