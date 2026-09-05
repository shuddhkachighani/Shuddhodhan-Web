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

// Rate limiting itself is covered by lib/rate-limit.test.ts. Its bucket is a
// shared in-memory Map keyed by route+IP that persists across every GET()
// call in this file (all "unknown" IP, same routeKey) — with this file now
// making more calls than the route's own limit allows, a real limiter would
// make later tests flake on a 429 rather than the response they're actually
// checking. Stub it out so this file solely exercises this route's own gating/
// case-selection logic.
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockReturnValue(null),
}));

import { NextRequest } from "next/server";
import { GET } from "./route";

const SECRET = "test-diagnostics-secret";
const EXPECTED_INDORE_REQUEST = {
  pincode: "452009",
  cartWeightGrams: 1150,
  cartValue: 310,
  lines: [{ productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 }],
};
const EXPECTED_MUMBAI_REQUEST = {
  pincode: "400001",
  cartWeightGrams: 1150,
  cartValue: 310,
  lines: [{ productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 }],
};

function makeRequest(
  headers: Record<string, string> = {},
  searchParams: Record<string, string> = {}
): NextRequest {
  const url = new URL("http://localhost/api/diagnostics/shiprocket-rate");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url, { method: "GET", headers });
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

  it("defaults to the 452009 (Indore) test case when no ?case is given", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 90.36,
      estimated_delivery: "2026-09-08",
      carrier: "Amazon Shipping Surface 2kg",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getQuoteMock).toHaveBeenCalledTimes(1);
    expect(getQuoteMock).toHaveBeenCalledWith(EXPECTED_INDORE_REQUEST);
    expect(body).toEqual({
      testCase: "452009",
      configured: true,
      quote: {
        serviceable: true,
        shipping_amount: 90.36,
        estimated_delivery: "2026-09-08",
        carrier: "Amazon Shipping Surface 2kg",
        service: null,
        weight_used_grams: 1150,
        zone: null,
        reason: null,
      },
    });
  });

  it("explicitly selects the 452009 (Indore) test case via ?case=452009", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 90.36,
      estimated_delivery: "2026-09-08",
      carrier: "Amazon Shipping Surface 2kg",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });

    const res = await GET(
      makeRequest({ "x-diagnostics-key": SECRET }, { case: "452009" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getQuoteMock).toHaveBeenCalledWith(EXPECTED_INDORE_REQUEST);
    expect(body.testCase).toBe("452009");
  });

  it("selects the 400001 (Mumbai, out-of-Indore) test case via ?case=400001", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getQuoteMock.mockResolvedValue({
      serviceable: true,
      shipping_amount: 75,
      estimated_delivery: "2026-09-12",
      carrier: "Some National Courier",
      service: null,
      weight_used_grams: 1150,
      zone: null,
    });

    const res = await GET(
      makeRequest({ "x-diagnostics-key": SECRET }, { case: "400001" })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(getQuoteMock).toHaveBeenCalledTimes(1);
    expect(getQuoteMock).toHaveBeenCalledWith(EXPECTED_MUMBAI_REQUEST);
    expect(body).toEqual({
      testCase: "400001",
      configured: true,
      quote: {
        serviceable: true,
        shipping_amount: 75,
        estimated_delivery: "2026-09-12",
        carrier: "Some National Courier",
        service: null,
        weight_used_grams: 1150,
        zone: null,
        reason: null,
      },
    });
  });

  it("rejects an unrecognized ?case value without ever calling getQuote", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);

    const res = await GET(
      makeRequest({ "x-diagnostics-key": SECRET }, { case: "999999" })
    );
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Unknown test case.");
    // Numeric-looking string keys ("452009", "400001") are iterated by JS in
    // ascending numeric order regardless of insertion order, so compare as a
    // set rather than asserting a specific array order.
    expect([...body.knownCases].sort()).toEqual(["400001", "452009"]);
    expect(getQuoteMock).not.toHaveBeenCalled();
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
