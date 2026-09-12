import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "information-collected",
    heading: "Information we collect",
    body: "Structure pending: details of the personal information collected at checkout and while browsing (e.g. name, contact details, delivery address, order history) will be listed here once finalized.",
  },
  {
    id: "purpose-of-collection",
    heading: "Purpose of collection",
    body: "Structure pending: the specific purposes for which information is used will be listed here — fulfilling orders, customer support, and legally required record-keeping among them.",
  },
  {
    id: "order-processing",
    heading: "Order processing",
    body: "Structure pending: how order and delivery details are used to process, ship and confirm your order.",
  },
  {
    id: "payment-processing",
    heading: "Payment processing",
    body: "Payments are processed by our online payment gateway. Shuddhodhan does not store your full card, UPI or bank details — the gateway handles this directly. See the Payment Policy for more detail.",
  },
  {
    id: "shipping-logistics",
    heading: "Shipping and logistics",
    body: "Your delivery address and contact details are shared with our logistics/courier partner(s) solely to fulfil and deliver your order.",
  },
  {
    id: "analytics",
    heading: "Analytics",
    body: "Structure pending: use of website analytics (e.g. Google Analytics/GA4) to understand site usage will be described here once configured and finalized.",
  },
  {
    id: "meta-advertising",
    heading: "Meta advertising",
    body: "Structure pending: use of the Meta (Facebook/Instagram) Pixel and Conversions API for advertising measurement will be described here once configured and finalized.",
  },
  {
    id: "cookies",
    heading: "Cookies",
    body: "See our Cookie Policy for details on the cookies and similar technologies used on this website.",
  },
  {
    id: "third-party-providers",
    heading: "Third-party service providers",
    body: "Structure pending: the categories of third-party providers we work with (payment gateway, logistics, analytics, hosting) will be listed here.",
  },
  {
    id: "data-retention",
    heading: "Data retention",
    body: "Structure pending: how long different categories of data are retained will be specified here, consistent with applicable law.",
  },
  {
    id: "customer-rights",
    heading: "Your rights and choices",
    body: "Structure pending: how you can access, correct or request deletion of your personal information will be described here.",
  },
  {
    id: "contact-information",
    heading: "Contact information",
    body: "For any privacy-related query, use the Contact Us page or reach our Grievance Officer via the Grievance Redressal page.",
  },
  {
    id: "policy-updates",
    heading: "Policy updates",
    body: "This policy may be updated from time to time. The current version is always available at this URL.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      intro="How Shuddhodhan collects, uses and protects your information when you use this website."
      sections={sections}
    />
  );
}
