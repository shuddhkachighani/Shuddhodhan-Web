import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { shiprocketProvider } from "@/lib/shipping/shiprocket-provider";
import type { ShippingQuoteRequest } from "@/lib/types";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

/**
 * TEMPORARY, gated diagnostic — not linked from any UI, not called by any
 * other route, not wired into lib/shipping/index.ts. Same access-key +
 * rate-limit gating pattern as app/api/diagnostics/shiprocket/route.ts
 * (auth-only probe), but this one runs a controlled Shiprocket courier
 * serviceability/rate test against one of a small, fixed set of test
 * cases (an Indore-local destination and an out-of-Indore destination).
 *
 * Makes exactly one call per request: shiprocketProvider.getQuote(...) with
 * one of the whitelisted TEST_CASES below. That provider
 * (lib/shipping/shiprocket-provider.ts) only ever issues a GET to
 * Shiprocket's /courier/serviceability/ endpoint — there is no order,
 * shipment, AWB, pickup, or tracking call anywhere in that file, so this
 * diagnostic cannot create anything billable or trackable on Shiprocket's
 * side. It also never touches lib/shipping/index.ts (the live Indore/mock
 * routing) or checkout.
 *
 * The caller selects a case via ?case=<key>, but can only pick among the
 * fixed, hardcoded request objects below — pincode, weight, and value are
 * never taken from caller input, so this can't be repurposed into an
 * arbitrary-address rate lookup.
 *
 * The fixed test weight (1150g) is deliberate in every case: shiprocketProvider
 * is not yet wired into lib/shipping/index.ts, where the 15% packing-weight
 * allowance normally gets applied upstream, so this hardcodes the
 * already-allowance-adjusted weight (1000g groundnut-oil-1l x 1.15) rather
 * than re-deriving it or letting a caller supply it.
 *
 * Never returns or logs the bearer token, credentials, or a raw
 * Authorization header — shiprocketProvider.getQuote() already returns
 * only the sanitized ShippingQuoteResponse contract (fixed, pre-authored
 * reason strings on failure, never a raw Shiprocket response body), so
 * this route passes that result through as-is.
 */

const GROUNDNUT_OIL_1L_LINE = [
  { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 },
] as const;

const TEST_CASES: Record<string, ShippingQuoteRequest> = {
  // Case 1 (already live-tested): Indore-local destination.
  "452009": {
    pincode: "452009",
    cartWeightGrams: 1150,
    cartValue: 310,
    lines: [...GROUNDNUT_OIL_1L_LINE],
  },
  // Case 2: out-of-Indore destination (Mumbai), same product/weight/value —
  // isolates whether serviceability/rate differs by distance/zone alone.
  "400001": {
    pincode: "400001",
    cartWeightGrams: 1150,
    cartValue: 310,
    lines: [...GROUNDNUT_OIL_1L_LINE],
  },
};

const DEFAULT_TEST_CASE = "452009";

function notFound(): NextResponse {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, "diagnostics-shiprocket-rate", { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  const expectedKey = process.env.DIAGNOSTICS_ACCESS_KEY;
  const providedKey = req.headers.get("x-diagnostics-key");

  // No access key configured server-side, or the caller didn't present the
  // exact matching key: reject with a generic 404, never a 401/403 (which
  // would confirm the route's existence to an unauthorized caller).
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return notFound();
  }

  const requestedCase = req.nextUrl.searchParams.get("case") || DEFAULT_TEST_CASE;
  const testRequest = Object.prototype.hasOwnProperty.call(TEST_CASES, requestedCase)
    ? TEST_CASES[requestedCase]
    : undefined;

  if (!testRequest) {
    return NextResponse.json(
      { error: "Unknown test case.", knownCases: Object.keys(TEST_CASES) },
      { status: 400 }
    );
  }

  const configured = shiprocketProvider.status === "READY";
  const quote = await shiprocketProvider.getQuote(testRequest);

  return NextResponse.json(
    {
      testCase: requestedCase,
      configured,
      quote: {
        serviceable: quote.serviceable,
        shipping_amount: quote.shipping_amount,
        estimated_delivery: quote.estimated_delivery,
        carrier: quote.carrier,
        service: quote.service,
        weight_used_grams: quote.weight_used_grams,
        zone: quote.zone,
        reason: quote.reason ?? null,
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
