"use client";

import { useConsent } from "@/lib/consent/consent-context";

// Lets a visitor reopen the cookie banner at any time to change an earlier
// Accept/Reject choice, without needing to clear browser storage.
export function CookiePreferencesButton() {
  const { openPreferences } = useConsent();

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="underline decoration-warm-white/40 underline-offset-2 hover:text-warm-white"
    >
      Cookie Preferences
    </button>
  );
}
