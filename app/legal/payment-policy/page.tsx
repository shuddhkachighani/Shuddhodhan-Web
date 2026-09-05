import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Payment Policy",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "online-payment-only",
    heading: "Online payment only",
    body: "All orders on this website are prepaid via secure online payment. Cash on Delivery (COD) is not available.",
  },
  {
    id: "supported-methods",
    heading: "Supported payment methods",
    body: "The specific payment methods available (cards, UPI, net banking, wallets, etc.) depend on our payment gateway configuration and will be listed here once the gateway is finalized.",
  },
  {
    id: "payment-gateway",
    heading: "Payment gateway",
    body: "Payments are processed through a recognised third-party online payment gateway. Shuddhodhan does not store your full card or bank account details.",
  },
  {
    id: "payment-verification",
    heading: "Payment verification",
    body: "An order is confirmed only after payment is verified server-side with our payment gateway — never on the basis of a browser-only success message.",
  },
  {
    id: "payment-failures",
    heading: "Payment failures",
    body: "If a payment fails or is not completed, your order will not be confirmed. If an amount was debited without a confirmed order, it is typically reversed by your bank/payment provider automatically; contact us if this does not happen within a reasonable time.",
  },
  {
    id: "duplicate-payments",
    heading: "Duplicate payments",
    body: "Our system is designed to prevent an order from being charged twice for the same transaction. If you believe you were charged more than once for a single order, contact us with your order number.",
  },
  {
    id: "refunds",
    heading: "Refunds",
    body: "See the Refund, Return & Cancellation Policy for how refunds are processed once approved.",
  },
  {
    id: "payment-charges",
    heading: "Payment processing charges",
    body: "If a payment processing charge applies, it will be shown transparently as a separate line item before you pay — never hidden inside another charge.",
  },
  {
    id: "security",
    heading: "Security",
    body: "Payment details are handled directly by our payment gateway over an encrypted connection. Payment credentials and API keys used on our side are never exposed in the website's code or stored insecurely.",
  },
];

export default function PaymentPolicyPage() {
  return (
    <LegalPageLayout
      title="Payment Policy"
      intro="Online payment only — no Cash on Delivery. How payments are processed, verified and secured."
      sections={sections}
    />
  );
}
