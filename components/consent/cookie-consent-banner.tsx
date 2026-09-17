"use client";

import Link from "next/link";
import { useConsent } from "@/lib/consent/consent-context";

// A small, non-blocking card — not a full-screen overlay — so it never gets
// in the way of browsing, adding to cart, or checking out.
export function CookieConsentBanner() {
  const { bannerOpen, accept, reject } = useConsent();

  if (!bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:justify-end sm:pr-6"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-lg border border-stone/60 bg-cream p-5 shadow-xl">
        <p className="text-sm text-brown-900">
          We use essential cookies to run this site. With your consent,
          we&apos;d also like to use analytics and advertising cookies
          (Google Analytics, Meta Pixel) to understand traffic and measure
          ads.
        </p>
        <p className="mt-2 text-xs text-brown-700">
          Read our{" "}
          <Link
            href="/legal/cookie-policy"
            className="underline hover:text-mustard-deep"
          >
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-brown-900 px-5 py-2 text-sm font-semibold text-warm-white hover:bg-oil-dark"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={reject}
            className="rounded-full border border-brown-900 px-5 py-2 text-sm font-semibold text-brown-900 hover:bg-linen"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
