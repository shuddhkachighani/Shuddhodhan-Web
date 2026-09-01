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
- **Orders** (`lib/orders/`) — in-memory store. **This is the one deliberately
  MOCKED piece for demoing the checkout → payment flow end-to-end.** Replace
  with a real database before production.
- **Analytics** (`lib/analytics/`) — unified Meta Pixel + GA4 event dispatch
  (`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, ...), UTM/fbclid
  attribution capture, both env-gated no-ops until real IDs are supplied.
- **SEO** — per-route metadata, `sitemap.ts`, `robots.ts`, and JSON-LD for
  Organization, Product, Breadcrumb, FAQPage and VideoObject.

## Status matrix

| Area | Status | Notes |
|---|---|---|
| Homepage, brand sections | READY | Copy avoids invented claims/certifications. |
| Product catalogue & pricing | READY | Prices/MRP copied verbatim from the supplied rate list. Do not edit without an updated rate list. |
| Product photography / hero imagery | **MISSING** | Placeholder art shown; drop real photos into `/public` and set `heroImage`/`gallery` in `lib/data/products.ts`. |
| Video/Reels CMS | READY (structure) — **MOCKED** (no content) | `lib/data/videos.ts` is empty by design; add real `VideoItem` entries to activate the homepage section. |
| Cart | READY | Client-side, persisted to `localStorage`. |
| Indore local shipping | CONFIGURED, needs real values | Rules are wired up; `INDORE_SERVICEABLE_PINCODES` is empty until supplied — nothing is assumed serviceable. |
| National shipping (outside Indore) | MOCKED | Placeholder zone/weight rate table. Needs a real logistics provider integration. |
| Payment gateway | READY (Razorpay adapter), **NOT CONNECTED** | Works fully once `NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` are set. Checkout shows an honest "not connected" notice otherwise — it never fakes a successful order. |
| Order storage | MOCKED | In-memory only; swap `lib/orders/store.ts` for a real database. |
| Meta Pixel / GA4 | READY, **NOT CONNECTED** | No-ops until `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GA4_MEASUREMENT_ID` are set. |
| Meta Conversions API (server-side) | NOT IMPLEMENTED | `META_CAPI_ACCESS_TOKEN` is a placeholder only; no server-side CAPI call exists yet. |
| Reviews | READY (structure), empty | No fabricated testimonials/ratings — `lib/data/reviews.ts` is empty until real reviews are collected. |
| Legal pages | PLACEHOLDER | Section headings only; final legal text must be supplied. |
| WhatsApp button | CONFIGURED, needs a number | Hidden until `NEXT_PUBLIC_WHATSAPP_NUMBER` is set. |

## What's needed from the business before this can go fully live

1. Real product photography (hero + gallery images per oil).
2. Real Shuddhodhan videos/Reels (file or hosted URL, title, description, category).
3. WhatsApp support number.
4. Meta Pixel ID and GA4 Measurement ID.
5. Razorpay (or chosen gateway) API keys + webhook secret.
6. A logistics provider decision + credentials for shipping outside Indore.
7. The list of serviceable Indore pincodes and the local delivery rate rules.
8. Genuine customer reviews.
9. Finalized legal policy text (privacy, terms, shipping, refund, payment).
10. A production database to replace the in-memory order store.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # production build
npm run lint    # eslint
```
