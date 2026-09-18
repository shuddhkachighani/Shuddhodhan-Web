import { NextRequest, NextResponse } from "next/server";
import { razorpayProvider } from "@/lib/payment/razorpay-provider";
import { getOrder, updateOrder, OrderStoreUnavailableError } from "@/lib/orders/store";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { sendPurchaseCapiEvent } from "@/lib/analytics/meta-capi";

// Server-to-server webhook — the only place an order is ever marked "paid".
// A frontend payment-success callback is never trusted on its own (spec
// section 27): the signature here is verified against RAZORPAY_WEBHOOK_SECRET
// before any order status changes. Deliberately NOT IP-rate-limited —
// Razorpay's own servers call this, and throttling by IP would risk
// dropping legitimate webhook retries.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!razorpayProvider.verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event as string;
  const orderId: string | undefined =
    payload?.payload?.payment?.entity?.notes?.order_id;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id in webhook notes." }, { status: 400 });
  }

  try {
    const existingOrder = await getOrder(orderId);
    if (!existingOrder) {
      return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    }

    if (event === "payment.captured") {
      // Idempotency: only the transition into "paid" runs the CAPI purchase
      // event and (re-)marks payment status — a duplicate delivery for an
      // already-paid order is a no-op on that front. But it must NOT be a
      // no-op on fulfillment: if a previous delivery marked the order paid
      // and then shipment creation failed, this order still has no
      // tracking_number, and this retry is exactly the mechanism that's
      // supposed to finish the job (see the non-2xx return below).
      const alreadyPaid = existingOrder.payment_status === "paid";
      let workingOrder = existingOrder;

      if (!alreadyPaid) {
        workingOrder =
          (await updateOrder(orderId, {
            payment_status: "paid",
            shipping_status: "processing",
          })) || existingOrder;
      }

      if (!workingOrder.tracking_number) {
        try {
          const fulfilled = await fulfillPaidOrder(workingOrder);
          if (!alreadyPaid) {
            // Only fire purchase attribution on the actual paid transition —
            // never re-fire it on a retry that's just catching up a
            // previously-failed shipment creation.
            await sendPurchaseCapiEvent(fulfilled, req);
          }
        } catch (err) {
          console.error(
            "[payment webhook] fulfillment failed; order stays paid, Razorpay should retry this delivery",
            {
              order_id: orderId,
              errName: err instanceof Error ? err.name : typeof err,
              errMessage: err instanceof Error ? err.message : String(err),
            }
          );
          // Non-2xx: payment stays recorded as "paid" (never rolled back),
          // but this tells Razorpay the delivery failed so it retries later
          // — the retry re-enters this branch, finds tracking_number still
          // null, and attempts fulfillment again (idempotent via
          // claimOrderForFulfillment in lib/orders/fulfillment.ts).
          return NextResponse.json(
            { error: "Order recorded as paid, but shipment creation failed. Will retry." },
            { status: 502 }
          );
        }
      }

      return NextResponse.json({ ok: true, deduped: alreadyPaid });
    } else if (event === "payment.failed") {
      // Never downgrade an order a "payment.captured" delivery (possibly
      // processed out of order, or by the verify route) already marked paid.
      if (existingOrder.payment_status !== "paid") {
        await updateOrder(orderId, { payment_status: "payment_failed" });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderStoreUnavailableError) {
      // 503 tells Razorpay this delivery failed so it retries the webhook
      // later, once durable storage is back — never silently drop it.
      return NextResponse.json({ error: "Order storage temporarily unavailable." }, { status: 503 });
    }
    throw err;
  }
}
