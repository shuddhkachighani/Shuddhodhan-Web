import type {
  LogisticsProvider,
  ShipmentResult,
  TrackingUpdate,
} from "@/lib/logistics/types";
import type { Order } from "@/lib/types";

/**
 * STATUS: MOCKED — placeholder only, not production ready.
 *
 * Stands in for a real logistics API (Shiprocket, Delhivery, a direct
 * carrier, etc.) that would actually book a shipment and return a real AWB.
 * Generates a deterministic-looking but fake tracking number so the order →
 * shipment → tracking flow is testable end-to-end. Replace with a real
 * adapter implementing LogisticsProvider before this ships to real
 * customers — see lib/shipping/mock-national-provider.ts for the equivalent
 * rate-side placeholder.
 */
export class MockLogisticsProvider implements LogisticsProvider {
  readonly name = "mock-logistics";
  readonly status = "MOCKED" as const;

  async createShipment(order: Order): Promise<ShipmentResult> {
    const awb = `MOCKAWB${order.order_id.replace(/[^0-9A-Z]/g, "").slice(-10)}`;
    return {
      awb,
      carrier: order.carrier || "Placeholder Carrier (mocked)",
      trackingUrl: null,
    };
  }

  async getTrackingStatus(awb: string): Promise<TrackingUpdate> {
    void awb;
    return {
      status: "processing",
      lastLocation: null,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const mockLogisticsProvider = new MockLogisticsProvider();
