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
    body: "If you accept cookies via the on-site cookie consent banner, we use Google Analytics (GA4), once configured for this site, to understand website usage such as pages visited and traffic sources. GA4 does not load, and no analytics data is collected, unless you accept cookies. You can change your choice at any time using the “Cookie Preferences” link in the site footer.",
  },
  {
    id: "meta-advertising",
    heading: "Meta advertising",
    body: [
      "If you accept cookies via the on-site cookie consent banner, we use the Meta (Facebook/Instagram) Pixel, once configured for this site, to measure the performance of our advertising and to capture attribution information (such as campaign parameters and Meta's own click identifiers) for that purpose. The Meta Pixel does not load, and no browser-based tracking data is collected, unless you accept cookies. You can change your choice at any time using the “Cookie Preferences” link in the site footer.",
      "Separately, when you complete a purchase, limited order details (such as a cryptographically hashed version of your email address or phone number) may be shared with Meta through a server-side Conversions API, to help measure advertising effectiveness, independent of the cookie banner described above. Structure pending: the legal basis and further detail for this specific processing will be reviewed and added here.",
    ],
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
