import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Shuddhodhan collects, uses and protects your personal information when you browse or order from this website.",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "information-collected",
    heading: "Information we collect",
    body: "When you place an order, we collect the information you provide at checkout: your name, mobile number, email address, and delivery address (including city, state, pincode and any landmark). If you use Track Order or Contact Us, we collect your order number, mobile number, and any message or details you provide us.",
  },
  {
    id: "purpose-of-collection",
    heading: "Purpose of collection",
    body: "We use this information to fulfil your order (payment verification, shipment and delivery), to provide customer support and handle any query or complaint, and to keep the records we are legally required to keep. See “Analytics” and “Meta advertising” below for the separate, consent-based purposes those specific technologies are used for.",
  },
  {
    id: "order-processing",
    heading: "Order processing",
    body: "Your order and delivery details are used to verify payment, prepare your shipment, and share the necessary delivery information with our logistics/courier partner (see “Shipping and logistics” below) so your order can reach you. You can check your order's status at any time on the Track Order page.",
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
      "Separately, when you complete a purchase, limited order details (such as a cryptographically hashed version of your email address or phone number) may be shared with Meta through a server-side Conversions API, to help measure the effectiveness of the advertising that may have led to your order — independent of the cookie banner described above, since it runs after checkout rather than in your browser.",
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
    body: "We share information with third parties only as needed to run this website and fulfil your order: our payment gateway (Razorpay) to process payment, our logistics/courier partner to deliver your order, our database provider (Supabase) to store order records, and — only if you accept cookies — our analytics and advertising providers (Google Analytics, Meta) described above.",
  },
  {
    id: "data-retention",
    heading: "Data retention",
    body: "We keep your order and account information for as long as needed to fulfil your order, meet our tax and legal record-keeping obligations, and resolve any dispute or complaint, after which it may be deleted.",
  },
  {
    id: "customer-rights",
    heading: "Your rights and choices",
    body: "You can ask us to review, correct or delete the personal information you have given us by contacting us via Contact Us or our Grievance Officer (see Grievance Redressal), quoting your order number where applicable. We will respond within a reasonable time.",
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
