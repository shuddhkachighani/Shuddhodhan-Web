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
    supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
    whatsappDefaultMessage:
      "Hello Shuddhodhan, I need help choosing the right oil.",
  },

  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  },

  legal: {
    // Bottom-of-footer statutory details. All placeholders until the
    // business supplies real, verified values — never invented here.
    entityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "",
    registeredAddress: process.env.NEXT_PUBLIC_REGISTERED_ADDRESS || "",
    fssaiLicenseNumber: process.env.NEXT_PUBLIC_FSSAI_LICENSE_NUMBER || "",
    gstin: process.env.NEXT_PUBLIC_GSTIN || "",
  },

  businessHours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || "",

  grievanceOfficer: {
    // Required under the Consumer Protection (E-Commerce) Rules, 2020.
    // Placeholders until the business names and confirms a real officer.
    name: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME || "",
    designation: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_DESIGNATION || "",
    email: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_PHONE || "",
    address: process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_ADDRESS || "",
  },

  analytics: {
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    metaCapiConfigured: Boolean(
      process.env.NEXT_PUBLIC_META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN
    ),
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
    // Extra buffer weight added on top of actual product weight before a
    // shipping rate is calculated, to account for the carton/padding/void
    // fill used when packing an order (business-approved: 150g per 1kg of
    // product weight, i.e. +15%). Does not affect the stored product weight
    // itself — see lib/shipping/index.ts for where this is applied.
    packingWeightAllowanceGramsPerKg: 150,
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
