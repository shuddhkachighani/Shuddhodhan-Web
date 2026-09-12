import { mockLogisticsProvider } from "@/lib/logistics/mock-provider";
import type { LogisticsProvider } from "@/lib/logistics/types";

// Single seam to swap in a real logistics provider once one is integrated —
// nothing else in the codebase should import a specific provider directly.
export const logisticsProvider: LogisticsProvider = mockLogisticsProvider;
