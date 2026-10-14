import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Order } from "@/lib/types";

// siteSettings.shipping.shiprocketFulfillmentEnabled (and therefore this
// route's flag gate) is read at module-import time, so any test that needs
// a specific flag value needs a fresh module graph — vi.resetModules() + a
// dynamic import, same pattern as lib/logistics/index.test.ts.
const { getOrderMock, fulfillPaidOrderMock, MockOrderStoreUnavailableError } = vi.hoisted(() => ({
  getOrderMock: vi.fn(),
  fulfillPaidOrderMock: vi.fn(),
  MockOrderStoreUnavailableError: class extends Error {},
}));

vi.mock("@/lib/orders/store", () => ({
  getOrder: getOrderMock,
  OrderStoreUnavailableError: MockOrderStoreUnavailableError,
}));

vi.mock("@/lib/orders/fulfillment", () => ({
  fulfillPaidOrder: fulfillPaidOrderMock,
}));

const SECRET = "test-diagnostics-secret";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: "SHD-DIAG-1",
    customer: {
      fullName: "Test Customer",
      mobile: "9876543210",
      email: "test@example.com",
      address: "1 Test St",
      city: "Indore",
      state: "MP",
      pincode: "452001",
    },
    items: [
      {
        productId: "groundnut-oil",
        variantId: "groundnut-oil-1l",
        productName: "Groundnut Oil",
        variantSize: "1 L",
        quantity: 1,
        mrp: 443,
        sellingPrice: 310,
        lineTotal: 310,
      },
    ],
    subtotal: 310,
    shipping_amount: 119.72,
    payment_fee: 0,
    taxes: 0,
    discounts: 0,
    grand_total: 429.72,
    payment_status: "paid",
    shipping_status: "shipment_created",
    tracking_number: "MOCKAWB0000000001",
    carrier: "Placeholder Carrier (mocked)",
    shiprocket_order_id: null,
    shiprocket_shipment_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    utm_data: {},
    ...overrides,
  };
}

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/diagnostics/fulfill-order", {
    method: "POST",
    headers: { "x-diagnostics-key": SECRET, "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/diagnostics/fulfill-order", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    getOrderMock.mockReset();
    fulfillPaidOrderMock.mockReset();
  });

  it("rejects an unauthorized request with a generic 404, without touching the order store", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }, { "x-diagnostics-key": "wrong-key" }));

    expect(res.status).toBe(404);
    expect(getOrderMock).not.toHaveBeenCalled();
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
  });

  it("returns a generic 404 when no DIAGNOSTICS_ACCESS_KEY is configured server-side at all", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", "");
    const { POST } = await import("./route");

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));

    expect(res.status).toBe(404);
  });

  it("requires order_id in the body", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");

    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
    expect(getOrderMock).not.toHaveBeenCalled();
  });

  it("404s on an unknown order", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");
    getOrderMock.mockResolvedValue(undefined);

    const res = await POST(makeRequest({ order_id: "SHD-UNKNOWN" }));

    expect(res.status).toBe(404);
  });

  it("rejects a non-paid order without calling fulfillPaidOrder", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");
    getOrderMock.mockResolvedValue(makeOrder({ payment_status: "pending" }));

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.ok).toBe(false);
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
  });

  it("rejects an order that already has a genuine (non-MOCKAWB) AWB", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");
    getOrderMock.mockResolvedValue(makeOrder({ tracking_number: "SR1234567890" }));

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.ok).toBe(false);
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
  });

  it("refuses to run real fulfillment while SHIPROCKET_FULFILLMENT_ENABLED is false, even for an eligible MOCKAWB order", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "false");
    const { POST } = await import("./route");
    getOrderMock.mockResolvedValue(makeOrder());

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));
    const json = await res.json();

    expect(res.status).toBe(409);
    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/SHIPROCKET_FULFILLMENT_ENABLED/);
    expect(fulfillPaidOrderMock).not.toHaveBeenCalled();
  });

  it("calls fulfillPaidOrder for an eligible MOCKAWB paid order once the flag is enabled", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "true");
    const { POST } = await import("./route");
    const order = makeOrder();
    getOrderMock.mockResolvedValue(order);
    fulfillPaidOrderMock.mockResolvedValue({
      ...order,
      tracking_number: "AWB999888777",
      carrier: "Delhivery Surface",
      shipping_status: "shipment_created",
    });

    await POST(makeRequest({ order_id: "SHD-DIAG-1" }));

    expect(fulfillPaidOrderMock).toHaveBeenCalledTimes(1);
    expect(fulfillPaidOrderMock).toHaveBeenCalledWith(order);
  });

  it("returns a safe success response with no customer PII", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "true");
    const { POST } = await import("./route");
    const order = makeOrder();
    getOrderMock.mockResolvedValue(order);
    fulfillPaidOrderMock.mockResolvedValue({
      ...order,
      tracking_number: "AWB999888777",
      carrier: "Delhivery Surface",
      shipping_status: "shipment_created",
    });

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      ok: true,
      order_id: "SHD-DIAG-1",
      shipping_status: "shipment_created",
      carrier: "Delhivery Surface",
      tracking_number: "AWB999888777",
    });
    const raw = JSON.stringify(json);
    expect(raw).not.toContain("Test Customer");
    expect(raw).not.toContain("test@example.com");
    expect(raw).not.toContain("9876543210");
    expect(raw).not.toContain("1 Test St");
  });

  it("returns a safe failure response (no raw provider error detail) when fulfillment throws", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "true");
    const { POST } = await import("./route");
    const order = makeOrder();
    getOrderMock.mockResolvedValue(order);
    fulfillPaidOrderMock.mockRejectedValue(
      new Error("SHIPROCKET_NO_COURIER: no courier is currently serviceable.")
    );

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.ok).toBe(false);
    expect(json.order_id).toBe("SHD-DIAG-1");
    expect(json.error).not.toContain("SHIPROCKET_NO_COURIER");
  });

  it("returns 503 when the order store is unavailable", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { POST } = await import("./route");
    getOrderMock.mockRejectedValue(new MockOrderStoreUnavailableError("down"));

    const res = await POST(makeRequest({ order_id: "SHD-DIAG-1" }));

    expect(res.status).toBe(503);
  });
});
