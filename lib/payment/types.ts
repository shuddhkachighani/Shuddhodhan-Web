// Adapter interface for the online payment gateway. Checkout/order code talks
// only to this interface, never to a specific gateway, so Razorpay can be
// swapped for another Indian gateway later without touching business logic.
// There is deliberately no Cash on Delivery path anywhere in this layer.
export interface CreatePaymentOrderInput {
  amountPaise: number;
  currency: "INR";
  receipt: string; // our internal order_id
  notes?: Record<string, string>;
}

export interface CreatePaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentProvider {
  readonly name: string;
  readonly status: "READY" | "NOT_CONFIGURED";
  createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult>;
  verifyPaymentSignature(input: VerifyPaymentInput): boolean;
  verifyWebhookSignature(rawBody: string, signatureHeader: string): boolean;
}
