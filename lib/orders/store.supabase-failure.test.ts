import { describe, expect, it, vi } from "vitest";

// Simulates Supabase being configured (credentials present) but every query
// failing at runtime — an outage, network error, or auth/RLS misconfig —
// as opposed to store.test.ts's "not configured at all" scenario. Isolated
// in its own file so this module-level mock doesn't affect the real
// isSupabaseConfigured() behavior exercised elsewhere.
const supabaseError = { message: "simulated Supabase failure", code: "PGRST000" };

function chainResolvingTo(result: { data: null; error: typeof supabaseError }) {
  const chain: Record<string, (...args: unknown[]) => unknown> = {};
  chain.from = () => chain;
  chain.select = () => chain;
  chain.update = () => chain;
  chain.eq = () => chain;
  chain.upsert = () => Promise.resolve(result);
  chain.maybeSingle = () => Promise.resolve(result);
  return chain;
}

vi.mock("@/lib/supabase/server-client", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseServerClient: () => chainResolvingTo({ data: null, error: supabaseError }),
}));

describe("order store classifies Supabase operational failures", () => {
  it("saveOrder throws OrderStoreUnavailableError (not a generic Error) when upsert fails", async () => {
    const { saveOrder, OrderStoreUnavailableError } = await import("./store");
    const order = {
      order_id: "SHD-TEST-OPFAIL1",
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
      payment_status: "pending" as const,
      shipping_status: "pending" as const,
      tracking_number: null,
      carrier: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      utm_data: {},
    };

    await expect(saveOrder(order)).rejects.toBeInstanceOf(OrderStoreUnavailableError);
  });

  it("getOrder throws OrderStoreUnavailableError when the select fails", async () => {
    const { getOrder, OrderStoreUnavailableError } = await import("./store");
    await expect(getOrder("SHD-TEST-OPFAIL2")).rejects.toBeInstanceOf(OrderStoreUnavailableError);
  });

  it("updateOrder throws OrderStoreUnavailableError when the update fails", async () => {
    const { updateOrder, OrderStoreUnavailableError } = await import("./store");
    await expect(
      updateOrder("SHD-TEST-OPFAIL3", { payment_status: "paid" })
    ).rejects.toBeInstanceOf(OrderStoreUnavailableError);
  });

  it("preserves the original Supabase error as `cause` without leaking it into the message", async () => {
    const { getOrder, OrderStoreUnavailableError } = await import("./store");
    try {
      await getOrder("SHD-TEST-OPFAIL4");
      expect.unreachable("expected getOrder to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(OrderStoreUnavailableError);
      const typedErr = err as InstanceType<typeof OrderStoreUnavailableError>;
      expect(typedErr.message).not.toContain(supabaseError.message);
      expect(typedErr.cause).toBe(supabaseError);
    }
  });
});
