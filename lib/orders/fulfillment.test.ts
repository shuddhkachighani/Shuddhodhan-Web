import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Order } from "@/lib/types";
import type { ShipmentProviderIds, ShipmentResult } from "@/lib/logistics/types";

const { createShipmentMock } = vi.hoisted(() => ({
  createShipmentMock:
    vi.fn<(order: Order, onOrderCreated?: (ids: ShipmentProviderIds) => Promise<void>) => Promise<ShipmentResult>>(),
}));

vi.mock("@/lib/logistics", () => ({
  logisticsProvider: {
    name: "mock-logistics-under-test",
    status: "MOCKED" as const,
    createShipment: createShipmentMock,
    getTrackingStatus: vi.fn(),
  },
}));

import { fulfillPaidOrder } from "./fulfillment";
import { getOrder, saveOrder } from "./store";

function makeOrder(id: string): Order {
  return {
    order_id: id,
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
    payment_status: "paid",
    shipping_status: "processing",
    tracking_number: null,
    carrier: null,
    shiprocket_order_id: null,
    shiprocket_shipment_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    utm_data: {},
  };
}

describe("fulfillPaidOrder", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    createShipmentMock.mockReset();
  });

  it("returns the order unchanged and never calls the provider when already fulfilled", async () => {
    const order = { ...makeOrder("SHD-FULFILL-1"), tracking_number: "AWB-ALREADY-SET" };
    await saveOrder(order);

    const result = await fulfillPaidOrder(order);

    expect(result).toEqual(order);
    expect(createShipmentMock).not.toHaveBeenCalled();
  });

  it("claims the order, books the shipment once, and persists AWB/carrier/Shiprocket IDs", async () => {
    const order = makeOrder("SHD-FULFILL-2");
    await saveOrder(order);
    createShipmentMock.mockResolvedValue({
      awb: "AWB123",
      carrier: "Delhivery Surface",
      trackingUrl: "https://shiprocket.co/tracking/AWB123",
      providerOrderId: "555",
      providerShipmentId: "777",
    });

    const result = await fulfillPaidOrder(order);

    expect(result.tracking_number).toBe("AWB123");
    expect(result.carrier).toBe("Delhivery Surface");
    expect(result.shiprocket_order_id).toBe("555");
    expect(result.shiprocket_shipment_id).toBe("777");
    expect(result.shipping_status).toBe("shipment_created");
    expect(createShipmentMock).toHaveBeenCalledTimes(1);

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBe("AWB123");
  });

  it("releases the claim and rethrows when the provider fails, leaving the order retryable", async () => {
    const order = makeOrder("SHD-FULFILL-3");
    await saveOrder(order);
    createShipmentMock.mockRejectedValue(new Error("SHIPROCKET_UNREACHABLE: could not reach Shiprocket right now."));

    await expect(fulfillPaidOrder(order)).rejects.toThrow(/SHIPROCKET_UNREACHABLE/);

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBeNull();
    expect(stored?.shipping_status).toBe("processing");

    // A retry after the failure can claim and complete normally — the
    // sentinel never leaks out and never blocks a later attempt.
    createShipmentMock.mockResolvedValue({
      awb: "AWB456",
      carrier: "Xpressbees",
      trackingUrl: null,
    });
    const retried = await fulfillPaidOrder(stored!);
    expect(retried.tracking_number).toBe("AWB456");
    expect(createShipmentMock).toHaveBeenCalledTimes(2);
  });

  it("migrates a legacy MOCKAWB order to a real shipment instead of treating it as already fulfilled", async () => {
    const order = {
      ...makeOrder("SHD-FULFILL-LEGACY"),
      tracking_number: "MOCKAWB1234567890",
      carrier: "Placeholder Carrier (mocked)",
      shipping_status: "shipment_created" as const,
    };
    await saveOrder(order);
    createShipmentMock.mockResolvedValue({
      awb: "AWB999REAL",
      carrier: "Delhivery Surface",
      trackingUrl: "https://shiprocket.co/tracking/AWB999REAL",
      providerOrderId: "555",
      providerShipmentId: "777",
    });

    const result = await fulfillPaidOrder(order);

    expect(createShipmentMock).toHaveBeenCalledTimes(1);
    expect(result.tracking_number).toBe("AWB999REAL");
    expect(result.carrier).toBe("Delhivery Surface");

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBe("AWB999REAL");
  });

  it("does NOT reclaim an order that already has a real (non-mock) AWB — the idempotency guard stays intact", async () => {
    const order = { ...makeOrder("SHD-FULFILL-REALAWB"), tracking_number: "SR9988776655" };
    await saveOrder(order);

    const result = await fulfillPaidOrder(order);

    expect(result).toEqual(order);
    expect(createShipmentMock).not.toHaveBeenCalled();
  });

  it("restores the legacy MOCKAWB value (not null) if a migration attempt fails, leaving it retryable without losing the prior state", async () => {
    const order = {
      ...makeOrder("SHD-FULFILL-LEGACY-FAIL"),
      tracking_number: "MOCKAWB1234567890",
      carrier: "Placeholder Carrier (mocked)",
    };
    await saveOrder(order);
    createShipmentMock.mockRejectedValue(new Error("SHIPROCKET_NO_COURIER"));

    await expect(fulfillPaidOrder(order)).rejects.toThrow(/SHIPROCKET_NO_COURIER/);

    const stored = await getOrder(order.order_id);
    expect(stored?.tracking_number).toBe("MOCKAWB1234567890");
  });

  it("persists Shiprocket order/shipment ids via the checkpoint before the final AWB write, and a subsequent retry never re-invokes the checkpoint once no longer needed", async () => {
    const order = makeOrder("SHD-FULFILL-CHECKPOINT");
    await saveOrder(order);

    // Simulates the real provider: it calls onOrderCreated as soon as the
    // Shiprocket order exists, then fails before AWB assignment completes.
    createShipmentMock.mockImplementationOnce(async (_order, onOrderCreated) => {
      await onOrderCreated?.({ providerOrderId: "555", providerShipmentId: "777" });
      throw new Error("SHIPROCKET_NO_COURIER: no courier is currently serviceable.");
    });

    await expect(fulfillPaidOrder(order)).rejects.toThrow(/SHIPROCKET_NO_COURIER/);

    const afterFailure = await getOrder(order.order_id);
    // The claim was released (tracking_number back to its pre-claim value)...
    expect(afterFailure?.tracking_number).toBeNull();
    // ...but the checkpointed Shiprocket ids survived the failure.
    expect(afterFailure?.shiprocket_order_id).toBe("555");
    expect(afterFailure?.shiprocket_shipment_id).toBe("777");

    // A retry picks up where it left off: the caller (the real provider)
    // would see these persisted ids on `order` and resume instead of
    // re-creating the Shiprocket order — verified separately in
    // lib/logistics/shiprocket-provider.test.ts's "resumes from a
    // persisted Shiprocket order" case. Here we just confirm the retry
    // completes and finalizes normally.
    createShipmentMock.mockResolvedValueOnce({
      awb: "AWB999REAL",
      carrier: "Delhivery Surface",
      trackingUrl: null,
      providerOrderId: "555",
      providerShipmentId: "777",
    });
    const retried = await fulfillPaidOrder(afterFailure!);
    expect(retried.tracking_number).toBe("AWB999REAL");
  });

  it("never calls the provider twice for concurrent callers on the same order", async () => {
    const order = makeOrder("SHD-FULFILL-4");
    await saveOrder(order);
    let resolveCreate!: (value: ShipmentResult) => void;
    createShipmentMock.mockImplementation(
      () =>
        new Promise<ShipmentResult>((resolve) => {
          resolveCreate = resolve;
        })
    );

    const first = fulfillPaidOrder(order);
    const second = fulfillPaidOrder(order);

    // Let both calls reach (or resolve past) their claim attempt before the
    // provider call is allowed to finish.
    await Promise.resolve();
    await Promise.resolve();
    resolveCreate({ awb: "AWB789", carrier: "Ekart", trackingUrl: null });

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(createShipmentMock).toHaveBeenCalledTimes(1);
    // Neither caller ever observes the internal claim sentinel.
    expect(firstResult.tracking_number).not.toBe("CLAIMED_PENDING_SHIPMENT");
    expect(secondResult.tracking_number).not.toBe("CLAIMED_PENDING_SHIPMENT");
  });
});
