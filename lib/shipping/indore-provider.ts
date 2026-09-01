import { siteSettings } from "@/lib/data/settings";
import type { ShippingProvider } from "@/lib/shipping/types";
import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

/**
 * Local Indore delivery. Rules are fully configurable via env vars
 * (INDORE_DELIVERY_ENABLED, INDORE_FREE_SHIPPING, INDORE_FLAT_RATE,
 * INDORE_MINIMUM_FREE_SHIPPING_VALUE, INDORE_SERVICEABLE_PINCODES) — see
 * lib/data/settings.ts. Nothing here is assumed: an empty serviceable-pincode
 * list means "not yet configured", not "serviceable everywhere in Indore".
 */
export class IndoreLocalProvider implements ShippingProvider {
  readonly name = "indore-local";
  readonly status = "READY" as const;

  isConfigured(): boolean {
    return siteSettings.shipping.indore.servicablePincodes.length > 0;
  }

  covers(pincode: string): boolean {
    return siteSettings.shipping.indore.servicablePincodes.includes(pincode);
  }

  async getQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
    const { indore } = siteSettings.shipping;

    if (!indore.enabled || !this.isConfigured() || !this.covers(request.pincode)) {
      return {
        serviceable: false,
        shipping_amount: 0,
        estimated_delivery: null,
        carrier: null,
        service: null,
        weight_used_grams: request.cartWeightGrams,
        zone: null,
        reason: "Not a serviceable Indore local-delivery pincode.",
      };
    }

    const free =
      indore.freeShipping || request.cartValue >= indore.minimumFreeShippingValue;

    return {
      serviceable: true,
      shipping_amount: free ? 0 : indore.flatRate,
      estimated_delivery: "1-2 days",
      carrier: "Shuddhodhan Local Delivery",
      service: "standard",
      weight_used_grams: request.cartWeightGrams,
      zone: "INDORE_LOCAL",
    };
  }
}

export const indoreLocalProvider = new IndoreLocalProvider();
