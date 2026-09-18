import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { siteSettings } from "@/lib/data/settings";
import { isMockAwb } from "@/lib/logistics/mock-provider";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { getOrder, OrderStoreUnavailableError } from "@/lib/orders/store";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

/**
 * TEMPORARY, gated diagnostic — same access-key + rate-limit pattern as the
 * other app/api/diagnostics/* routes, but this one has a real side effect:
 * it can create a real Shiprocket shipment for one specific, already-paid
 * order. Exists solely as a one-time manual trigger for migrating a known
 * MOCKAWB order to real Shiprocket fulfillment before
 * SHIPROCKET_FULFILLMENT_ENABLED is turned on globally (which would
 * otherwise have no way to reach an already-paid order — there is no
 * sweep/cron/startup trigger). Deliberately single-order, not a bulk/sweep
 * endpoint.
 *
 * Safety, in the order checks run:
 *  1. Rate-limited, and more strictly than the read-only diagnostics below
 *     (this one has a billable side effect once the flag is on).
 *  2. Requires DIAGNOSTICS_ACCESS_KEY via the x-diagnostics-key header —
 *     same generic-404-on-failure behavior as the other diagnostics routes,
 *     so an unauthorized caller can't even confirm this route exists.
 *  3. Requires an explicit order_id in the JSON body (never a query param,
 *     so it never ends up in access logs) and fetches that exact order
 *     server-side — this route can never create an order, never touches
 *     payment_status, and never accepts order data from the caller.
 *  4. Refuses unless payment_status === "paid".
 *  5. Refuses if the order already has a genuine (non-MOCKAWB) AWB — a
 *     MOCKAWB value is treated as migratable, exactly like
 *     fulfillPaidOrder()'s own guard.
 *  6. Requires SHIPROCKET_FULFILLMENT_ENABLED=true as a SEPARATE gate from
 *     the access key, checked only once the order is confirmed eligible —
 *     so the access key alone is never sufficient to trigger a real
 *     booking, and this refusal doesn't block checking eligibility.
 *  7. Delegates entirely to the existing fulfillPaidOrder() — the SAME
 *     claim, idempotency, MOCKAWB-migration, and failure-handling logic
 *     the real webhook/verify routes use. No fulfillment logic is
 *     duplicated or reimplemented here.
 *
 * The response never includes customer PII (name/address/phone/email) or
 * any Shiprocket credential/token/raw response — only order_id,
 * shipping_status, carrier, and tracking_number (the AWB itself, which is
 * not sensitive).
 */

function notFound(): NextResponse {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

interface FulfillOrderBody {
  order_id?: unknown;
}

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "diagnostics-fulfill-order", { limit: 3, windowMs: 60_000 });
  if (limited) return limited;

  const expectedKey = process.env.DIAGNOSTICS_ACCESS_KEY;
  const providedKey = req.headers.get("x-diagnostics-key");

  // No access key configured server-side, or the caller didn't present the
  // exact matching key: reject with a generic 404, never a 401/403 (which
  // would confirm the route's existence to an unauthorized caller).
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return notFound();
  }

  let body: FulfillOrderBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const orderId = typeof body.order_id === "string" ? body.order_id.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "order_id is required." }, { status: 400 });
  }

  try {
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    }

    if (order.payment_status !== "paid") {
      return NextResponse.json(
        { ok: false, order_id: order.order_id, error: "Order is not paid." },
        { status: 400 }
      );
    }

    if (order.tracking_number && !isMockAwb(order.tracking_number)) {
      return NextResponse.json(
        {
          ok: false,
          order_id: order.order_id,
          error: "Order already has a real shipment; refusing to process.",
        },
        { status: 409 }
      );
    }

    if (!siteSettings.shipping.shiprocketFulfillmentEnabled) {
      return NextResponse.json(
        {
          ok: false,
          order_id: order.order_id,
          error: "SHIPROCKET_FULFILLMENT_ENABLED is false; refusing to run real fulfillment.",
        },
        { status: 409 }
      );
    }

    try {
      const fulfilled = await fulfillPaidOrder(order);
      return NextResponse.json({
        ok: true,
        order_id: fulfilled.order_id,
        shipping_status: fulfilled.shipping_status,
        carrier: fulfilled.carrier,
        tracking_number: fulfilled.tracking_number,
      });
    } catch (err) {
      console.error("[diagnostics fulfill-order] fulfillment failed", {
        order_id: order.order_id,
        err,
      });
      return NextResponse.json(
        {
          ok: false,
          order_id: order.order_id,
          error: "Fulfillment failed. See server logs for details.",
        },
        { status: 502 }
      );
    }
  } catch (err) {
    if (err instanceof OrderStoreUnavailableError) {
      return NextResponse.json({ error: "Order storage temporarily unavailable." }, { status: 503 });
    }
    throw err;
  }
}
