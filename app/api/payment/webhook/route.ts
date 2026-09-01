import { NextRequest, NextResponse } from "next/server";
import { razorpayProvider } from "@/lib/payment/razorpay-provider";
import { getOrder, updateOrder } from "@/lib/orders/store";

// Server-to-server webhook — the only place an order is ever marked "paid".
// A frontend payment-success callback is never trusted on its own (spec
// section 27): the signature here is verified against RAZORPAY_WEBHOOK_SECRET
// before any order status changes.
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

  const existingOrder = getOrder(orderId);
  if (!existingOrder) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  // Idempotency: a duplicate callback for an already-paid order is a no-op.
  if (existingOrder.payment_status === "paid") {
    return NextResponse.json({ ok: true, deduped: true });
  }

  if (event === "payment.captured") {
    updateOrder(orderId, { payment_status: "paid", shipping_status: "processing" });
  } else if (event === "payment.failed") {
    updateOrder(orderId, { payment_status: "payment_failed" });
  }

  return NextResponse.json({ ok: true });
}
