import { afterEach, describe, expect, it, vi } from "vitest";

// siteSettings (and therefore logisticsProvider) is computed once at module
// import time from process.env, so each case needs a fresh module graph —
// vi.resetModules() + a dynamic import, same pattern as
// lib/orders/store.supabase-failure.test.ts.
describe("logisticsProvider selection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("defaults to the mock provider when SHIPROCKET_FULFILLMENT_ENABLED is unset", async () => {
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "");
    const { logisticsProvider } = await import("./index");
    expect(logisticsProvider.name).toBe("mock-logistics");
  });

  it("stays on the mock provider when SHIPROCKET_FULFILLMENT_ENABLED=false", async () => {
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "false");
    const { logisticsProvider } = await import("./index");
    expect(logisticsProvider.name).toBe("mock-logistics");
  });

  it("switches to the real Shiprocket provider when SHIPROCKET_FULFILLMENT_ENABLED=true, independent of SHIPPING_PROVIDER", async () => {
    vi.stubEnv("SHIPROCKET_FULFILLMENT_ENABLED", "true");
    vi.stubEnv("SHIPPING_PROVIDER", "mock");
    const { logisticsProvider } = await import("./index");
    expect(logisticsProvider.name).toBe("shiprocket");
  });
});
