const buckets = globalThis.zoorvanLimits || new Map();
globalThis.zoorvanLimits = buckets;
export function rateLimit(key, limit = 15, window = 60000) {
  const now = Date.now();
  if (buckets.size > 10000)
    for (const [k, v] of buckets) if (v.until < now) buckets.delete(k);
  const current = buckets.get(key);
  if (!current || current.until < now) {
    buckets.set(key, { count: 1, until: now + window });
    return true;
  }
  current.count++;
  return current.count <= limit;
}
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    const host = request.headers.get("host") || new URL(request.url).host;
    return (
      ["http:", "https:"].includes(parsed.protocol) && parsed.host === host
    );
  } catch {
    return false;
  }
}
export function errorResponse(error) {
  if (error.name === "ValidationError")
    return Response.json({ error: error.errors.join(" ") }, { status: 400 });
  console.error(error);
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
