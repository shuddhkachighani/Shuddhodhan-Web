import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { shiprocketProvider } from "@/lib/shipping/shiprocket-provider";
import type { ShippingQuoteRequest } from "@/lib/types";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

/**
 * TEMPORARY, gated diagnostic — not linked from any UI, not called by any
 * other route, not wired into lib/shipping/index.ts. Same access-key +
 * rate-limit gating pattern as app/api/diagnostics/shiprocket/route.ts
 * (auth-only probe), but this one runs the FIRST controlled Shiprocket
 * courier serviceability/rate test.
 *
 * Makes exactly one call: shiprocketProvider.getQuote(TEST_REQUEST). That
 * provider (lib/shipping/shiprocket-provider.ts) only ever issues a GET to
 * Shiprocket's /courier/serviceability/ endpoint — there is no order,
 * shipment, AWB, pickup, or tracking call anywhere in that file, so this
 * diagnostic cannot create anything billable or trackable on Shiprocket's
 * side. It also never touches lib/shipping/index.ts (the live Indore/mock
 * routing) or checkout.
 *
 * The fixed test weight (1150g) is deliberate: shiprocketProvider is not
 * yet wired into lib/shipping/index.ts, where the 15% packing-weight
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

const TEST_REQUEST: ShippingQuoteRequest = {
  pincode: "452009",
  cartWeightGrams: 1150,
  cartValue: 310,
  lines: [{ productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 }],
};

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

  const configured = shiprocketProvider.status === "READY";
  const quote = await shiprocketProvider.getQuote(TEST_REQUEST);

  return NextResponse.json(
    {
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
