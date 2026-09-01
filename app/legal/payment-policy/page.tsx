import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Payment Policy",
  robots: { index: false },
};

export default function PaymentPolicyPage() {
  return (
    <LegalPageLayout
      title="Payment Policy"
      sections={[
        "Accepted payment methods (online only, no COD)",
        "Payment security",
        "Payment processing charges",
        "Failed or pending payments",
        "Payment verification",
      ]}
    />
  );
}
