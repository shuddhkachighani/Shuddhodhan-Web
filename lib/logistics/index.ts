import { siteSettings } from "@/lib/data/settings";
import { mockLogisticsProvider } from "@/lib/logistics/mock-provider";
import { shiprocketLogisticsProvider } from "@/lib/logistics/shiprocket-provider";
import type { LogisticsProvider } from "@/lib/logistics/types";

// Single seam to swap in a real logistics provider once one is integrated —
// nothing else in the codebase should import a specific provider directly.
//
// Gated by SHIPROCKET_FULFILLMENT_ENABLED, deliberately independent of
// SHIPPING_PROVIDER (which only controls rate quoting — see
// lib/shipping/index.ts). Booking a real courier on a paid order is a
// bigger blast radius than showing a rate, so it gets its own flag and
// defaults to off even once Shiprocket rates are already live.
export const logisticsProvider: LogisticsProvider = siteSettings.shipping.shiprocketFulfillmentEnabled
  ? shiprocketLogisticsProvider
  : mockLogisticsProvider;
