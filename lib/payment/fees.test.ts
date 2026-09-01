import { afterEach, describe, expect, it, vi } from "vitest";

// settings.ts reads process.env once at import time, so each scenario needs a
// fresh module graph after stubbing env vars.
async function loadComputePaymentFee() {
  vi.resetModules();
  const mod = await import("./fees");
  return mod.computePaymentFee;
}

describe("computePaymentFee", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 0 when the fee is disabled (the default)", async () => {
    const computePaymentFee = await loadComputePaymentFee();
    expect(computePaymentFee(1000)).toBe(0);
  });

  it("applies percentage + fixed fee + tax on fee when enabled", async () => {
    vi.stubEnv("PAYMENT_FEE_ENABLED", "true");
    vi.stubEnv("PAYMENT_FEE_PERCENTAGE", "2");
    vi.stubEnv("PAYMENT_FEE_FIXED_PAISE", "300"); // ₹3 fixed
    vi.stubEnv("PAYMENT_FEE_TAX_PERCENTAGE", "18");
    const computePaymentFee = await loadComputePaymentFee();

    // base = 1000 * 2% + 3 = 23; tax = 23 * 18% = 4.14; total = 27.14
    expect(computePaymentFee(1000)).toBeCloseTo(27.14, 2);
  });
});
