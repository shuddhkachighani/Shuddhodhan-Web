import { afterEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/lib/types";

const {
  verifySignatureMock,
  getOrderMock,
  updateOrderMock,
  fulfillPaidOrderMock,
  sendCapiMock,
  MockOrderStoreUnavailableError,
} = vi.hoisted(() => ({
  verifySignatureMock: vi.fn(),
  getOrderMock: vi.fn(),
  updateOrderMock: vi.fn(),
  fulfillPaidOrderMock: vi.fn(),
  sendCapiMock: vi.fn(),
  MockOrderStoreUnavailableError: class extends Error {},
}));

vi.mock("@/lib/payment/razorpay-provider", () => ({
  razorpayProvider: { verifyWebhookSignature: verifySignatureMock },
}));

vi.mock("@/lib/orders/store", () => ({
  getOrder: getOrderMock,
  updateOrder: updateOrderMock,
  OrderStoreUnavailableError: MockOrderStoreUnavailableError,
}));

vi.mock("@/lib/orders/fulfillment", () => ({
  fulfillPaidOrder: fulfillPaidOrderMock,
}));

vi.mock("@/lib/analytics/meta-capi", () => ({
  sendPurchaseCapiEvent: sendCapiMock,
}));

import { POST } from "./route";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: "SHD-WEBHOOK-1",
    customer: {
      fullName: "Test Customer",
      mobile: "9876543210",
      email: "test@example.com",
      address: "1 Test St",
      city: "Indore",
      state: "MP",
      pincode: "452001",
    },
    items: [],
    subtotal: 100,
    shipping_amount: 0,
    payment_fee: 0,
    taxes: 0,
    discounts: 0,
    grand_total: 100,
    payment_status: "pending",
    shipping_status: "pending",
    tracking_number: null,
    carrier: null,
    shiprocket_order_id: null,
    shiprocket_shipment_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    utm_data: {},
    ...overrides,
  };
}

function makeRequest(event: string, orderId: string | undefined) {
  const body = JSON.stringify({
    event,
    payload: { payment: { entity: { notes: { order_id: orderId } } } },
  });
  return new Request("http://localhost/api/payment/webhook", {
    method: "POST",
    headers: { "x-razorpay-signature": "sig" },
    body,
  }) as unknown as import("next/server").NextRequest;
}

describe("POST /api/payment/webhook", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("rejects an invalid signature without touching the order store", async () => {
    verifySignatureMock.mockReturnValue(false);

    const res = await POST(makeRequest("payment.captured", "SHD-WEBHOOK-1"));

    expect(res.status).toBe(400);
    expect(getOrderMock).not.toHaveBeenCalled();
  });

  it("404s on an unknown order", async () => {
    verifySignatureMock.mockReturnValue(true);
    getOrderMock.mockResolvedValue(undefined);

    const res = await POST(makeRequest("payment.captured", "SHD-UNKNOWN"));

    expect(res.status).toBe(404);
  });

  it("marks payment paid, fulfills, and fires CAPI exactly once on the first captured delivery", async () => {
    verifySignatureMock.mockReturnValue(true);
    const pending = makeOrder({ payment_status: "pending" });
    const paid = { ...pending, payment_status: "paid" as const, shipping_status: "processing" as const };
    const fulfilled = { ...paid, tracking_number: "AWB1" };
    getOrderMock.mockResolvedValue(pending);
    updateOrderMock.mockResolvedValue(paid);
    fulfillPaidOrderMock.mockResolvedValue(fulfilled);

    const res = await POST(makeRequest("payment.captured", pending.order_id));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, deduped: false });
    expect(updateOrderMock).toHaveBeenCalledWith(pending.order_id, {
      payment_status: "paid",
      shipping_status: "processing",
    });
    expect(fulfillPaidOrderMock).toHaveBeenCalledWith(paid);
    expect(sendCapiMock).toHaveBeenCalledTimes(1);
  });

  it("retries fulfillment on a redelivery for an already-paid, not-yet-fulfilled order, without re-firing CAPI", async () => {
    verifySignatureMock.mockReturnValue(true);
    const alreadyPaidNoTracking = makeOrder({
      payment_status: "paid",
      shipping_status: "processing",
      tracking_number: null,
    });
    getOrderMock.mockResolvedValue(alreadyPaidNoTracking);
    fulfillPaidOrderMock.mockResolvedValue({ ...alreadyPaidNoTracking, tracking_number: "AWB2" });

    const res = await POST(makeRequest("payment.captured", alreadyPaidNoTracking.order_id));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, deduped: true });
    // Must not re-mark payment status on a redelivery.
    expect(updateOrderMock).not.toHaveBeenCalled();
    // But fulfillment MUST be retried — this is the whole point of the fix.
    expect(fulfillPaidOrderMock).toHaveBeenCalledWith(alreadyPaidNoTracking);
    expect(sendCapiMock).not.toHaveBeenCalled();
  });

  it("skips fulfillment entirely once a real shipment already exists", async () => {
    verifySignatureMock.mockReturnValue(true);
    const fullyFulfilled = makeOrder({
      payment_status: "paid",
      shipping_status: "shipment_created",
      tracking_number: "AWB-ALREADY",
    });
    getOrderMock.mockResolvedValue(fullyFulfilled);

    const res = await POST(makeRequest("payment.captured", fullyFulfilled.order_id));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, deduped: true });
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
    expect(sendCapiMock).not.toHaveBeenCalled();
  });

  it("returns a retryable non-2xx when fulfillment fails, and never fires CAPI", async () => {
    verifySignatureMock.mockReturnValue(true);
    const pending = makeOrder({ payment_status: "pending" });
    const paid = { ...pending, payment_status: "paid" as const, shipping_status: "processing" as const };
    getOrderMock.mockResolvedValue(pending);
    updateOrderMock.mockResolvedValue(paid);
    fulfillPaidOrderMock.mockRejectedValue(new Error("SHIPROCKET_UNREACHABLE"));

    const res = await POST(makeRequest("payment.captured", pending.order_id));

    expect(res.status).toBe(502);
    expect(sendCapiMock).not.toHaveBeenCalled();
    // Payment was still durably marked paid before the fulfillment attempt.
    expect(updateOrderMock).toHaveBeenCalledWith(pending.order_id, {
      payment_status: "paid",
      shipping_status: "processing",
    });
  });

  it("marks payment_failed for a not-yet-paid order", async () => {
    verifySignatureMock.mockReturnValue(true);
    const pending = makeOrder({ payment_status: "pending" });
    getOrderMock.mockResolvedValue(pending);

    const res = await POST(makeRequest("payment.failed", pending.order_id));

    expect(res.status).toBe(200);
    expect(updateOrderMock).toHaveBeenCalledWith(pending.order_id, { payment_status: "payment_failed" });
  });

  it("never downgrades an already-paid order on a late payment.failed event", async () => {
    verifySignatureMock.mockReturnValue(true);
    const paid = makeOrder({ payment_status: "paid" });
    getOrderMock.mockResolvedValue(paid);

    const res = await POST(makeRequest("payment.failed", paid.order_id));

    expect(res.status).toBe(200);
    expect(updateOrderMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the order store is unavailable", async () => {
    verifySignatureMock.mockReturnValue(true);
    getOrderMock.mockRejectedValue(new MockOrderStoreUnavailableError("down"));

    const res = await POST(makeRequest("payment.captured", "SHD-WEBHOOK-1"));

    expect(res.status).toBe(503);
  });
});
