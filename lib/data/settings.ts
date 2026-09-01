// Central, admin-style configuration. Every business-variable the spec calls out
// as "configurable" lives here, sourced from environment variables with safe
// fallbacks so the site runs before real values are supplied. Nothing here is an
// invented business fact — unset values are clearly flagged via `isConfigured`.

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
}

function envList(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const siteSettings = {
  brandName: "Shuddhodhan",
  brandTagline: "Pure by process. Honest by choice.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.shuddhodhan.com",
  location: "Indore, Madhya Pradesh, India",

  contact: {
    // Placeholder pending real business contact details.
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    whatsappDefaultMessage:
      "Hello Shuddhodhan, I need help choosing the right oil.",
  },

  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  },

  analytics: {
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    metaCapiConfigured: Boolean(process.env.META_CAPI_ACCESS_TOKEN),
    ga4MeasurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "",
  },

  payment: {
    // No COD. Gateway is env-gated and considered CONFIGURED only once real
    // keys are present. See lib/payment/README for status.
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    isGatewayConfigured: Boolean(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ),
    fee: {
      enabled: envBool("PAYMENT_FEE_ENABLED", false),
      percentage: envInt("PAYMENT_FEE_PERCENTAGE", 0),
      fixedFeePaise: envInt("PAYMENT_FEE_FIXED_PAISE", 0),
      taxOnFeePercentage: envInt("PAYMENT_FEE_TAX_PERCENTAGE", 0),
    },
  },

  shipping: {
    originPincode: process.env.SHIPPING_ORIGIN_PINCODE || "452001",
    indore: {
      enabled: envBool("INDORE_DELIVERY_ENABLED", true),
      freeShipping: envBool("INDORE_FREE_SHIPPING", false),
      flatRate: envInt("INDORE_FLAT_RATE", 49),
      minimumFreeShippingValue: envInt(
        "INDORE_MINIMUM_FREE_SHIPPING_VALUE",
        999
      ),
      // Empty until the real serviceable pincode list is supplied. An empty
      // list means "not yet configured" — see lib/shipping for behaviour.
      servicablePincodes: envList("INDORE_SERVICEABLE_PINCODES"),
    },
    nationalProvider: process.env.SHIPPING_PROVIDER || "mock",
  },

  tax: {
    gstPercentage: envInt("GST_PERCENTAGE", 0),
  },
};

export type SiteSettings = typeof siteSettings;
