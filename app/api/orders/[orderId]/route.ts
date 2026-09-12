import { NextRequest, NextResponse } from "next/server";
import { getOrder, OrderStoreUnavailableError } from "@/lib/orders/store";
import { normalizeMobile, isValidNormalizedMobile } from "@/lib/phone";
import { enforceRateLimit } from "@/lib/rate-limit";

const NOT_FOUND_MESSAGE = "Order not found.";
const ORDER_STORE_UNAVAILABLE_MESSAGE =
  "Order lookup is temporarily unavailable. Please try again shortly.";

// Order lookup requires the customer's mobile number as a second factor,
// sent via the X-Order-Mobile header (never a query param, so it never ends
// up in the URL, browser history, or referer headers) — knowing/guessing an
// order_id alone is not enough to read another customer's order. A missing
// or mismatched mobile number returns the same 404 as an unknown order_id,
// so the response never confirms whether a given order_id exists. Direct
// access to the `orders` table remains blocked by Supabase RLS regardless
// (only the server-only service_role key in lib/orders/store.ts can read
// it) — this check is an additional application-layer control, not a
// replacement for it.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const limited = enforceRateLimit(req, "orders-lookup", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const { orderId } = await params;
  const suppliedMobile = normalizeMobile(req.headers.get("x-order-mobile") || "");
  if (!isValidNormalizedMobile(suppliedMobile)) {
    return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
  }

  try {
    const order = await getOrder(orderId);
    if (!order || normalizeMobile(order.customer.mobile) !== suppliedMobile) {
      return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    if (err instanceof OrderStoreUnavailableError) {
      return NextResponse.json({ error: ORDER_STORE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    throw err;
  }
}
