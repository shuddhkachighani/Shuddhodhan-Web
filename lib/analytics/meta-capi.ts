import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { siteSettings } from "@/lib/data/settings";
import type { Order } from "@/lib/types";

/**
 * Meta Conversions API — server-side Purchase event, sent alongside (not
 * instead of) the browser Pixel event fired in lib/analytics/events.ts. Using
 * the same `event_id` (the order_id) on both lets Meta deduplicate them into
 * a single conversion (spec section 32). No-ops until both
 * NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are configured — it
 * never throws or blocks the payment flow if they're missing or the call
 * fails, since CAPI is a tracking enhancement, not a checkout dependency.
 */
function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(siteSettings.analytics.metaPixelId && process.env.META_CAPI_ACCESS_TOKEN);
}

export async function sendPurchaseCapiEvent(
  order: Order,
  req?: NextRequest
): Promise<void> {
  if (!isMetaCapiConfigured()) return;

  try {
    const pixelId = siteSettings.analytics.metaPixelId;
    const accessToken = process.env.META_CAPI_ACCESS_TOKEN!;

    const userData: Record<string, unknown> = {
      em: [sha256(order.customer.email)],
      ph: [sha256(order.customer.mobile)],
    };
    if (order.utm_data.fbc) userData.fbc = order.utm_data.fbc;
    if (order.utm_data.fbp) userData.fbp = order.utm_data.fbp;
    if (req) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      if (ip) userData.client_ip_address = ip;
      const ua = req.headers.get("user-agent");
      if (ua) userData.client_user_agent = ua;
    }

    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(new Date(order.updated_at).getTime() / 1000),
          event_id: order.order_id,
          action_source: "website",
          event_source_url: `${siteSettings.siteUrl}/order-confirmation?order_id=${order.order_id}`,
          user_data: userData,
          custom_data: {
            currency: "INR",
            value: order.grand_total,
            contents: order.items.map((item) => ({
              id: item.variantId,
              quantity: item.quantity,
              item_price: item.sellingPrice,
            })),
            content_type: "product",
          },
        },
      ],
    };

    await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
  } catch {
    // Best-effort: a CAPI delivery failure must never fail the payment flow.
  }
}
