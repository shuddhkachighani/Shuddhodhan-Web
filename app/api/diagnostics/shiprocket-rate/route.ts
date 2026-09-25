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
 * cases (an Indore-local destination, and a Mumbai out-of-Indore
 * destination at several basket-weight tiers, used to collect real
 * national rates for step 3 of the shipping model — Indore itself is
 * fulfilled by us at a flat locked-in rate, per the current business
 * decision, and is not part of this Shiprocket national-rate exercise).
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
 * Every case's weight is a fixed, already-allowance-adjusted value:
 * shiprocketProvider is not yet wired into lib/shipping/index.ts, where the
 * 15% packing-weight allowance normally gets applied upstream, so these
 * hardcode the post-allowance weight (product weight x 1.15) rather than
 * re-deriving it or letting a caller supply it. The Mumbai tiers below are
 * 1/2/3/5/7.5/10 kg of actual groundnut-oil-1l product weight (1/2/3/5/7.5/10
 * bottles), each x1.15: 1150g/2300g/3450g/5750g/8625g/11500g.
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

function mumbaiCase(cartWeightGrams: number): ShippingQuoteRequest {
  return {
    pincode: "400001",
    cartWeightGrams,
    cartValue: 310,
    lines: [...GROUNDNUT_OIL_1L_LINE],
  };
}

const TEST_CASES: Record<string, ShippingQuoteRequest> = {
  // Case 1 (already live-tested): Indore-local destination. Indore is now
  // fulfilled by us at a flat locked-in rate (not Shiprocket) — kept here
  // only as the original rate-adapter smoke test, not for national-rate
  // collection.
  "452009": {
    pincode: "452009",
    cartWeightGrams: 1150,
    cartValue: 310,
    lines: [...GROUNDNUT_OIL_1L_LINE],
  },
  // Case 2 (already live-tested): out-of-Indore destination (Mumbai) at the
  // 1kg product-weight tier — kept exactly as-is.
  "400001": mumbaiCase(1150),
  // Mumbai national-rate collection: same product/value, increasing
  // basket-weight tiers (2/3/5/7.5/10 kg of product weight, x1.15).
  "400001-2300g": mumbaiCase(2300),
  "400001-3450g": mumbaiCase(3450),
  "400001-5750g": mumbaiCase(5750),
  "400001-8625g": mumbaiCase(8625),
  "400001-11500g": mumbaiCase(11500),
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
