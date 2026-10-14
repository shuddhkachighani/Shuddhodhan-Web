import type { Order } from "@/lib/types";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server-client";
import { MOCK_AWB_PREFIX, isMockAwb } from "@/lib/logistics/mock-provider";

/**
 * Order persistence. Backed by a real Postgres table (Supabase) once
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured — see
 * the `create_orders_table` migration for schema/RLS. Falls back to an
 * in-memory Map when those aren't set, purely so the checkout flow still
 * runs end-to-end in local dev/test. That fallback resets on restart and is
 * refused outright in production (see isProductionRuntime below) rather
 * than silently degrading — a paid order must always land in durable
 * storage or the request fails loudly.
 */
const memoryOrders = new Map<string, Order>();

// Sentinel written into tracking_number to atomically "claim" an order for
// shipment creation (see claimOrderForFulfillment below). A real logistics
// provider's createShipment() can have a billable, hard-to-reverse side
// effect (booking a real courier), and fulfillPaidOrder() can be invoked
// concurrently from both the webhook and the verify route for the same
// order — so claiming must happen as a single conditional write (WHERE
// tracking_number is unclaimed), not a read-then-write, or two concurrent
// callers could both pass the check and both book a shipment. "Unclaimed"
// means either NULL (never fulfilled) or a legacy MOCKAWB value (fulfilled
// by the old mock provider, before real fulfillment existed, and eligible
// to be migrated to a real shipment) — see isMockAwb.
//
// Purely an internal implementation detail: hideClaimSentinel() strips it
// out of every order this module hands back, so no caller ever has to know
// it exists or treat it as a real (if odd) tracking number.
const FULFILLMENT_CLAIM_SENTINEL = "CLAIMED_PENDING_SHIPMENT";

function hideClaimSentinel(order: Order): Order {
  return order.tracking_number === FULFILLMENT_CLAIM_SENTINEL
    ? { ...order, tracking_number: null }
    : order;
}

// Thrown whenever durable order storage cannot be relied on — either
// Supabase isn't configured for this environment, or it is configured but
// a read/write to it just failed (outage, network error, RLS/auth
// misconfiguration, etc.). Routes catch this one type to return a clean,
// generic 503 without ever surfacing the underlying Supabase error to the
// client; the original error is kept as `cause` for server-side debugging.
export class OrderStoreUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Durable order storage is unavailable.", cause !== undefined ? { cause } : undefined);
    this.name = "OrderStoreUnavailableError";
  }
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function assertStoreUsable(): void {
  if (!isSupabaseConfigured() && isProductionRuntime()) {
    throw new OrderStoreUnavailableError();
  }
}

export async function saveOrder(order: Order): Promise<void> {
  assertStoreUsable();
  if (!isSupabaseConfigured()) {
    memoryOrders.set(order.order_id, order);
    return;
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").upsert(toRow(order));
  if (error) throw new OrderStoreUnavailableError(error);
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  assertStoreUsable();
  if (!isSupabaseConfigured()) {
    const existing = memoryOrders.get(orderId);
    return existing ? hideClaimSentinel(existing) : undefined;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new OrderStoreUnavailableError(error);
  return data ? hideClaimSentinel(fromRow(data)) : undefined;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<Order>
): Promise<Order | undefined> {
  assertStoreUsable();
  if (!isSupabaseConfigured()) {
    const existing = memoryOrders.get(orderId);
    if (!existing) return undefined;
    const updated: Order = { ...existing, ...patch, updated_at: new Date().toISOString() };
    memoryOrders.set(orderId, updated);
    return hideClaimSentinel(updated);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .update(toRow(patch as Order, true))
    .eq("order_id", orderId)
    .select("*")
    .maybeSingle();

  if (error) throw new OrderStoreUnavailableError(error);
  return data ? hideClaimSentinel(fromRow(data)) : undefined;
}

/**
 * Atomically reserves `orderId` for shipment creation. Returns the order
 * (with tracking_number now holding a sentinel) if this call won the claim,
 * or undefined if another call already claimed it (in progress) or a real
 * shipment already exists (tracking_number set to a real, non-mock AWB).
 *
 * Eligible-to-claim is NULL *or* a legacy MOCKAWB value — narrowly scoped
 * to that one recognizable prefix, so this never reclaims a real AWB. That
 * lets an order fulfilled by the old mock provider (before real Shiprocket
 * fulfillment existed) be migrated to a real shipment through the exact
 * same claim/release machinery as a brand-new order, instead of being
 * permanently stuck "already shipped".
 */
export async function claimOrderForFulfillment(orderId: string): Promise<Order | undefined> {
  assertStoreUsable();
  if (!isSupabaseConfigured()) {
    // No `await` between the check and the set below, so this is safe under
    // Node's single-threaded event loop even with concurrent callers.
    const existing = memoryOrders.get(orderId);
    if (!existing) return undefined;
    if (existing.tracking_number && !isMockAwb(existing.tracking_number)) return undefined;
    const claimed: Order = {
      ...existing,
      tracking_number: FULFILLMENT_CLAIM_SENTINEL,
      updated_at: new Date().toISOString(),
    };
    memoryOrders.set(orderId, claimed);
    // The caller (fulfillPaidOrder) only ever checks truthiness of this
    // return value — it never reads its fields — but hide the sentinel
    // anyway so no order this module hands back, ever, carries it.
    return hideClaimSentinel(claimed);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ tracking_number: FULFILLMENT_CLAIM_SENTINEL })
    .eq("order_id", orderId)
    .or(`tracking_number.is.null,tracking_number.like.${MOCK_AWB_PREFIX}%`)
    .select("*")
    .maybeSingle();

  if (error) throw new OrderStoreUnavailableError(error);
  return data ? hideClaimSentinel(fromRow(data)) : undefined;
}

/**
 * Releases a claim taken by claimOrderForFulfillment() after a failed
 * shipment-creation attempt, so a later retry can claim the order again.
 * Restores `restoreTrackingNumber` — the order's tracking_number as it was
 * immediately before the claim (null for a fresh order, or the legacy
 * MOCKAWB value being migrated) — rather than unconditionally clearing it,
 * so a failed migration attempt leaves a legacy mock order exactly as it
 * was rather than corrupting it to a bare null. Only ever touches a row
 * still holding our own sentinel — never a real AWB written by a
 * meanwhile-successful attempt.
 */
export async function releaseFulfillmentClaim(
  orderId: string,
  restoreTrackingNumber: string | null
): Promise<void> {
  assertStoreUsable();
  if (!isSupabaseConfigured()) {
    const existing = memoryOrders.get(orderId);
    if (existing?.tracking_number === FULFILLMENT_CLAIM_SENTINEL) {
      memoryOrders.set(orderId, {
        ...existing,
        tracking_number: restoreTrackingNumber,
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ tracking_number: restoreTrackingNumber })
    .eq("order_id", orderId)
    .eq("tracking_number", FULFILLMENT_CLAIM_SENTINEL);

  if (error) throw new OrderStoreUnavailableError(error);
}

export function generateOrderId(): string {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SHD-${stamp}-${random}`;
}

// --- row <-> Order mapping -------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRow(order: Order, partial = false): Record<string, any> {
  const row: Record<string, unknown> = {};
  if (!partial || order.order_id !== undefined) row.order_id = order.order_id;
  if (!partial || order.customer !== undefined) row.customer = order.customer;
  if (!partial || order.items !== undefined) row.items = order.items;
  if (!partial || order.subtotal !== undefined) row.subtotal = order.subtotal;
  if (!partial || order.shipping_amount !== undefined)
    row.shipping_amount = order.shipping_amount;
  if (!partial || order.payment_fee !== undefined) row.payment_fee = order.payment_fee;
  if (!partial || order.taxes !== undefined) row.taxes = order.taxes;
  if (!partial || order.discounts !== undefined) row.discounts = order.discounts;
  if (!partial || order.grand_total !== undefined) row.grand_total = order.grand_total;
  if (!partial || order.payment_status !== undefined)
    row.payment_status = order.payment_status;
  if (!partial || order.shipping_status !== undefined)
    row.shipping_status = order.shipping_status;
  if (!partial || order.tracking_number !== undefined)
    row.tracking_number = order.tracking_number;
  if (!partial || order.carrier !== undefined) row.carrier = order.carrier;
  if (!partial || order.shiprocket_order_id !== undefined)
    row.shiprocket_order_id = order.shiprocket_order_id;
  if (!partial || order.shiprocket_shipment_id !== undefined)
    row.shiprocket_shipment_id = order.shiprocket_shipment_id;
  if (!partial || order.utm_data !== undefined) row.utm_data = order.utm_data;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Order {
  return {
    order_id: row.order_id,
    customer: row.customer,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping_amount: Number(row.shipping_amount),
    payment_fee: Number(row.payment_fee),
    taxes: Number(row.taxes),
    discounts: Number(row.discounts),
    grand_total: Number(row.grand_total),
    payment_status: row.payment_status,
    shipping_status: row.shipping_status,
    tracking_number: row.tracking_number,
    carrier: row.carrier,
    shiprocket_order_id: row.shiprocket_order_id ?? null,
    shiprocket_shipment_id: row.shiprocket_shipment_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    utm_data: row.utm_data || {},
  };
}
