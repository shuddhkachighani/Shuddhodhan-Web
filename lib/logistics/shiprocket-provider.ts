import { getVariant } from "@/lib/data/products";
import { siteSettings } from "@/lib/data/settings";
import { shiprocketAuth } from "@/lib/shiprocket/auth";
import type {
  LogisticsProvider,
  ShipmentProviderIds,
  ShipmentResult,
  TrackingStatus,
  TrackingUpdate,
} from "@/lib/logistics/types";
import type { Order } from "@/lib/types";

/**
 * STATUS: real Shiprocket integration — gated behind
 * SHIPROCKET_FULFILLMENT_ENABLED (see lib/logistics/index.ts), off by
 * default even when Shiprocket is already live for rate quoting
 * (lib/shipping/shiprocket-provider.ts, deliberately untouched by this
 * file — that adapter only ever calls the read-only serviceability
 * endpoint).
 *
 * Creates a real Shiprocket order (adhoc), assigns a courier + AWB to it,
 * and returns the result for lib/orders/fulfillment.ts to persist. Never
 * creates a shipment for more than one item/unit per order — see
 * resolveSinglePackage() below — because this store has no measured
 * combined-carton dimensions for multi-item or multi-unit shipments, and
 * Shiprocket's create-order API requires L/W/H as mandatory fields (unlike
 * the optional L/W/H on the serviceability endpoint). That remains an
 * explicit, intentional gap rather than an invented carton size.
 */

const CREATE_ORDER_URL = "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc";
const SERVICEABILITY_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";
const ASSIGN_AWB_URL = "https://apiv2.shiprocket.in/v1/external/courier/assign/awb";
const TRACK_AWB_URL = "https://apiv2.shiprocket.in/v1/external/courier/track/awb";

// Thrown for every failure mode below (not configured, unreachable,
// malformed response, no serviceable courier, unmeasured dimensions). The
// message is always a fixed, safe description — never a raw Shiprocket
// response body — so it's safe to log or surface upstream.
export class ShiprocketFulfillmentError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Read live (like shiprocketAuth's email/password getters), not cached via
// siteSettings — this can be checked multiple times per request (status,
// then the create-order payload) and must see the current env value.
function pickupLocation(): string {
  return process.env.SHIPROCKET_PICKUP_LOCATION || "";
}

function gramsToKg(grams: number): string {
  return (Math.round(grams) / 1000).toString();
}

// Shiprocket requires non-empty billing_customer_name and
// billing_last_name. OrderCustomer only carries a single fullName field, so
// when no surname was given we reuse the first name for both — never
// inventing a name the customer didn't provide.
function splitCustomerName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || fullName.trim();
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : firstName;
  return { firstName, lastName };
}

// Shiprocket expects "YYYY-MM-DD HH:mm". order.created_at is a UTC ISO
// timestamp; reformatted as-is (no timezone conversion attempted) since
// Shiprocket treats this as informational order metadata, not a scheduling
// instruction.
function formatOrderDate(iso: string): string {
  return iso.slice(0, 16).replace("T", " ");
}

interface SinglePackage {
  weightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

// Only a single-item, single-unit order has a known outer-parcel size: the
// ordered variant's own packed dimensions (lib/data/products.ts). Anything
// else (multiple items, or quantity > 1) would need a combined-carton size
// this store has never measured — refuse rather than guess.
function resolveSinglePackage(order: Order): SinglePackage {
  if (order.items.length !== 1 || order.items[0].quantity !== 1) {
    throw new ShiprocketFulfillmentError(
      "SHIPROCKET_DIMENSIONS_UNAVAILABLE: combined-carton dimensions for multi-item or multi-unit orders are not yet measured — cannot book a real Shiprocket shipment for this order automatically."
    );
  }

  const item = order.items[0];
  const variant = getVariant(item.productId, item.variantId);
  if (!variant) {
    throw new ShiprocketFulfillmentError(
      "SHIPROCKET_VARIANT_NOT_FOUND: could not resolve the ordered product variant for weight/dimensions."
    );
  }

  return {
    weightGrams: variant.weightGrams,
    lengthCm: variant.lengthCm,
    widthCm: variant.widthCm,
    heightCm: variant.heightCm,
  };
}

async function callShiprocket(
  url: string,
  token: string,
  init: RequestInit = {}
): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new ShiprocketFulfillmentError("SHIPROCKET_UNREACHABLE: could not reach Shiprocket right now.");
  }

  if (!res.ok) {
    throw new ShiprocketFulfillmentError(`SHIPROCKET_REQUEST_FAILED: status ${res.status}.`);
  }

  try {
    return await res.json();
  } catch {
    throw new ShiprocketFulfillmentError(
      "SHIPROCKET_UNREADABLE_RESPONSE: response was not valid JSON."
    );
  }
}

interface ShiprocketCreateOrderResponse {
  order_id: number;
  shipment_id: number;
}

function isCreateOrderResponse(value: unknown): value is ShiprocketCreateOrderResponse {
  return (
    isRecord(value) &&
    typeof value.order_id === "number" &&
    typeof value.shipment_id === "number"
  );
}

// Exact response shape confirmed only via third-party mirrors of the
// official contract, same caveat as lib/shipping/shiprocket-provider.ts —
// treated as untrusted input throughout.
interface CourierOption {
  courier_company_id: number;
  rate: number;
}

function isCourierOption(value: unknown): value is CourierOption {
  return (
    isRecord(value) && typeof value.courier_company_id === "number" && typeof value.rate === "number"
  );
}

function pickCheapestCourierId(json: unknown): number | null {
  if (!isRecord(json) || !isRecord(json.data)) return null;
  const list = json.data.available_courier_companies;
  if (!Array.isArray(list)) return null;
  const couriers = list.filter(isCourierOption);
  if (couriers.length === 0) return null;
  return couriers.reduce((best, courier) => (courier.rate < best.rate ? courier : best))
    .courier_company_id;
}

function parseAwbAssignment(json: unknown): { awb: string; carrier: string } | null {
  if (!isRecord(json) || !isRecord(json.response) || !isRecord(json.response.data)) return null;
  const data = json.response.data;
  const awb = data.awb_code;
  const carrier = data.courier_name;
  if (typeof awb !== "string" || !awb || typeof carrier !== "string" || !carrier) return null;
  return { awb, carrier };
}

const TRACKING_STATUS_MAP: Record<string, TrackingStatus> = {
  delivered: "delivered",
  "out for delivery": "out_for_delivery",
  "in transit": "shipped",
  shipped: "shipped",
  "pickup generated": "processing",
  "pickup scheduled": "processing",
  new: "processing",
  cancelled: "exception",
  rto: "exception",
  undelivered: "exception",
};

// Unknown/unrecognized raw status strings default to "processing" rather
// than "exception" — a safer default than raising a false alarm.
function mapTrackingStatus(raw: string | null): TrackingStatus {
  if (!raw) return "processing";
  return TRACKING_STATUS_MAP[raw.trim().toLowerCase()] ?? "processing";
}

function extractTrackingStatus(json: unknown): string | null {
  if (!isRecord(json) || !isRecord(json.tracking_data)) return null;
  const raw = json.tracking_data.shipment_status ?? json.tracking_data.current_status;
  return typeof raw === "string" ? raw : null;
}

export class ShiprocketLogisticsProvider implements LogisticsProvider {
  readonly name = "shiprocket";

  get status(): "READY" | "MOCKED" | "NOT_CONFIGURED" {
    return shiprocketAuth.status === "READY" && pickupLocation() ? "READY" : "NOT_CONFIGURED";
  }

  async createShipment(
    order: Order,
    onOrderCreated?: (ids: ShipmentProviderIds) => Promise<void>
  ): Promise<ShipmentResult> {
    if (this.status !== "READY") {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_NOT_CONFIGURED: set SHIPROCKET_API_EMAIL, SHIPROCKET_API_PASSWORD and SHIPROCKET_PICKUP_LOCATION."
      );
    }

    const pkg = resolveSinglePackage(order);

    let token: string;
    try {
      token = await shiprocketAuth.getToken();
    } catch {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_AUTH_FAILED: could not authenticate with Shiprocket."
      );
    }

    let shiprocketOrderId: number;
    let shiprocketShipmentId: number;

    const resumeOrderId = order.shiprocket_order_id ? Number(order.shiprocket_order_id) : NaN;
    const resumeShipmentId = order.shiprocket_shipment_id ? Number(order.shiprocket_shipment_id) : NaN;

    if (Number.isFinite(resumeOrderId) && Number.isFinite(resumeShipmentId)) {
      // A previous attempt already created this Shiprocket order (its IDs
      // were persisted via onOrderCreated immediately after creation) but
      // failed before AWB assignment completed. Resume from here instead
      // of creating a second Shiprocket order for the same paid order.
      shiprocketOrderId = resumeOrderId;
      shiprocketShipmentId = resumeShipmentId;
    } else {
      const { firstName, lastName } = splitCustomerName(order.customer.fullName);

      const createJson = await callShiprocket(CREATE_ORDER_URL, token, {
        method: "POST",
        body: JSON.stringify({
          order_id: order.order_id,
          order_date: formatOrderDate(order.created_at),
          pickup_location: pickupLocation(),
          billing_customer_name: firstName,
          billing_last_name: lastName,
          billing_address: order.customer.address,
          billing_city: order.customer.city,
          billing_pincode: order.customer.pincode,
          billing_state: order.customer.state,
          billing_country: "India",
          billing_email: order.customer.email,
          billing_phone: order.customer.mobile,
          shipping_is_billing: true,
          order_items: order.items.map((item) => ({
            name: `${item.productName} (${item.variantSize})`,
            sku: item.variantId,
            units: item.quantity,
            selling_price: item.sellingPrice,
          })),
          payment_method: "Prepaid",
          sub_total: order.subtotal,
          length: pkg.lengthCm,
          breadth: pkg.widthCm,
          height: pkg.heightCm,
          weight: gramsToKg(pkg.weightGrams),
        }),
      });

      if (!isCreateOrderResponse(createJson)) {
        throw new ShiprocketFulfillmentError(
          "SHIPROCKET_CREATE_ORDER_MALFORMED: response did not include order_id and shipment_id."
        );
      }
      ({ order_id: shiprocketOrderId, shipment_id: shiprocketShipmentId } = createJson);

      if (onOrderCreated) {
        // Persist before doing anything else — if courier selection or AWB
        // assignment below fails, a retry must be able to resume against
        // this same Shiprocket order rather than create another one.
        await onOrderCreated({
          providerOrderId: String(shiprocketOrderId),
          providerShipmentId: String(shiprocketShipmentId),
        });
      }
    }

    const serviceabilityParams = new URLSearchParams({
      pickup_postcode: siteSettings.shipping.originPincode,
      delivery_postcode: order.customer.pincode,
      weight: gramsToKg(pkg.weightGrams),
      cod: "0",
    });
    const serviceabilityJson = await callShiprocket(
      `${SERVICEABILITY_URL}?${serviceabilityParams.toString()}`,
      token
    );
    const courierId = pickCheapestCourierId(serviceabilityJson);
    if (courierId === null) {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_NO_COURIER: no courier is currently serviceable to assign an AWB for this shipment."
      );
    }

    const assignJson = await callShiprocket(ASSIGN_AWB_URL, token, {
      method: "POST",
      body: JSON.stringify({ shipment_id: shiprocketShipmentId, courier_id: courierId }),
    });
    const assigned = parseAwbAssignment(assignJson);
    if (!assigned) {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_AWB_ASSIGN_MALFORMED: response did not include an AWB code."
      );
    }

    return {
      awb: assigned.awb,
      carrier: assigned.carrier,
      trackingUrl: `https://shiprocket.co/tracking/${assigned.awb}`,
      providerOrderId: String(shiprocketOrderId),
      providerShipmentId: String(shiprocketShipmentId),
    };
  }

  async getTrackingStatus(awb: string): Promise<TrackingUpdate> {
    if (this.status !== "READY") {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_NOT_CONFIGURED: cannot look up tracking without Shiprocket credentials."
      );
    }

    let token: string;
    try {
      token = await shiprocketAuth.getToken();
    } catch {
      throw new ShiprocketFulfillmentError(
        "SHIPROCKET_AUTH_FAILED: could not authenticate with Shiprocket."
      );
    }

    const json = await callShiprocket(`${TRACK_AWB_URL}/${encodeURIComponent(awb)}`, token);

    return {
      status: mapTrackingStatus(extractTrackingStatus(json)),
      lastLocation: null,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const shiprocketLogisticsProvider = new ShiprocketLogisticsProvider();
