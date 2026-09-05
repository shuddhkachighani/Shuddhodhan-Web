"use client";

import type { OrderAttribution } from "@/lib/types";

const STORAGE_KEY = "shuddhodhan_attribution_v1";
const TRACKED_PARAMS: (keyof OrderAttribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
];

// Captures Meta/UTM click identifiers on landing and preserves them through
// the session so they can be attached to the order at checkout (spec
// section 33). First-touch attribution: an existing stored value is kept
// unless the new URL explicitly carries a fresh one.
export function captureAttribution(url: string) {
  if (typeof window === "undefined") return;
  try {
    const params = new URL(url).searchParams;
    const existing = getStoredAttribution();
    let changed = false;

    for (const key of TRACKED_PARAMS) {
      const value = params.get(key);
      if (value) {
        existing[key] = value;
        changed = true;
      }
    }

    const fbc = document.cookie.match(/(?:^|; )_fbc=([^;]+)/)?.[1];
    if (fbc) {
      existing.fbc = decodeURIComponent(fbc);
      changed = true;
    }
    const fbp = document.cookie.match(/(?:^|; )_fbp=([^;]+)/)?.[1];
    if (fbp) {
      existing.fbp = decodeURIComponent(fbp);
      changed = true;
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  } catch {
    // ignore — attribution is best-effort, never blocks the user
  }
}

export function getStoredAttribution(): OrderAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
