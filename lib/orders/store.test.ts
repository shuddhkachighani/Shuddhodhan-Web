import { afterEach, describe, expect, it, vi } from "vitest";
import { getOrder, saveOrder, OrderStoreUnavailableError } from "./store";
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
