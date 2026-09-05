import { siteSettings } from "@/lib/data/settings";
import { indoreLocalProvider } from "@/lib/shipping/indore-provider";
import { mockNationalProvider } from "@/lib/shipping/mock-national-provider";
import { isValidIndianPincode } from "@/lib/shipping/types";
import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

// Orchestrator: Indore local rules take priority; anything outside the
// configured Indore serviceable list falls through to the national provider.
// This is the ONLY place that decides provider order — swap
// mockNationalProvider for a real adapter here once one is connected.
export async function getShippingQuote(
  request: ShippingQuoteRequest
): Promise<ShippingQuoteResponse> {
  if (!isValidIndianPincode(request.pincode)) {
    return {
      serviceable: false,
      shipping_amount: 0,
      estimated_delivery: null,
      carrier: null,
      service: null,
      weight_used_grams: request.cartWeightGrams,
      zone: null,
      reason: "Enter a valid 6-digit Indian pincode.",
    };
  }

  // The shipping weight fed to providers includes the packing-weight
  // allowance; the caller's actual product weight (request.cartWeightGrams)
  // stays authoritative and is never itself mutated.
  const shippingWeightGrams = Math.round(
    request.cartWeightGrams *
      (1 + siteSettings.shipping.packingWeightAllowanceGramsPerKg / 1000)
  );
  const shippingRequest: ShippingQuoteRequest = {
    ...request,
    cartWeightGrams: shippingWeightGrams,
  };

  const indoreQuote = await indoreLocalProvider.getQuote(shippingRequest);
  if (indoreQuote.serviceable) return indoreQuote;

  return mockNationalProvider.getQuote(shippingRequest);
}
