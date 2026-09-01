# Shuddhodhan — Wood Cold Pressed Oils

Production-oriented e-commerce storefront for Shuddhodhan Oils. Built with
Next.js (App Router) + TypeScript + Tailwind CSS.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values — see below
npm run dev
```

## Architecture

- **Data layer** (`lib/data/`) — products (real prices from the 01 Feb 2026
  Shuddhodhan Kachi Ghani rate list), videos, FAQ, reviews, settings. Plain
  TypeScript modules today; the shapes in `lib/types.ts` are deliberately
  storage-agnostic so this can move to a headless CMS, a database, or
  WooCommerce later without touching components or routes (spec section 51).
- **Cart** (`lib/cart/`) — React context + `localStorage`, no server round-trip.
- **Shipping** (`lib/shipping/`) — a `ShippingProvider` adapter interface.
  Indore local delivery is real, rule-driven logic; everything outside Indore
  goes through a clearly-labelled `MockNationalProvider` placeholder pending a
  real logistics integration (Shiprocket/Delhivery/etc.).
- **Payment** (`lib/payment/`) — a `PaymentProvider` adapter interface with a
  Razorpay implementation (REST API, no SDK dependency). No Cash on Delivery
  anywhere in this layer. Orders are only ever marked "paid" after a
  server-verified HMAC signature (checkout callback) or the Razorpay webhook —
  never from an unverified frontend event.
- **Orders** (`lib/orders/`) — persisted to a real Postgres table (Supabase,
  schema in `supabase/migrations/`) once `NEXT_PUBLIC_SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` are set (RLS is enabled with no policies, so only
  that server-only key can touch the table — see
  `lib/supabase/server-client.ts`). Falls back to an in-memory store when
  those aren't set, purely so checkout still runs end-to-end in local dev.
- **Logistics** (`lib/logistics/`) — a `LogisticsProvider` adapter interface
  for shipment creation + tracking (separate from the shipping *rate quote* in
  `lib/shipping/`). `lib/orders/fulfillment.ts` creates a shipment once a
  payment is verified paid, idempotently, from either the checkout callback or
  the webhook. Currently a clearly-labelled `MockLogisticsProvider` pending a
  real courier integration.
- **Payment** (`lib/payment/`) — a `PaymentProvider` adapter interface with a
  Razorpay implementation (REST API, no SDK dependency). No Cash on Delivery
  anywhere in this layer. Orders are only ever marked "paid" after a
  server-verified HMAC signature (checkout callback) or the Razorpay webhook —
  never from an unverified frontend event.
- **Analytics** (`lib/analytics/`) — unified Meta Pixel + GA4 event dispatch
  (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, ...), UTM/fbclid
  attribution capture, and a server-side Meta Conversions API call
  (`lib/analytics/meta-capi.ts`) fired on verified payment with the same
  `event_id` as the browser Pixel event for deduplication. All env-gated
  no-ops until real IDs/tokens are supplied.
- **SEO** — per-route metadata, `sitemap.ts`, `robots.ts`, and JSON-LD for
  Organization, Product, Breadcrumb, FAQPage and VideoObject.
- **Tests** (`**/*.test.ts`, run with `npm run test`) — unit coverage for cart
  pricing math, product catalogue integrity (no selling price above MRP, no
  duplicate slugs/variant ids), payment fee calculation, and shipping quote
  logic (invalid pincode, unconfigured vs. configured Indore delivery, national
  fallback) — spec section 55.

## Status matrix

| Area | Status | Notes |
|---|---|---|
| Homepage, brand sections | READY | Copy avoids invented claims/certifications. |
| Logo | READY | Real Shuddhodhan logo in `public/brand/` (`logo-mark.png` for header/footer, `logo-full.png` for larger uses), cropped from the supplied source. Used as the app icon/favicon too (`app/icon.png`). |
| Product catalogue & pricing | READY | Prices/MRP copied verbatim from the supplied rate list. Do not edit without an updated rate list. |
| Product photography / hero imagery | READY for 7/11 oils | Real Shuddhodhan photography in `public/products/<slug>/` (resized, compressed, EXIF stripped) for Groundnut, Black Mustard, Virgin Coconut, White Sesame, Sunflower, Almond and Castor. Yellow Mustard, Black Sesame, Safflower and Flaxseed still show the honest placeholder pending photos. |
| Video/Reels CMS | READY, 2 real Reels live | `lib/data/videos.ts` has 2 real Shuddhodhan Reels (transcoded to 720p H.264, posters generated) in `public/videos/reels/`. Add more `VideoItem` entries the same way as more Reels are supplied. |
| Cart | READY | Client-side, persisted to `localStorage`. |
| Indore local shipping | CONFIGURED, needs real values | Rules are wired up; `INDORE_SERVICEABLE_PINCODES` is empty until supplied — nothing is assumed serviceable. |
| National shipping (outside Indore) | MOCKED | Placeholder zone/weight rate table. Needs a real logistics provider integration. |
| Payment gateway | READY (Razorpay adapter), **NOT CONNECTED** | Works fully once `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` are set. Checkout shows an honest "not connected" notice otherwise — it never fakes a successful order. |
| Order storage | READY (Supabase/Postgres), **NOT CONNECTED** | Schema + RLS deployed to the project's Supabase instance; falls back to an in-memory MOCKED store until `SUPABASE_SERVICE_ROLE_KEY` is set. |
| Shipment creation / tracking | MOCKED | `lib/logistics/mock-provider.ts` generates a fake AWB on payment success so the order → shipment → tracking flow is testable. Needs a real courier integration. |
| Meta Pixel / GA4 | READY, **NOT CONNECTED** | No-ops until `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID` are set. |
| Meta Conversions API (server-side) | READY, **NOT CONNECTED** | Implemented in `lib/analytics/meta-capi.ts`, fired on verified payment; no-ops until `META_CAPI_ACCESS_TOKEN` is set. |
| Reviews | READY (structure), empty | No fabricated testimonials/ratings — `lib/data/reviews.ts` is empty until real reviews are collected. |
| Legal pages | PLACEHOLDER | Section headings only; final legal text must be supplied. |
| WhatsApp button | CONFIGURED, needs a number | Hidden until `NEXT_PUBLIC_WHATSAPP_NUMBER` is set. |

## What's needed from the business before this can go fully live

1. Real product photography for the remaining 4 oils (Yellow Mustard, Black
   Sesame, Safflower, Flaxseed) — same drop-in process as the other 7.
2. More real Shuddhodhan videos/Reels (2 are live; same drop-in process for more).
3. WhatsApp support number.
4. Meta Pixel ID and GA4 Measurement ID.
5. Razorpay (or chosen gateway) API keys + webhook secret.
6. A logistics provider decision + credentials for shipping outside Indore
   AND for shipment creation/tracking (`lib/logistics/`).
7. The list of serviceable Indore pincodes and the local delivery rate rules.
8. Genuine customer reviews.
9. Finalized legal policy text (privacy, terms, shipping, refund, payment).
10. The Supabase `SUPABASE_SERVICE_ROLE_KEY` (from Project Settings > API) to
    switch order storage on — the project and schema already exist.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # production build
npm run lint    # eslint
npm run test    # vitest unit tests
```
