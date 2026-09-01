import type { Order } from "@/lib/types";

// Adapter for shipment creation/tracking, kept separate from the shipping
// RATE quote (lib/shipping/) — this is the "make a real shipment happen"
// half of logistics (spec sections 23-24): AWB generation, courier
// assignment, and tracking status lookup.
export interface ShipmentResult {
  awb: string;
  carrier: string;
  trackingUrl: string | null;
}

export type TrackingStatus =
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "exception";

export interface TrackingUpdate {
  status: TrackingStatus;
  lastLocation: string | null;
  updatedAt: string;
}

export interface LogisticsProvider {
  readonly name: string;
  readonly status: "READY" | "MOCKED";
  createShipment(order: Order): Promise<ShipmentResult>;
  getTrackingStatus(awb: string): Promise<TrackingUpdate>;
}
