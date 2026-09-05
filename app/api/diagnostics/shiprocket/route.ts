import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { shiprocketAuth, ShiprocketAuthError } from "@/lib/shiprocket/auth";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

/**
 * TEMPORARY, gated diagnostic — not linked from any UI, not called by any
 * other route. Exists only to run one controlled, manual Shiprocket
 * authentication test from the deployed environment. Unlike
 * app/api/diagnostics/env/route.ts (public, config-presence only), this
 * performs a real auth attempt, so it's gated behind a shared secret and
 * returns a generic 404 rather than confirming the endpoint even exists to
 * an unauthorized caller.
 *
 * Calls ONLY shiprocketAuth.getToken() (after clearing the cache, so this
 * is always a fresh attempt, never a cached success). Never calls
 * courier serviceability, order/shipment creation, courier assignment,
 * AWB, or tracking. Never returns or logs the password, email, bearer
 * token, or any raw Shiprocket response/error text — only a small,
 * pre-classified status enum.
 */

type ShiprocketProbeStatus = "ok" | "not_configured" | "auth_failed" | "network_error";

function classifyAuthFailure(err: unknown): {
  status: Exclude<ShiprocketProbeStatus, "ok">;
  httpStatusHint: number | null;
} {
  if (!(err instanceof ShiprocketAuthError)) {
    return { status: "network_error", httpStatusHint: null };
  }

  const message = err.message;
  if (message.startsWith("SHIPROCKET_NOT_CONFIGURED")) {
    return { status: "not_configured", httpStatusHint: null };
  }
  if (message.includes("could not be sent")) {
    return { status: "network_error", httpStatusHint: null };
  }

  // Our own fixed-format message (authored in lib/shiprocket/auth.ts, never
  // the raw Shiprocket response body) — safe to pull a status code out of.
  const statusMatch = message.match(/returned status (\d{3})\./);
  if (statusMatch) {
    return { status: "auth_failed", httpStatusHint: Number(statusMatch[1]) };
  }

  // A response was received but was unusable (bad JSON / missing token) —
  // grouped with auth_failed rather than inventing a fifth status.
  return { status: "auth_failed", httpStatusHint: null };
}

function notFound(): NextResponse {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, "diagnostics-shiprocket", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const expectedKey = process.env.DIAGNOSTICS_ACCESS_KEY;
  const providedKey = req.headers.get("x-diagnostics-key");

  // No access key configured server-side, or the caller didn't present the
  // exact matching key: reject with a generic 404, never a 401/403 (which
  // would confirm the route's existence to an unauthorized caller).
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return notFound();
  }

  const configured = shiprocketAuth.status === "READY";
  if (!configured) {
    return NextResponse.json(
      { configured: false, status: "not_configured" satisfies ShiprocketProbeStatus },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  // Always a fresh attempt — never report a stale cached success/failure.
  shiprocketAuth.clearCachedToken();

  try {
    await shiprocketAuth.getToken();
    return NextResponse.json(
      { configured: true, status: "ok" satisfies ShiprocketProbeStatus },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const { status, httpStatusHint } = classifyAuthFailure(err);
    return NextResponse.json(
      { configured: true, status, ...(httpStatusHint !== null ? { httpStatusHint } : {}) },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
