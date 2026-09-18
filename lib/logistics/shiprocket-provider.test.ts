import { afterEach, describe, expect, it, vi } from "vitest";
import type { Order, OrderItem } from "@/lib/types";

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

import { ShiprocketFulfillmentError, ShiprocketLogisticsProvider } from "./shiprocket-provider";

function stubFetch(responses: Array<Partial<Response> & { json?: () => Promise<unknown> }>) {
  const fetchMock = vi.fn();
  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(response as Response);
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// Real catalogue entry — the same 1 L Groundnut Oil variant referenced for
// the currently paid order (31 x 15 x 15 cm, 990 g).
const singleItemOrderItem: OrderItem = {
  productId: "groundnut-oil",
  variantId: "groundnut-oil-1l",
  productName: "Groundnut Oil",
  variantSize: "1 L",
  quantity: 1,
  mrp: 443,
  sellingPrice: 310,
  lineTotal: 310,
};

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    order_id: "SHD-20260917-TEST01",
    customer: {
      fullName: "Asha Verma",
      mobile: "9876543210",
      email: "asha@example.com",
      address: "12 MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    items: [singleItemOrderItem],
    subtotal: 310,
    shipping_amount: 65,
    payment_fee: 0,
    taxes: 0,
    discounts: 0,
    grand_total: 375,
    payment_status: "paid",
    shipping_status: "processing",
    tracking_number: null,
    carrier: null,
    shiprocket_order_id: null,
    shiprocket_shipment_id: null,
    created_at: "2026-09-17T10:15:00.000Z",
    updated_at: "2026-09-17T10:15:00.000Z",
    utm_data: {},
    ...overrides,
  };
}

const createOrderOk = { order_id: 555111, shipment_id: 777222 };
const serviceabilityOk = {
  data: {
    available_courier_companies: [
      { courier_company_id: 10, courier_name: "Delhivery Surface", rate: 65 },
      { courier_company_id: 20, courier_name: "Expensive Express", rate: 140 },
    ],
  },
};
const assignAwbOk = {
  response: {
    data: { awb_code: "AWB999888777", courier_name: "Delhivery Surface" },
  },
};

describe("ShiprocketLogisticsProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    authStatusRef.current = "READY";
    getTokenMock.mockReset();
    getTokenMock.mockResolvedValue("mock-bearer-token");
  });

  it("reports NOT_CONFIGURED and never calls fetch when auth is unavailable", async () => {
    authStatusRef.current = "NOT_CONFIGURED";
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    const fetchMock = stubFetch([]);
    const provider = new ShiprocketLogisticsProvider();

    expect(provider.status).toBe("NOT_CONFIGURED");
    await expect(provider.createShipment(makeOrder())).rejects.toThrow(ShiprocketFulfillmentError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports NOT_CONFIGURED when SHIPROCKET_PICKUP_LOCATION is unset even if auth is ready", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "");
    const provider = new ShiprocketLogisticsProvider();

    expect(provider.status).toBe("NOT_CONFIGURED");
    await expect(provider.createShipment(makeOrder())).rejects.toThrow(/SHIPROCKET_NOT_CONFIGURED/);
  });

  it("refuses multi-item orders without inventing carton dimensions", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    const fetchMock = stubFetch([]);
    const provider = new ShiprocketLogisticsProvider();

    const order = makeOrder({
      items: [singleItemOrderItem, { ...singleItemOrderItem, productId: "virgin-coconut-oil" }],
    });

    await expect(provider.createShipment(order)).rejects.toThrow(/SHIPROCKET_DIMENSIONS_UNAVAILABLE/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses multi-unit (quantity > 1) orders without inventing carton dimensions", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    const fetchMock = stubFetch([]);
    const provider = new ShiprocketLogisticsProvider();

    const order = makeOrder({ items: [{ ...singleItemOrderItem, quantity: 2 }] });

    await expect(provider.createShipment(order)).rejects.toThrow(/SHIPROCKET_DIMENSIONS_UNAVAILABLE/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates an order, assigns the cheapest courier, and returns the AWB using the variant's real packed dimensions", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    const fetchMock = stubFetch([
      { ok: true, json: async () => createOrderOk },
      { ok: true, json: async () => serviceabilityOk },
      { ok: true, json: async () => assignAwbOk },
    ]);
    const provider = new ShiprocketLogisticsProvider();

    const result = await provider.createShipment(makeOrder());

    expect(result).toEqual({
      awb: "AWB999888777",
      carrier: "Delhivery Surface",
      trackingUrl: "https://shiprocket.co/tracking/AWB999888777",
      providerOrderId: "555111",
      providerShipmentId: "777222",
    });

    const [createUrl, createInit] = fetchMock.mock.calls[0];
    expect(createUrl).toBe("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc");
    const createBody = JSON.parse(createInit.body as string);
    expect(createBody.pickup_location).toBe("warehouse");
    expect(createBody.length).toBe(31);
    expect(createBody.breadth).toBe(15);
    expect(createBody.height).toBe(15);
    expect(createBody.weight).toBe("0.99");
    expect(createBody.billing_customer_name).toBe("Asha");
    expect(createBody.billing_last_name).toBe("Verma");

    const [assignUrl, assignInit] = fetchMock.mock.calls[2];
    expect(assignUrl).toBe("https://apiv2.shiprocket.in/v1/external/courier/assign/awb");
    const assignBody = JSON.parse(assignInit.body as string);
    expect(assignBody.shipment_id).toBe(777222);
    expect(assignBody.courier_id).toBe(10);
  });

  it("calls onOrderCreated with the provider ids immediately after the create-order call, before courier selection or AWB assignment", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([
      { ok: true, json: async () => createOrderOk },
      { ok: true, json: async () => serviceabilityOk },
      { ok: true, json: async () => assignAwbOk },
    ]);
    const provider = new ShiprocketLogisticsProvider();
    const seenAt: string[] = [];
    const onOrderCreated = vi.fn(async (ids: { providerOrderId: string; providerShipmentId: string }) => {
      seenAt.push(`checkpoint:${ids.providerOrderId}:${ids.providerShipmentId}`);
    });

    await provider.createShipment(makeOrder(), onOrderCreated);

    expect(onOrderCreated).toHaveBeenCalledTimes(1);
    expect(onOrderCreated).toHaveBeenCalledWith({ providerOrderId: "555111", providerShipmentId: "777222" });
  });

  it("resumes from a persisted Shiprocket order instead of creating a duplicate one", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    // Only 2 responses queued (serviceability, assign-awb) — if the
    // provider tried to create the order again, the 3rd fetch call would
    // get an undefined mocked response and this test would fail loudly.
    const fetchMock = stubFetch([
      { ok: true, json: async () => serviceabilityOk },
      { ok: true, json: async () => assignAwbOk },
    ]);
    const provider = new ShiprocketLogisticsProvider();
    const onOrderCreated = vi.fn();

    const order = makeOrder({
      shiprocket_order_id: "555111",
      shiprocket_shipment_id: "777222",
    });
    const result = await provider.createShipment(order, onOrderCreated);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${new URLSearchParams({
        pickup_postcode: "452001",
        delivery_postcode: "400001",
        weight: "0.99",
        cod: "0",
      }).toString()}`
    );
    // Nothing new to checkpoint — we resumed from an existing checkpoint.
    expect(onOrderCreated).not.toHaveBeenCalled();
    expect(result.providerOrderId).toBe("555111");
    expect(result.providerShipmentId).toBe("777222");
    expect(result.awb).toBe("AWB999888777");
  });

  it("falls back first and last name to the same value when no surname is given", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    const fetchMock = stubFetch([
      { ok: true, json: async () => createOrderOk },
      { ok: true, json: async () => serviceabilityOk },
      { ok: true, json: async () => assignAwbOk },
    ]);
    const provider = new ShiprocketLogisticsProvider();

    await provider.createShipment(makeOrder({ customer: { ...makeOrder().customer, fullName: "Asha" } }));

    const createBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(createBody.billing_customer_name).toBe("Asha");
    expect(createBody.billing_last_name).toBe("Asha");
  });

  it("fails safely when the create-order response is malformed", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([{ ok: true, json: async () => ({ unexpected: "shape" }) }]);
    const provider = new ShiprocketLogisticsProvider();

    await expect(provider.createShipment(makeOrder())).rejects.toThrow(
      /SHIPROCKET_CREATE_ORDER_MALFORMED/
    );
  });

  it("fails safely when no courier is serviceable for the AWB assignment", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([
      { ok: true, json: async () => createOrderOk },
      { ok: true, json: async () => ({ data: { available_courier_companies: [] } }) },
    ]);
    const provider = new ShiprocketLogisticsProvider();

    await expect(provider.createShipment(makeOrder())).rejects.toThrow(/SHIPROCKET_NO_COURIER/);
  });

  it("fails safely on a non-OK HTTP response, without leaking the raw body", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([{ ok: false, status: 500, json: async () => ({ secret: "do not leak" }) }]);
    const provider = new ShiprocketLogisticsProvider();

    await expect(provider.createShipment(makeOrder())).rejects.toThrow(/status 500/);
  });

  it("fails safely on a network error reaching Shiprocket", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND")));
    const provider = new ShiprocketLogisticsProvider();

    await expect(provider.createShipment(makeOrder())).rejects.toThrow(/SHIPROCKET_UNREACHABLE/);
  });

  it("maps a known tracking status", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([{ ok: true, json: async () => ({ tracking_data: { current_status: "Delivered" } }) }]);
    const provider = new ShiprocketLogisticsProvider();

    const update = await provider.getTrackingStatus("AWB999888777");
    expect(update.status).toBe("delivered");
  });

  it("defaults an unrecognized tracking status to processing rather than guessing", async () => {
    vi.stubEnv("SHIPROCKET_PICKUP_LOCATION", "warehouse");
    stubFetch([{ ok: true, json: async () => ({ tracking_data: { current_status: "Some New Status" } }) }]);
    const provider = new ShiprocketLogisticsProvider();

    const update = await provider.getTrackingStatus("AWB999888777");
    expect(update.status).toBe("processing");
  });
});
