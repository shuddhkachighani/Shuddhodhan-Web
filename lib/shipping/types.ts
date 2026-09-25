import type { ShippingQuoteRequest, ShippingQuoteResponse } from "@/lib/types";

// Adapter interface every logistics/shipping provider must implement. Business
// logic (checkout, cart, API routes) only ever talks to this interface —
// never to a specific carrier — so a real provider (Shiprocket, Delhivery,
// Shyplite, a direct carrier API, ...) can be dropped in later without
// touching anything upstream.
export interface ShippingProvider {
  readonly name: string;
  /**
   * READY = real, production data. MOCKED = placeholder logic pending real
   * integration. NOT_CONFIGURED = a real integration whose credentials
   * haven't been supplied yet (same convention as PaymentProvider).
   */
  readonly status: "READY" | "MOCKED" | "NOT_CONFIGURED";
  getQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteResponse>;
}

export function isValidIndianPincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode.trim());
}
