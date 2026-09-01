import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  robots: { index: false },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      sections={[
        "Order cancellation window",
        "Damaged or incorrect items",
        "Return eligibility",
        "Refund process and timelines",
        "Non-returnable items",
        "How to request a refund",
      ]}
    />
  );
}
