import { siteSettings } from "@/lib/data/settings";
import { indoreLocalProvider } from "@/lib/shipping/indore-provider";
import { mockNationalProvider } from "@/lib/shipping/mock-national-provider";
import { shiprocketProvider } from "@/lib/shipping/shiprocket-provider";
import { isValidIndianPincode } from "@/lib/shipping/types";
import type { ShippingProvider } from "@/lib/shipping/types";
import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

// Orchestrator: Indore local rules take priority (fulfilled by us directly,
// at a flat locked-in rate — never Shiprocket); anything outside the
// configured Indore serviceable list falls through to the national
// provider. This is the ONLY place that decides provider order.
//
// The national provider is Shiprocket once SHIPPING_PROVIDER=shiprocket is
// set (also requires SHIPROCKET_API_EMAIL/SHIPROCKET_API_PASSWORD — see
// lib/shiprocket/auth.ts); until then it stays the mocked placeholder, the
// same way Razorpay/Supabase stay unconfigured until real credentials are
// supplied. The customer is always charged Shiprocket's own live quote —
// never a hardcoded or table-based rate.
function getNationalProvider(): ShippingProvider {
  return siteSettings.shipping.nationalProvider === "shiprocket"
    ? shiprocketProvider
    : mockNationalProvider;
}

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

  // request.cartWeightGrams is the actual finished shipment weight (product
  // + primary bottle/jar/jerrycan, per lib/data/products.ts) and is passed
  // through to every provider unmodified — no packing/safety allowance is
  // added. There is no measured outer-carton weight to add on top of it, so
  // none is invented; the customer is quoted and charged for the real
  // weight only.
  const indoreQuote = await indoreLocalProvider.getQuote(request);
  if (indoreQuote.serviceable) return indoreQuote;

  return getNationalProvider().getQuote(request);
}
