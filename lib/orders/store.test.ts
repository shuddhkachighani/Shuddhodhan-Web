import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimOrderForFulfillment,
  getOrder,
  releaseFulfillmentClaim,
  saveOrder,
  updateOrder,
  OrderStoreUnavailableError,
} from "./store";
import type { Order } from "@/lib/types";

function makeOrder(id: string): Order {
  return {
    order_id: id,
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
  };
}

describe("order store production guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the in-memory store outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const order = makeOrder("SHD-TEST-MEMORY1");
    await saveOrder(order);
    await expect(getOrder(order.order_id)).resolves.toEqual(order);
  });

  it("refuses to use the in-memory store in production when Supabase is unconfigured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const order = makeOrder("SHD-TEST-PROD1");
    await expect(saveOrder(order)).rejects.toBeInstanceOf(OrderStoreUnavailableError);
    await expect(getOrder(order.order_id)).rejects.toBeInstanceOf(OrderStoreUnavailableError);
  });
});

describe("fulfillment claim / release", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("claims a never-fulfilled order (tracking_number null)", async () => {
    const order = makeOrder("SHD-CLAIM-NULL");
    await saveOrder(order);

    const claimed = await claimOrderForFulfillment(order.order_id);
    expect(claimed).toBeDefined();
    // The sentinel is never exposed, even on the claim result itself.
    expect(claimed?.tracking_number).toBeNull();
  });

  it("claims a legacy MOCKAWB order (eligible for migration)", async () => {
    const order = { ...makeOrder("SHD-CLAIM-MOCK"), tracking_number: "MOCKAWB0000000001" };
    await saveOrder(order);

    const claimed = await claimOrderForFulfillment(order.order_id);
    expect(claimed).toBeDefined();
  });

  it("refuses to claim an order with a real (non-mock) AWB — idempotency guard intact", async () => {
    const order = { ...makeOrder("SHD-CLAIM-REAL"), tracking_number: "SR1234567890" };
    await saveOrder(order);

    const claimed = await claimOrderForFulfillment(order.order_id);
    expect(claimed).toBeUndefined();

    // And the real AWB must be completely untouched.
    const stillThere = await getOrder(order.order_id);
    expect(stillThere?.tracking_number).toBe("SR1234567890");
  });

  it("refuses a second concurrent claim while one is already in progress", async () => {
    const order = makeOrder("SHD-CLAIM-DOUBLE");
    await saveOrder(order);

    const first = await claimOrderForFulfillment(order.order_id);
    const second = await claimOrderForFulfillment(order.order_id);

    expect(first).toBeDefined();
    expect(second).toBeUndefined();
  });

  it("release restores the exact prior value — null for a fresh order", async () => {
    const order = makeOrder("SHD-RELEASE-NULL");
    await saveOrder(order);
    await claimOrderForFulfillment(order.order_id);

    await releaseFulfillmentClaim(order.order_id, null);

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBeNull();
  });

  it("release restores the exact prior value — the legacy MOCKAWB value for a migration attempt", async () => {
    const order = { ...makeOrder("SHD-RELEASE-MOCK"), tracking_number: "MOCKAWB0000000002" };
    await saveOrder(order);
    await claimOrderForFulfillment(order.order_id);

    await releaseFulfillmentClaim(order.order_id, "MOCKAWB0000000002");

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBe("MOCKAWB0000000002");
  });

  it("release is a no-op if the order no longer holds the claim sentinel (already completed elsewhere)", async () => {
    const order = makeOrder("SHD-RELEASE-NOOP");
    await saveOrder(order);
    await claimOrderForFulfillment(order.order_id);
    // Simulate the claim having already resolved to a real AWB elsewhere.
    await updateOrder(order.order_id, { tracking_number: "SR9999999999" });

    await releaseFulfillmentClaim(order.order_id, null);

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBe("SR9999999999");
  });
});
