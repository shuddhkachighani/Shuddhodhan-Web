import { siteSettings } from "@/lib/data/settings";
import type { ShippingProvider } from "@/lib/shipping/types";
import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

/**
 * STATUS: MOCKED — placeholder only, not production ready.
 *
 * This stands in for a real logistics API (Shiprocket, Delhivery, a direct
 * carrier, etc.) that would return real serviceability + rates from origin
 * pincode → destination pincode → weight → zone → carrier → service type.
 * The zone/weight-slab rate table below is a rough illustrative estimate so
 * checkout is testable end-to-end; it must be replaced with a real adapter
 * implementing ShippingProvider before this ships to real customers.
 *
 * Swap it out in lib/shipping/index.ts once a real provider is configured via
 * SHIPPING_PROVIDER + its API credentials.
 */
export class MockNationalProvider implements ShippingProvider {
  readonly name = "mock-national";
  readonly status = "MOCKED" as const;

  private zoneFor(originPincode: string, destinationPincode: string): string {
    const originFirst = originPincode[0];
    const destFirst = destinationPincode[0];
    if (originFirst === destFirst) return "ZONE_REGIONAL";
    return "ZONE_NATIONAL";
  }

  private rateForWeight(zone: string, weightGrams: number): number {
    const slabs =
      zone === "ZONE_REGIONAL"
        ? [
            { maxGrams: 1000, rate: 70 },
            { maxGrams: 2500, rate: 110 },
            { maxGrams: 5000, rate: 180 },
            { maxGrams: 15000, rate: 350 },
          ]
        : [
            { maxGrams: 1000, rate: 110 },
            { maxGrams: 2500, rate: 170 },
            { maxGrams: 5000, rate: 280 },
            { maxGrams: 15000, rate: 550 },
          ];
    const slab = slabs.find((s) => weightGrams <= s.maxGrams);
    return slab ? slab.rate : slabs[slabs.length - 1].rate;
  }

  async getQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
    const zone = this.zoneFor(siteSettings.shipping.originPincode, request.pincode);
    const amount = this.rateForWeight(zone, request.cartWeightGrams);

    return {
      serviceable: true,
      shipping_amount: amount,
      estimated_delivery: zone === "ZONE_REGIONAL" ? "3-5 days" : "5-8 days",
      carrier: "Placeholder Carrier (mocked)",
      service: "surface",
      weight_used_grams: request.cartWeightGrams,
      zone,
      reason: "MOCKED rate — connect a real logistics provider before launch.",
    };
  }
}

export const mockNationalProvider = new MockNationalProvider();
