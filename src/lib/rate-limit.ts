/**
 * Best-effort in-memory rate limiter for public, unauthenticated API routes.
 *
 * Limitation: this state lives in a single server instance's memory. On
 * serverless/multi-instance deployments it does not share counts across
 * instances, so it won't stop a determined/distributed abuser — it's a cheap
 * first line of defense against accidental loops and casual abuse, not a
 * substitute for a real rate-limiting service (e.g. Upstash) if this ever
 * needs to be bulletproof.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
