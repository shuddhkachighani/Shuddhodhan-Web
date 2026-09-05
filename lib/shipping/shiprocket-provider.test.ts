import { afterEach, describe, expect, it, vi } from "vitest";

const { getTokenMock, authStatusRef } = vi.hoisted(() => ({
  getTokenMock: vi.fn(),
  authStatusRef: { current: "READY" as "READY" | "NOT_CONFIGURED" },
}));

vi.mock("@/lib/shiprocket/auth", () => ({
  shiprocketAuth: {
    get status() {
      return authStatusRef.current;
    },
    getToken: getTokenMock,
  },
}));

import { ShiprocketProvider } from "./shiprocket-provider";

function stubFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function courierPayload(companies: unknown[]) {
  return { status: 200, data: { available_courier_companies: companies } };
}

const baseRequest = {
  pincode: "110001",
  cartWeightGrams: 1150,
  cartValue: 356,
  lines: [],
};

describe("ShiprocketProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    authStatusRef.current = "READY";
    getTokenMock.mockReset();
    getTokenMock.mockResolvedValue("mock-bearer-token");
  });

  it("reports NOT_CONFIGURED and fails safely without calling fetch when auth is unavailable", async () => {
    authStatusRef.current = "NOT_CONFIGURED";
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    expect(provider.status).toBe("NOT_CONFIGURED");
    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.shipping_amount).toBe(0);
    expect(quote.reason).toMatch(/not configured/i);
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails safely when authentication itself fails", async () => {
    getTokenMock.mockRejectedValue(new Error("SHIPROCKET_AUTH_FAILED: login request returned status 401."));
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/authentication failed/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a successful quote from a valid serviceability response", async () => {
    stubFetch({
      ok: true,
      json: async () =>
        courierPayload([
          { courier_company_id: 10, courier_name: "Delhivery Surface", rate: 65, etd: "2026-09-10" },
        ]),
    });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(true);
    expect(quote.shipping_amount).toBe(65);
    expect(quote.carrier).toBe("Delhivery Surface");
    expect(quote.estimated_delivery).toBe("2026-09-10");
    expect(quote.weight_used_grams).toBe(baseRequest.cartWeightGrams);
  });

  it("sends the correct pickup and delivery pincodes", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    await provider.getQuote(baseRequest);

    const [calledUrl] = fetchMock.mock.calls[0];
    const params = new URL(calledUrl).searchParams;
    expect(params.get("pickup_postcode")).toBe("452001");
    expect(params.get("delivery_postcode")).toBe("110001");
  });

  it("sends weight in kg, derived from the already-allowance-adjusted cartWeightGrams", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    await provider.getQuote({ ...baseRequest, cartWeightGrams: 2300 });

    const [calledUrl] = fetchMock.mock.calls[0];
    const params = new URL(calledUrl).searchParams;
    expect(params.get("weight")).toBe("2.3");
  });

  it("always sends cod=0 (this store is prepaid-only)", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    await provider.getQuote(baseRequest);

    const [calledUrl] = fetchMock.mock.calls[0];
    expect(new URL(calledUrl).searchParams.get("cod")).toBe("0");
  });

  it("sends declared_value from the server-calculated cart value", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    await provider.getQuote(baseRequest);

    const [calledUrl] = fetchMock.mock.calls[0];
    expect(new URL(calledUrl).searchParams.get("declared_value")).toBe("356");
  });

  it("never sends length, breadth or height", async () => {
    const fetchMock = stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    await provider.getQuote(baseRequest);

    const [calledUrl] = fetchMock.mock.calls[0];
    const params = new URL(calledUrl).searchParams;
    expect(params.has("length")).toBe(false);
    expect(params.has("breadth")).toBe(false);
    expect(params.has("height")).toBe(false);
  });

  it("picks the cheapest of multiple serviceable couriers", async () => {
    stubFetch({
      ok: true,
      json: async () =>
        courierPayload([
          { courier_company_id: 1, courier_name: "Expensive Express", rate: 140 },
          { courier_company_id: 2, courier_name: "Budget Surface", rate: 58 },
          { courier_company_id: 3, courier_name: "Mid Tier", rate: 90 },
        ]),
    });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.carrier).toBe("Budget Surface");
    expect(quote.shipping_amount).toBe(58);
  });

  it("fails safely when no courier is serviceable", async () => {
    stubFetch({ ok: true, json: async () => courierPayload([]) });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/no courier is currently serviceable/i);
  });

  it("fails safely on a non-OK HTTP response", async () => {
    stubFetch({ ok: false, status: 500, json: async () => ({ message: "Internal error" }) });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/status 500/);
  });

  it("fails safely on a malformed (structurally unexpected) response", async () => {
    stubFetch({ ok: true, json: async () => ({ unexpected: "shape" }) });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/unexpected response/i);
  });

  it("fails safely when the response body is not valid JSON", async () => {
    stubFetch({
      ok: true,
      json: async () => {
        throw new Error("Unexpected token in JSON");
      },
    });
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/unreadable response/i);
  });

  it("fails safely on a network error reaching Shiprocket", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND")));
    const provider = new ShiprocketProvider();

    const quote = await provider.getQuote(baseRequest);

    expect(quote.serviceable).toBe(false);
    expect(quote.reason).toMatch(/could not reach shiprocket/i);
  });
});
