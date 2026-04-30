export default function SkeletonCard() {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden" }}>
      <div className="skeleton" style={{ aspectRatio: "16/9", width: "100%" }} />
      <div style={{ padding: "12px 4px", display: "flex", gap: 12 }}>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, borderRadius: 4, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, borderRadius: 4, width: "60%", marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, borderRadius: 4, width: "40%" }} />
        </div>
      </div>
    </div>
  );
}
