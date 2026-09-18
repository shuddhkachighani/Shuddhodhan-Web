import type { Order } from "@/lib/types";

// Adapter for shipment creation/tracking, kept separate from the shipping
// RATE quote (lib/shipping/) — this is the "make a real shipment happen"
// half of logistics (spec sections 23-24): AWB generation, courier
// assignment, and tracking status lookup.
export interface ShipmentResult {
  awb: string;
  carrier: string;
  trackingUrl: string | null;
  // Provider's own order/shipment identifiers, when the provider has any
  // (a real courier API does; the mock provider doesn't) — persisted so a
  // real shipment can later be tracked, labeled, or cancelled at the source.
  providerOrderId?: string | null;
  providerShipmentId?: string | null;
}

// Emitted mid-createShipment() by a provider whose booking is more than one
// network call, as soon as the provider's own order exists remotely — see
// the onOrderCreated callback below. Letting the caller persist these
// before later steps (courier selection, AWB assignment) run means a retry
// after a later step fails can resume against the same provider order
// instead of creating a duplicate one.
export interface ShipmentProviderIds {
  providerOrderId: string;
  providerShipmentId: string;
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
  readonly status: "READY" | "MOCKED" | "NOT_CONFIGURED";
  // onOrderCreated is optional so a single-call provider (like the mock)
  // can ignore it entirely. A multi-step provider should call and await it
  // right after its own order exists remotely, before doing anything else
  // — see lib/logistics/shiprocket-provider.ts.
  createShipment(
    order: Order,
    onOrderCreated?: (ids: ShipmentProviderIds) => Promise<void>
  ): Promise<ShipmentResult>;
  getTrackingStatus(awb: string): Promise<TrackingUpdate>;
}
