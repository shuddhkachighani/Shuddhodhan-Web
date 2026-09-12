import crypto from "node:crypto";
import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  PaymentProvider,
  VerifyPaymentInput,
} from "@/lib/payment/types";

/**
 * Razorpay adapter, implemented against Razorpay's REST API directly (no SDK
 * dependency). STATUS is NOT_CONFIGURED until real RAZORPAY keys are present
 * in the environment — createOrder throws a clear, typed error rather than
 * silently pretending to succeed, so the checkout UI can surface an honest
 * "payments are not live yet" state instead of a fake success screen.
 */
export class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay";

  get status(): "READY" | "NOT_CONFIGURED" {
    return this.keyId && this.keySecret ? "READY" : "NOT_CONFIGURED";
  }

  private get keyId() {
    return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  }
  private get keySecret() {
    return process.env.RAZORPAY_KEY_SECRET || "";
  }
  private get webhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  async createOrder(
    input: CreatePaymentOrderInput
  ): Promise<CreatePaymentOrderResult> {
    if (this.status === "NOT_CONFIGURED") {
      throw new Error(
        "PAYMENT_GATEWAY_NOT_CONFIGURED: set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      );
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
      "base64"
    );
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Razorpay order creation failed: ${text}`);
    }

    const data = await res.json();
    return {
      providerOrderId: data.id,
      amountPaise: data.amount,
      currency: data.currency,
      keyId: this.keyId,
    };
  }

  verifyPaymentSignature(input: VerifyPaymentInput): boolean {
    if (this.status === "NOT_CONFIGURED") return false;
    const expected = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest("hex");
    return timingSafeEqual(expected, input.signature);
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
    if (!this.webhookSecret) return false;
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");
    return timingSafeEqual(expected, signatureHeader);
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export const razorpayProvider = new RazorpayProvider();
