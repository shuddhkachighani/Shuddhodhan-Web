import { isMockAwb } from "@/lib/logistics/mock-provider";
import { logisticsProvider } from "@/lib/logistics";
import {
  claimOrderForFulfillment,
  getOrder,
  releaseFulfillmentClaim,
  updateOrder,
} from "@/lib/orders/store";
import type { Order } from "@/lib/types";

/**
 * Runs once a payment has been verified as "paid" (called from both the
 * checkout-callback verify route and the webhook route — either can be the
 * first to observe a successful payment, and either can retry after a
 * previous attempt failed). Idempotent and safe under concurrent callers:
 * claimOrderForFulfillment() atomically reserves the order first, so
 * logisticsProvider.createShipment() — which can have a real, billable
 * side effect once Shiprocket fulfillment is enabled — is never invoked
 * twice for the same order. Throws if shipment creation fails; callers
 * decide how that should affect their own response (see
 * app/api/payment/verify/route.ts and app/api/payment/webhook/route.ts).
 *
 * A tracking_number from the OLD mock provider (always prefixed MOCKAWB —
 * see lib/logistics/mock-provider.ts) is treated the same as "not yet
 * fulfilled", so an order that was mock-fulfilled before real Shiprocket
 * fulfillment existed gets migrated to a real shipment the first time this
 * runs for it. A real AWB (anything else) still short-circuits immediately
 * — that guard is unchanged and unweakened.
 */
export async function fulfillPaidOrder(order: Order): Promise<Order> {
  if (order.tracking_number && !isMockAwb(order.tracking_number)) return order;

  const claimed = await claimOrderForFulfillment(order.order_id);
  if (!claimed) {
    // Another in-flight call already claimed (or already completed) this
    // order's shipment — never call the logistics provider a second time.
    return (await getOrder(order.order_id)) || order;
  }

  try {
    const shipment = await logisticsProvider.createShipment(order, async (ids) => {
      // Persist Shiprocket's own order/shipment id the moment they exist,
      // before courier selection or AWB assignment run — so if either of
      // those fails, a retry resumes against this same provider order
      // instead of creating a duplicate one (see
      // lib/logistics/shiprocket-provider.ts's resume branch). A failure
      // to persist here is logged, not fatal: it doesn't block this
      // attempt from still completing, it only means a subsequent retry
      // (if this attempt then also fails) won't be able to resume — no
      // worse than before this checkpoint existed.
      try {
        await updateOrder(order.order_id, {
          shiprocket_order_id: ids.providerOrderId,
          shiprocket_shipment_id: ids.providerShipmentId,
        });
      } catch (checkpointErr) {
        console.error(
          "[fulfillment] failed to persist Shiprocket order/shipment id checkpoint — a subsequent retry may create a duplicate Shiprocket order if this attempt does not complete",
          { order_id: order.order_id, err: checkpointErr }
        );
      }
    });
    const updated = await updateOrder(order.order_id, {
      tracking_number: shipment.awb,
      carrier: shipment.carrier,
      shipping_status: "shipment_created",
      shiprocket_order_id: shipment.providerOrderId ?? order.shiprocket_order_id ?? null,
      shiprocket_shipment_id: shipment.providerShipmentId ?? order.shiprocket_shipment_id ?? null,
    });
    return updated || order;
  } catch (err) {
    await releaseFulfillmentClaim(order.order_id, order.tracking_number);
    throw err;
  }
}
