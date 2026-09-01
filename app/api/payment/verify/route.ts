import { NextRequest, NextResponse } from "next/server";
import { razorpayProvider } from "@/lib/payment/razorpay-provider";
import { getOrder, updateOrder } from "@/lib/orders/store";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { sendPurchaseCapiEvent } from "@/lib/analytics/meta-capi";

// Called from the Razorpay Checkout success handler for immediate UX. The
// payment is only ever marked "paid" after the HMAC signature is verified
// server-side with the gateway secret — a frontend "success" callback alone
// is never trusted (spec section 27). The webhook route is the durable,
// idempotent backup for cases where this call never fires (tab closed, etc).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing verification fields." }, { status: 400 });
  }

  const order = await getOrder(order_id);
  if (!order) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  const valid = razorpayProvider.verifyPaymentSignature({
    providerOrderId: razorpay_order_id,
    providerPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await updateOrder(order_id, { payment_status: "payment_failed" });
    return NextResponse.json({ error: "Signature verification failed." }, { status: 400 });
  }

  const paidOrder = await updateOrder(order_id, {
    payment_status: "paid",
    shipping_status: "processing",
  });

  if (paidOrder) {
    const fulfilled = await fulfillPaidOrder(paidOrder);
    await sendPurchaseCapiEvent(fulfilled, req);
    return NextResponse.json({ ok: true, order: fulfilled });
  }

  return NextResponse.json({ ok: true, order: paidOrder });
}
