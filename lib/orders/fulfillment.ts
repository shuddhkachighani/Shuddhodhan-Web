import { logisticsProvider } from "@/lib/logistics";
import { updateOrder } from "@/lib/orders/store";
import type { Order } from "@/lib/types";

/**
 * Runs once a payment has been verified as "paid" (called from both the
 * checkout-callback verify route and the webhook route — either can be the
 * first to observe a successful payment). Idempotent: does nothing if a
 * shipment already exists for this order, so it's safe to call from both.
 */
export async function fulfillPaidOrder(order: Order): Promise<Order> {
  if (order.tracking_number) return order;

  const shipment = await logisticsProvider.createShipment(order);
  const updated = await updateOrder(order.order_id, {
    tracking_number: shipment.awb,
    carrier: shipment.carrier,
    shipping_status: "shipment_created",
  });
  return updated || order;
}
