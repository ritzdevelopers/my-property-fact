export default function DashboardLoading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "520px",
        gap: "1rem",
      }}
    >
      <div className="dot-pulse-loader" aria-label="Loading…" role="status">
        <span className="dot-pulse-loader__dot" />
        <span className="dot-pulse-loader__dot" />
        <span className="dot-pulse-loader__dot" />
      </div>
      <p className="dot-pulse-loader__label">Loading…</p>
    </div>
  );
}