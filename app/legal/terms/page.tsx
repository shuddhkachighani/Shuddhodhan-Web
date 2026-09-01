import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  robots: { index: false },
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms & Conditions"
      sections={[
        "Acceptance of terms",
        "Eligibility",
        "Orders and pricing",
        "Payment terms",
        "Shipping and delivery",
        "Limitation of liability",
        "Governing law",
        "Changes to these terms",
      ]}
    />
  );
}
