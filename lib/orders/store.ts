import type { Order } from "@/lib/types";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server-client";

/**
 * Order persistence. Backed by a real Postgres table (Supabase) once
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are configured — see
 * the `create_orders_table` migration for schema/RLS. Falls back to an
 * in-memory Map otherwise, purely so the checkout flow still runs end-to-end
 * in local/dev environments without those secrets. The in-memory fallback
 * resets on restart and is NOT safe for production — status: MOCKED.
 */
const memoryOrders = new Map<string, Order>();

export async function saveOrder(order: Order): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryOrders.set(order.order_id, order);
    return;
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("orders").upsert(toRow(order));
  if (error) throw new Error(`Failed to save order: ${error.message}`);
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  if (!isSupabaseConfigured()) {
    return memoryOrders.get(orderId);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch order: ${error.message}`);
  return data ? fromRow(data) : undefined;
}

export async function updateOrder(
  orderId: string,
  patch: Partial<Order>
): Promise<Order | undefined> {
  if (!isSupabaseConfigured()) {
    const existing = memoryOrders.get(orderId);
    if (!existing) return undefined;
    const updated: Order = { ...existing, ...patch, updated_at: new Date().toISOString() };
    memoryOrders.set(orderId, updated);
    return updated;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .update(toRow(patch as Order, true))
    .eq("order_id", orderId)
    .select("*")
    .maybeSingle();

  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return data ? fromRow(data) : undefined;
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
    created_at: row.created_at,
    updated_at: row.updated_at,
    utm_data: row.utm_data || {},
  };
}
