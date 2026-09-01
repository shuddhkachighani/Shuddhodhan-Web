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

  const indoreQuote = await indoreLocalProvider.getQuote(request);
  if (indoreQuote.serviceable) return indoreQuote;

  return mockNationalProvider.getQuote(request);
}
