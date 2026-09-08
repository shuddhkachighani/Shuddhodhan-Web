import { afterEach, describe, expect, it, vi } from "vitest";

const { shiprocketGetQuoteMock } = vi.hoisted(() => ({
  shiprocketGetQuoteMock: vi.fn(),
}));

vi.mock("@/lib/shipping/shiprocket-provider", () => ({
  shiprocketProvider: {
    name: "Shiprocket (mocked in test)",
    status: "READY",
    getQuote: shiprocketGetQuoteMock,
  },
}));

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
      lines: [],
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
      lines: [],
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
      lines: [],
    });
    expect(belowThreshold.serviceable).toBe(true);
    expect(belowThreshold.carrier).toBe("Shuddhodhan Local Delivery");
    expect(belowThreshold.shipping_amount).toBe(49);

    const aboveThreshold = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 1500,
      lines: [],
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
      lines: [],
    });
    expect(quote.serviceable).toBe(true);
    expect(quote.carrier).not.toBe("Shuddhodhan Local Delivery");
  });

  it("applies the locked default Indore policy (sub-1000 -> Rs99, 1000+ -> free) with no env overrides", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "452001");
    const getShippingQuote = await loadGetShippingQuote();

    const belowThreshold = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 999,
      lines: [],
    });
    expect(belowThreshold.carrier).toBe("Shuddhodhan Local Delivery");
    expect(belowThreshold.shipping_amount).toBe(99);

    const atThreshold = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 1000,
      cartValue: 1000,
      lines: [],
    });
    expect(atThreshold.carrier).toBe("Shuddhodhan Local Delivery");
    expect(atThreshold.shipping_amount).toBe(0);
  });
});

describe("getShippingQuote national provider routing", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    shiprocketGetQuoteMock.mockReset();
  });

  it("uses the mocked placeholder provider when SHIPPING_PROVIDER is unset", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const getShippingQuote = await loadGetShippingQuote();

    await getShippingQuote({
      pincode: "110001",
      cartWeightGrams: 1000,
      cartValue: 310,
      lines: [],
    });

    expect(shiprocketGetQuoteMock).not.toHaveBeenCalled();
  });

  it("routes non-Indore quotes to Shiprocket once SHIPPING_PROVIDER=shiprocket is set", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    vi.stubEnv("SHIPPING_PROVIDER", "shiprocket");
    shiprocketGetQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 62,
      estimated_delivery: "2026-09-14",
      carrier: "Delhivery Surface",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });
    const getShippingQuote = await loadGetShippingQuote();

    const quote = await getShippingQuote({
      pincode: "110001",
      cartWeightGrams: 1000,
      cartValue: 310,
      lines: [],
    });

    expect(shiprocketGetQuoteMock).toHaveBeenCalledTimes(1);
    expect(quote.carrier).toBe("Delhivery Surface");
    expect(quote.shipping_amount).toBe(62);
  });
});

describe("getShippingQuote actual-weight pass-through", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    shiprocketGetQuoteMock.mockReset();
  });

  it.each([500, 1000, 2000, 5000, 14520])(
    "passes %dg of actual product weight through to the national provider unmodified (no allowance)",
    async (actualWeightGrams) => {
      vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
      const getShippingQuote = await loadGetShippingQuote();

      const quote = await getShippingQuote({
        pincode: "452001",
        cartWeightGrams: actualWeightGrams,
        cartValue: 310,
        lines: [],
      });

      expect(quote.weight_used_grams).toBe(actualWeightGrams);
    }
  );

  it("calls the Shiprocket provider with the exact unmodified cartWeightGrams", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    vi.stubEnv("SHIPPING_PROVIDER", "shiprocket");
    shiprocketGetQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 62,
      estimated_delivery: "2026-09-14",
      carrier: "Delhivery Surface",
      service: null,
      weight_used_grams: 990,
      zone: null,
    });
    const getShippingQuote = await loadGetShippingQuote();

    await getShippingQuote({
      pincode: "110001",
      cartWeightGrams: 990,
      cartValue: 310,
      lines: [],
    });

    expect(shiprocketGetQuoteMock).toHaveBeenCalledTimes(1);
    expect(shiprocketGetQuoteMock).toHaveBeenCalledWith(
      expect.objectContaining({ cartWeightGrams: 990 })
    );
  });

  it("passes the exact unmodified cartWeightGrams to Indore local delivery too", async () => {
    vi.stubEnv("INDORE_DELIVERY_ENABLED", "true");
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "452001");
    const getShippingQuote = await loadGetShippingQuote();

    const quote = await getShippingQuote({
      pincode: "452001",
      cartWeightGrams: 4800,
      cartValue: 310,
      lines: [],
    });

    expect(quote.carrier).toBe("Shuddhodhan Local Delivery");
    expect(quote.weight_used_grams).toBe(4800);
  });
});
