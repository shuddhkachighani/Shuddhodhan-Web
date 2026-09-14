import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In-memory, per-process fixed-window rate limiter. Appropriate for a
// single-instance deployment (spec: Hostinger phase 1) — state is not
// shared across processes/restarts. If this app is ever run clustered or
// across multiple instances, replace the Map below with a shared store
// (e.g. Redis) behind the same checkRateLimit signature.

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

let opCount = 0;

function sweepExpired(now: number) {
  opCount += 1;
  if (opCount % 500 !== 0) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= options.limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Trusts the first hop of x-forwarded-for, set by the reverse proxy in
// front of this app. Falls back to a shared bucket if unavailable — still
// limits total throughput for that route rather than not limiting at all.
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

const DEFAULT_MESSAGE = "Too many requests. Please wait a moment and try again.";

export function rateLimited(retryAfterSeconds: number, message: string = DEFAULT_MESSAGE): NextResponse {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

// Convenience wrapper for route handlers: returns a 429 NextResponse to
// return immediately, or null if the request is within limits.
export function enforceRateLimit(
  req: NextRequest,
  routeKey: string,
  options: RateLimitOptions,
  message?: string
): NextResponse | null {
  const key = `${routeKey}:${clientIp(req)}`;
  const result = checkRateLimit(key, options);
  if (!result.allowed) {
    return rateLimited(result.retryAfterSeconds, message);
  }
  return null;
}
