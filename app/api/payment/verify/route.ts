import { NextRequest, NextResponse } from "next/server";
import { razorpayProvider } from "@/lib/payment/razorpay-provider";
import { getOrder, updateOrder, OrderStoreUnavailableError } from "@/lib/orders/store";
import { fulfillPaidOrder } from "@/lib/orders/fulfillment";
import { sendPurchaseCapiEvent } from "@/lib/analytics/meta-capi";
import { enforceRateLimit } from "@/lib/rate-limit";

const ORDER_STORE_UNAVAILABLE_MESSAGE =
  "We couldn't confirm your order right now. Please contact support with your payment reference — do not retry the payment.";

// Called from the Razorpay Checkout success handler for immediate UX. The
// payment is only ever marked "paid" after the HMAC signature is verified
// server-side with the gateway secret — a frontend "success" callback alone
// is never trusted (spec section 27). The webhook route is the durable,
// idempotent backup for cases where this call never fires (tab closed, etc).
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, "payment-verify", { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await req.json();
  const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

  const hasOrderId = Boolean(order_id);
  const hasRazorpayOrderId = Boolean(razorpay_order_id);
  const hasPaymentId = Boolean(razorpay_payment_id);
  const hasSignature = Boolean(razorpay_signature);
  const providerStatus = razorpayProvider.status;

  // Temporary diagnostic logging for the production payment-verification
  // failure investigation. Never logs the signature, RAZORPAY_KEY_SECRET,
  // card details, or customer data — only presence flags, order/payment
  // identifiers, and the verification outcome.
  console.log("[payment-verify diagnostic] request received", {
    providerStatus,
    hasOrderId,
    hasRazorpayOrderId,
    hasPaymentId,
    hasSignature,
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
  });

  if (!hasOrderId || !hasRazorpayOrderId || !hasPaymentId || !hasSignature) {
    return NextResponse.json({ error: "Missing verification fields." }, { status: 400 });
  }

  try {
    const order = await getOrder(order_id);
    if (!order) {
      return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    }

    const valid = razorpayProvider.verifyPaymentSignature({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    console.log("[payment-verify diagnostic] signature verification result", {
      providerStatus,
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      valid,
    });

    if (!valid) {
      await updateOrder(order_id, { payment_status: "payment_failed" });
      return NextResponse.json(
        {
          error: "Signature verification failed.",
          debug: {
            providerStatus,
            hasOrderId,
            hasRazorpayOrderId,
            hasPaymentId,
            hasSignature,
          },
        },
        { status: 400 }
      );
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
  } catch (err) {
    if (err instanceof OrderStoreUnavailableError) {
      return NextResponse.json({ error: ORDER_STORE_UNAVAILABLE_MESSAGE }, { status: 503 });
    }
    throw err;
  }
}
