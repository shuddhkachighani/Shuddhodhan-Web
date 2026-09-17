"use client";

import { useEffect, type ReactNode } from "react";
import { useConsent } from "@/lib/consent/consent-context";

// Renders its children (Meta Pixel / GA4 / attribution capture) only once
// consent has been explicitly accepted. While status is "unset" or
// "rejected" nothing here loads or fires — mounting is the only thing that
// starts these scripts, so no consent state ever means no tracking.
export function ConsentGate({ children }: { children: ReactNode }) {
  const { status } = useConsent();

  useEffect(() => {
    if (status !== "accepted" && typeof window !== "undefined") {
      // Best-effort cleanup for the accepted -> rejected transition in the
      // same session: stop this app's own track*() helpers from doing
      // anything if fbq/gtag were defined earlier. This cannot remove
      // cookies a third-party script may already have set.
      delete window.fbq;
      delete window.gtag;
    }
  }, [status]);

  if (status !== "accepted") return null;
  return <>{children}</>;
}
