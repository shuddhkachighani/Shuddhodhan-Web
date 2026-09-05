import { afterEach, describe, expect, it, vi } from "vitest";

const { getQuoteMock, statusRef } = vi.hoisted(() => ({
  getQuoteMock: vi.fn(),
  statusRef: { current: "READY" as "READY" | "MOCKED" | "NOT_CONFIGURED" },
}));

vi.mock("@/lib/shipping/shiprocket-provider", () => ({
  shiprocketProvider: {
    get status() {
      return statusRef.current;
    },
    getQuote: getQuoteMock,
  },
}));

import { NextRequest } from "next/server";
import { GET } from "./route";

const SECRET = "test-diagnostics-secret";
const EXPECTED_TEST_REQUEST = {
  pincode: "452009",
  cartWeightGrams: 1150,
  cartValue: 310,
  lines: [{ productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 }],
};

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/diagnostics/shiprocket-rate", {
    method: "GET",
    headers,
  });
}

describe("GET /api/diagnostics/shiprocket-rate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    statusRef.current = "READY";
    getQuoteMock.mockReset();
  });

  it("returns a generic 404 when no access key is provided", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeRequest());

    expect(res.status).toBe(404);
    expect(getQuoteMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a generic 404 when the access key is incorrect", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeRequest({ "x-diagnostics-key": "wrong-secret" }));

    expect(res.status).toBe(404);
    expect(getQuoteMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("with a correct access key, calls getQuote exactly once with the fixed test request", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 62,
      estimated_delivery: "2026-09-10",
      carrier: "Delhivery Surface",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getQuoteMock).toHaveBeenCalledTimes(1);
    expect(getQuoteMock).toHaveBeenCalledWith(EXPECTED_TEST_REQUEST);
    expect(body).toEqual({
      configured: true,
      quote: {
        serviceable: true,
        shipping_amount: 62,
        estimated_delivery: "2026-09-10",
        carrier: "Delhivery Surface",
        service: null,
        weight_used_grams: 1150,
        zone: null,
        reason: null,
      },
    });
  });

  it("with a correct access key, passes through a safe reason when the quote fails", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: false,
      shipping_amount: 0,
      estimated_delivery: null,
      carrier: null,
      service: null,
      weight_used_grams: 1150,
      zone: null,
      reason: "No courier is currently serviceable for this pincode.",
    });

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.quote.serviceable).toBe(false);
    expect(body.quote.reason).toBe("No courier is currently serviceable for this pincode.");
  });

  it("reports configured: false when Shiprocket is not configured, but still makes the one call", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    statusRef.current = "NOT_CONFIGURED";
    getQuoteMock.mockResolvedValue({
      serviceable: false,
      shipping_amount: 0,
      estimated_delivery: null,
      carrier: null,
      service: null,
      weight_used_grams: 1150,
      zone: null,
      reason: "Shiprocket is not configured.",
    });

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const body = await res.json();

    expect(body.configured).toBe(false);
    expect(getQuoteMock).toHaveBeenCalledTimes(1);
  });

  it("never calls fetch directly (all Shiprocket access is via the mocked provider)", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 62,
      estimated_delivery: null,
      carrier: "Test Carrier",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await GET(makeRequest({ "x-diagnostics-key": SECRET }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
