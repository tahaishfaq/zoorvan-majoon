export default function Loading() {
  return (
    <div className="container section" aria-label="Loading page">
      <div
        className="skeleton"
        style={{ height: 48, width: "55%", marginBottom: 24 }}
      />
      <div className="skeleton" style={{ height: 320 }} />
    </div>
  );
}
