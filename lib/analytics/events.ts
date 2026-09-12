"use client";

import { siteSettings } from "@/lib/data/settings";

// Unified event dispatch: every call fans out to Meta Pixel (browser) and
// GA4 in one place, so product/cart/checkout components never talk to
// gtag/fbq directly. Both SDKs are env-gated no-ops until real IDs are
// configured (see components/analytics). Meta Conversions API (server-side,
// for deduped/ad-blocker-resistant delivery) is a separate, not-yet-connected
// concern — see META_CAPI_ACCESS_TOKEN in .env.example.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface AnalyticsItem {
  id: string; // product/variant id
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) window.fbq(...args);
}

function gtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

function currencyValue(items: AnalyticsItem[]): number {
  return items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0);
}

export function trackViewContent(item: AnalyticsItem) {
  fbq("track", "ViewContent", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value: item.price,
    currency: "INR",
  });
  gtagEvent("view_item", {
    currency: "INR",
    value: item.price,
    items: [{ item_id: item.id, item_name: item.name, price: item.price }],
  });
}

export function trackViewItemList(items: AnalyticsItem[], listName: string) {
  gtagEvent("view_item_list", {
    item_list_name: listName,
    items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price })),
  });
}

export function trackAddToCart(item: AnalyticsItem) {
  const value = item.price * (item.quantity || 1);
  fbq("track", "AddToCart", {
    content_ids: [item.id],
    content_name: item.name,
    content_type: "product",
    value,
    currency: "INR",
  });
  gtagEvent("add_to_cart", {
    currency: "INR",
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      },
    ],
  });
}

export function trackViewCart(items: AnalyticsItem[]) {
  const value = currencyValue(items);
  fbq("trackCustom", "ViewCart", {
    content_ids: items.map((i) => i.id),
    value,
    currency: "INR",
  });
  gtagEvent("view_cart", {
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
    })),
  });
}

export function trackInitiateCheckout(items: AnalyticsItem[]) {
  const value = currencyValue(items);
  fbq("track", "InitiateCheckout", {
    content_ids: items.map((i) => i.id),
    value,
    currency: "INR",
    num_items: items.reduce((n, i) => n + (i.quantity || 1), 0),
  });
  gtagEvent("begin_checkout", {
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
    })),
  });
}

/**
 * Fires only after a webhook-verified successful payment (never from a
 * frontend redirect alone — spec section 27/32). `eventId` should be the
 * order_id so a duplicate render/callback can be deduped both client-side
 * (Pixel `eventID`) and against a future server-side Meta CAPI call using the
 * same id.
 */
export function trackPurchase(orderId: string, items: AnalyticsItem[]) {
  const value = currencyValue(items);
  fbq(
    "track",
    "Purchase",
    {
      content_ids: items.map((i) => i.id),
      contents: items.map((i) => ({ id: i.id, quantity: i.quantity || 1 })),
      content_type: "product",
      value,
      currency: "INR",
    },
    { eventID: orderId }
  );
  gtagEvent("purchase", {
    transaction_id: orderId,
    currency: "INR",
    value,
    items: items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity || 1,
    })),
  });
}

export const analyticsStatus = {
  metaPixelConfigured: Boolean(siteSettings.analytics.metaPixelId),
  metaCapiConfigured: siteSettings.analytics.metaCapiConfigured,
  ga4Configured: Boolean(siteSettings.analytics.ga4MeasurementId),
};
