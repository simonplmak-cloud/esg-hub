const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 50;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

function extractIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Cloudflare
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return "unknown";
}

export function checkRateLimit(request: Request): {
  rateLimited: boolean;
  remaining: number;
} {
  const ip = extractIp(request);
  const now = Date.now();

  let bucket = store.get(ip);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
  }

  bucket.count++;

  if (bucket.count <= MAX_REQUESTS && bucket.count === 1) {
    store.set(ip, bucket);
  }

  const rateLimited = bucket.count > MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - bucket.count);

  return { rateLimited, remaining };
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, bucket] of store) {
      if (now > bucket.resetAt) {
        store.delete(ip);
      }
    }
  }, CLEANUP_INTERVAL_MS);
}
