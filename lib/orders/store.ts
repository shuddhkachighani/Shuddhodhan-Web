import type { Order } from "@/lib/types";

/**
 * STATUS: MOCKED — in-memory only, resets on server restart and is not safe
 * across multiple server instances. This stands in for a real database
 * (Postgres/MySQL/etc.) so the checkout → order → payment flow can be built
 * and tested end-to-end. Replace with real persistence before production;
 * the function signatures below are the seam to swap.
 */
const orders = new Map<string, Order>();

export function saveOrder(order: Order): void {
  orders.set(order.order_id, order);
}

export function getOrder(orderId: string): Order | undefined {
  return orders.get(orderId);
}

export function updateOrder(orderId: string, patch: Partial<Order>): Order | undefined {
  const existing = orders.get(orderId);
  if (!existing) return undefined;
  const updated: Order = { ...existing, ...patch, updated_at: new Date().toISOString() };
  orders.set(orderId, updated);
  return updated;
}

export function generateOrderId(): string {
  const date = new Date();
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SHD-${stamp}-${random}`;
}
