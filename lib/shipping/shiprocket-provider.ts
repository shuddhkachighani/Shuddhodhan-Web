import { siteSettings } from "@/lib/data/settings";
import { shiprocketAuth } from "@/lib/shiprocket/auth";
import type { ShippingProvider } from "@/lib/shipping/types";
import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

/**
 * STATUS: not wired into lib/shipping/index.ts yet — see that file for the
 * live Indore-then-national provider chain. This adapter only checks
 * courier serviceability/rate; it never creates a Shiprocket order,
 * shipment, or AWB (that's a separate future adapter under lib/logistics).
 *
 * Rate lookup only. Deliberately omits length/breadth/height: the
 * documented Shiprocket serviceability endpoint accepts them as optional,
 * but this store's combined-carton dimensions are order-dependent and have
 * not been measured yet, so we send weight only rather than inventing a
 * carton size (see the Shiprocket API contract research for this session).
 */

const SERVICEABILITY_URL = "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";

// Thrown internally for an HTTP-successful but structurally unexpected
// response. Never includes the raw response body in its message.
class ShiprocketRateError extends Error {}

// The exact response shape is only confirmed via third-party mirrors of the
// official contract (apidocs.shiprocket.in itself was unreachable during
// research), so this is treated as untrusted input: every field is checked
// at runtime rather than cast with `any`. courier_company_id, courier_name
// and rate are the fields we depend on; the rest are best-effort extras
// captured for a future shipment-creation flow.
interface ShiprocketCourierOption {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd?: string;
  estimated_delivery_days?: string | number;
  chargeable_weight?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCourierRecord(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.courier_company_id === "number" &&
    typeof value.courier_name === "string" &&
    typeof value.rate === "number"
  );
}

function toCourierOption(value: Record<string, unknown>): ShiprocketCourierOption {
  return {
    courier_company_id: value.courier_company_id as number,
    courier_name: value.courier_name as string,
    rate: value.rate as number,
    etd: typeof value.etd === "string" ? value.etd : undefined,
    estimated_delivery_days:
      typeof value.estimated_delivery_days === "string" ||
      typeof value.estimated_delivery_days === "number"
        ? value.estimated_delivery_days
        : undefined,
    chargeable_weight: typeof value.chargeable_weight === "number" ? value.chargeable_weight : undefined,
  };
}

// Validates the minimum shape we depend on (data.available_courier_companies
// as an array) and drops any array entries missing the fields we require,
// rather than trusting the whole payload.
function parseServiceabilityResponse(json: unknown): ShiprocketCourierOption[] {
  if (!isRecord(json) || !isRecord(json.data)) {
    throw new ShiprocketRateError("SHIPROCKET_RATE_MALFORMED: response did not include a data object.");
  }

  const list = json.data.available_courier_companies;
  if (!Array.isArray(list)) {
    throw new ShiprocketRateError(
      "SHIPROCKET_RATE_MALFORMED: response did not include available_courier_companies."
    );
  }

  return list.filter(isCourierRecord).map(toCourierOption);
}

function gramsToKg(grams: number): string {
  return (Math.round(grams) / 1000).toString();
}

function notServiceable(request: ShippingQuoteRequest, reason: string): ShippingQuoteResponse {
  return {
    serviceable: false,
    shipping_amount: 0,
    estimated_delivery: null,
    carrier: null,
    service: null,
    weight_used_grams: request.cartWeightGrams,
    zone: null,
    reason,
  };
}

export class ShiprocketProvider implements ShippingProvider {
  readonly name = "shiprocket";

  get status(): "READY" | "MOCKED" | "NOT_CONFIGURED" {
    return shiprocketAuth.status === "READY" ? "READY" : "NOT_CONFIGURED";
  }

  async getQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
    if (this.status !== "READY") {
      return notServiceable(request, "Shiprocket is not configured.");
    }

    let token: string;
    try {
      token = await shiprocketAuth.getToken();
    } catch {
      return notServiceable(request, "Shiprocket authentication failed.");
    }

    // request.cartWeightGrams already includes the packing-weight allowance
    // applied upstream by lib/shipping/index.ts — this provider does not
    // re-derive or adjust weight itself.
    const params = new URLSearchParams({
      pickup_postcode: siteSettings.shipping.originPincode,
      delivery_postcode: request.pincode,
      weight: gramsToKg(request.cartWeightGrams),
      cod: "0",
    });
    if (request.cartValue > 0) {
      params.set("declared_value", String(request.cartValue));
    }

    let res: Response;
    try {
      res = await fetch(`${SERVICEABILITY_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      return notServiceable(request, "Could not reach Shiprocket right now.");
    }

    if (!res.ok) {
      return notServiceable(
        request,
        `Shiprocket serviceability check failed (status ${res.status}).`
      );
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return notServiceable(request, "Shiprocket returned an unreadable response.");
    }

    let couriers: ShiprocketCourierOption[];
    try {
      couriers = parseServiceabilityResponse(json);
    } catch {
      return notServiceable(request, "Shiprocket returned an unexpected response.");
    }

    if (couriers.length === 0) {
      return notServiceable(request, "No courier is currently serviceable for this pincode.");
    }

    // Business choice (not dictated by the API): quote the cheapest
    // serviceable courier. courier_company_id is retained on this object
    // (not surfaced in ShippingQuoteResponse) for a future shipment-creation
    // flow that needs to book the same courier that was quoted.
    const cheapest = couriers.reduce((best, courier) => (courier.rate < best.rate ? courier : best));

    return {
      serviceable: true,
      shipping_amount: cheapest.rate,
      estimated_delivery: cheapest.etd ?? null,
      carrier: cheapest.courier_name,
      service: null,
      weight_used_grams: request.cartWeightGrams,
      zone: null,
    };
  }
}

export const shiprocketProvider = new ShiprocketProvider();
