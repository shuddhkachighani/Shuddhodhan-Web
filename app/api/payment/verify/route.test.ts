import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Order } from "@/lib/types";

const {
  verifyPaymentSignatureMock,
  getOrderMock,
  updateOrderMock,
  fulfillPaidOrderMock,
  sendCapiMock,
  MockOrderStoreUnavailableError,
} = vi.hoisted(() => ({
  verifyPaymentSignatureMock: vi.fn(),
  getOrderMock: vi.fn(),
  updateOrderMock: vi.fn(),
  fulfillPaidOrderMock: vi.fn(),
  sendCapiMock: vi.fn(),
  MockOrderStoreUnavailableError: class extends Error {},
}));

vi.mock("@/lib/payment/razorpay-provider", () => ({
  razorpayProvider: {
    status: "READY",
    verifyPaymentSignature: verifyPaymentSignatureMock,
  },
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
    order_id: "SHD-VERIFY-1",
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

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/payment/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const validBody = {
  order_id: "SHD-VERIFY-1",
  razorpay_order_id: "order_abc",
  razorpay_payment_id: "pay_abc",
  razorpay_signature: "sig_abc",
};

describe("POST /api/payment/verify", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns ok:true with the fulfilled order when everything succeeds", async () => {
    const pending = makeOrder();
    const paid = { ...pending, payment_status: "paid" as const, shipping_status: "processing" as const };
    const fulfilled = { ...paid, tracking_number: "AWB1" };
    getOrderMock.mockResolvedValue(pending);
    verifyPaymentSignatureMock.mockReturnValue(true);
    updateOrderMock.mockResolvedValue(paid);
    fulfillPaidOrderMock.mockResolvedValue(fulfilled);

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, order: fulfilled });
    expect(sendCapiMock).toHaveBeenCalledTimes(1);
  });

  it("still returns ok:true (payment already recorded) when fulfillment throws", async () => {
    const pending = makeOrder();
    const paid = { ...pending, payment_status: "paid" as const, shipping_status: "processing" as const };
    getOrderMock.mockResolvedValue(pending);
    verifyPaymentSignatureMock.mockReturnValue(true);
    updateOrderMock.mockResolvedValue(paid);
    fulfillPaidOrderMock.mockRejectedValue(new Error("SHIPROCKET_UNREACHABLE"));

    const res = await POST(makeRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true, order: paid });
    expect(sendCapiMock).not.toHaveBeenCalled();
  });

  it("marks payment_failed and returns 400 on an invalid signature", async () => {
    getOrderMock.mockResolvedValue(makeOrder());
    verifyPaymentSignatureMock.mockReturnValue(false);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(400);
    expect(updateOrderMock).toHaveBeenCalledWith("SHD-VERIFY-1", { payment_status: "payment_failed" });
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
  });

  it("400s when required fields are missing", async () => {
    const res = await POST(makeRequest({ order_id: "SHD-VERIFY-1" }));
    expect(res.status).toBe(400);
    expect(getOrderMock).not.toHaveBeenCalled();
  });

  it("404s on an unknown order", async () => {
    getOrderMock.mockResolvedValue(undefined);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 503 when the order store is unavailable", async () => {
    getOrderMock.mockRejectedValue(new MockOrderStoreUnavailableError("down"));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(503);
  });
});
