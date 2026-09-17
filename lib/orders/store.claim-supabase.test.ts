import { describe, expect, it, vi } from "vitest";

// Verifies the actual Supabase query shape claimOrderForFulfillment() and
// releaseFulfillmentClaim() build — the previous test suite only ever
// exercised the in-memory fallback path for these, never the real
// Supabase branch, which is exactly where the legacy-MOCKAWB claim fix
// (the `.or()` filter) lives. Isolated in its own file, same reasoning as
// store.supabase-failure.test.ts: this module-level mock shouldn't affect
// isSupabaseConfigured() behavior exercised elsewhere.
const calls: { method: string; args: unknown[] }[] = [];

function chain(result: { data: unknown; error: unknown }) {
  const record = (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return proxy;
    };
  const proxy: Record<string, (...args: unknown[]) => unknown> = {};
  proxy.from = record("from");
  proxy.update = record("update");
  proxy.eq = record("eq");
  proxy.or = record("or");
  proxy.select = record("select");
  proxy.maybeSingle = () => {
    calls.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(result);
  };
  return proxy;
}

vi.mock("@/lib/supabase/server-client", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseServerClient: () =>
    chain({
      data: {
        order_id: "SHD-CLAIM-SB",
        customer: {},
        items: [],
        subtotal: 0,
        shipping_amount: 0,
        payment_fee: 0,
        taxes: 0,
        discounts: 0,
        grand_total: 0,
        payment_status: "paid",
        shipping_status: "processing",
        tracking_number: "CLAIMED_PENDING_SHIPMENT",
        carrier: null,
        shiprocket_order_id: null,
        shiprocket_shipment_id: null,
        created_at: "2026-09-17T00:00:00.000Z",
        updated_at: "2026-09-17T00:00:00.000Z",
        utm_data: {},
      },
      error: null,
    }),
}));

describe("claimOrderForFulfillment / releaseFulfillmentClaim against Supabase", () => {
  it("claims with an OR filter covering both NULL and legacy MOCKAWB values, never just NULL", async () => {
    calls.length = 0;
    const { claimOrderForFulfillment } = await import("./store");

    const claimed = await claimOrderForFulfillment("SHD-CLAIM-SB");

    expect(claimed).toBeDefined();
    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall?.args[0]).toEqual({ tracking_number: "CLAIMED_PENDING_SHIPMENT" });

    const orCall = calls.find((c) => c.method === "or");
    expect(orCall).toBeDefined();
    const filter = orCall?.args[0] as string;
    expect(filter).toContain("tracking_number.is.null");
    expect(filter).toContain("tracking_number.like.MOCKAWB%");

    // Never a bare `.is("tracking_number", null)` with no OR — that would
    // exclude legacy MOCKAWB rows from being claimable again.
    const isCall = calls.find((c) => c.method === "is");
    expect(isCall).toBeUndefined();
  });

  it("releases by restoring the given value, scoped to rows still holding the claim sentinel", async () => {
    calls.length = 0;
    const { releaseFulfillmentClaim } = await import("./store");

    await releaseFulfillmentClaim("SHD-CLAIM-SB", "MOCKAWB0000000009");

    const updateCall = calls.find((c) => c.method === "update");
    expect(updateCall?.args[0]).toEqual({ tracking_number: "MOCKAWB0000000009" });

    const eqCalls = calls.filter((c) => c.method === "eq");
    expect(eqCalls).toContainEqual({ method: "eq", args: ["order_id", "SHD-CLAIM-SB"] });
    expect(eqCalls).toContainEqual({
      method: "eq",
      args: ["tracking_number", "CLAIMED_PENDING_SHIPMENT"],
    });
  });
});
