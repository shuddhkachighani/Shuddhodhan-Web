"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ConsentStatus = "unset" | "accepted" | "rejected";

const STORAGE_KEY = "shuddhodhan_consent_v1";

interface ConsentContextValue {
  status: ConsentStatus;
  bannerOpen: boolean;
  accept: () => void;
  reject: () => void;
  openPreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredStatus(): ConsentStatus {
  if (typeof window === "undefined") return "unset";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "accepted" || raw === "rejected" ? raw : "unset";
  } catch {
    return "unset";
  }
}

// Tracks the visitor's cookie/tracking consent choice (spec: Step 5E-Meta
// consent audit). Nothing reads this to infer consent from ordinary usage —
// the only way status becomes "accepted"/"rejected" is an explicit click.
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("unset");
  const [mounted, setMounted] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external system (localStorage) on mount, not derived state.
    setStatus(readStoredStatus());
    setMounted(true);
  }, []);

  const persist = useCallback((value: ConsentStatus) => {
    setStatus(value);
    setPreferencesOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Storage may be unavailable (private mode, quota) — the in-memory
      // status still applies for the rest of this page session.
    }
  }, []);

  const accept = useCallback(() => persist("accepted"), [persist]);
  const reject = useCallback(() => persist("rejected"), [persist]);
  const openPreferences = useCallback(() => setPreferencesOpen(true), []);

  // Never render the banner until we've actually checked localStorage —
  // otherwise a returning visitor who already chose would see a flash of it.
  const bannerOpen = mounted && (status === "unset" || preferencesOpen);

  return (
    <ConsentContext.Provider
      value={{ status, bannerOpen, accept, reject, openPreferences }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}
