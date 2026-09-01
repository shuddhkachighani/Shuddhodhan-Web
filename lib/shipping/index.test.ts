import { afterEach, describe, expect, it, vi } from "vitest";

// lib/data/settings.ts reads process.env once at import time, so each
// scenario needs a fresh module graph after stubbing env vars.
async function loadGetShippingQuote() {
  vi.resetModules();
  const mod = await import("./index");
  return mod.getShippingQuote;
}

describe("getShippingQuote", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects an invalid pincode without ever calling a provider", async () => {
    const getShippingQuote = await loadGetShippingQuote();
    const quote = await getShippingQuote({
      pincode: "12345",
      cartWeightGrams: 1000,
      cartValue: 310,
    });
    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/valid 6-digit/i);
  });

  it("does not assume Indore serviceability when no pincode list is configured", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const getShippingQuote = await loadGetShippingQuote();

    const quote = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 310,
    });

    // Falls through to the mocked national provider rather than assuming
    // this Indore-looking pincode is covered by local delivery.
    expect(quote.serviceable).toBe(true);
    expect(quote.carrier).not.toBe("Shuddhodhan Local Delivery");
  });

  it("uses Indore local delivery once the pincode is explicitly configured", async () => {
    vi.stubEnv("INDORE_DELIVERY_ENABLED", "true");
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "452001,452010");
    vi.stubEnv("INDORE_FLAT_RATE", "49");
    vi.stubEnv("INDORE_MINIMUM_FREE_SHIPPING_VALUE", "999");
    const getShippingQuote = await loadGetShippingQuote();

    const belowThreshold = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 310,
    });
    expect(belowThreshold.serviceable).toBe(true);
    expect(belowThreshold.carrier).toBe("Shuddhodhan Local Delivery");
    expect(belowThreshold.shipping_amount).toBe(49);

    const aboveThreshold = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 1500,
    });
    expect(aboveThreshold.shipping_amount).toBe(0);
  });

  it("leaves an unconfigured pincode outside the Indore list to the national provider", async () => {
    vi.stubEnv("INDORE_DELIVERY_ENABLED", "true");
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "452001");
    const getShippingQuote = await loadGetShippingQuote();

    const quote = await getShippingQuote({
      pincode: "110001",
      cartWeightGrams: 1000,
      cartValue: 310,
    });
    expect(quote.serviceable).toBe(true);
    expect(quote.carrier).not.toBe("Shuddhodhan Local Delivery");
  });
});
