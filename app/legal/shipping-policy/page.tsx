import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  robots: { index: false },
};

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      sections={[
        "Serviceable locations",
        "Indore local delivery",
        "Delivery outside Indore",
        "Shipping charges and calculation",
        "Estimated delivery timelines",
        "Order tracking",
        "Delivery exceptions and delays",
      ]}
    />
  );
}
