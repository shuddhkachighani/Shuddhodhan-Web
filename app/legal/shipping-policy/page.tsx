import type { Metadata } from "next";
import { LegalPageLayout, type LegalSection } from "@/components/legal/legal-page-layout";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "How Shuddhodhan determines delivery availability, shipping charges within and outside Indore, and delivery timelines.",
  robots: { index: false },
};

const sections: LegalSection[] = [
  {
    id: "serviceability",
    heading: "Delivery availability",
    body: "Delivery across India is subject to pincode serviceability. Enter your pincode at checkout or on a product page to check whether we currently deliver to your location.",
  },
  {
    id: "indore-delivery",
    heading: "Indore local delivery",
    body: "Orders delivered within our serviceable Indore pincodes are eligible for free delivery when the order value is ₹1,000 or more. Orders below ₹1,000 carry a local delivery charge (currently a flat ₹99), shown clearly at checkout before you pay. The exact serviceable Indore pincodes are set by Shuddhodhan and checked at checkout.",
  },
  {
    id: "outside-indore",
    heading: "Delivery outside Indore",
    body: [
      "For destinations outside our configured Indore delivery zone, shipping is calculated dynamically rather than charged at a fixed flat rate nationwide.",
      "The calculation takes into account: destination pincode, origin pincode, cart weight and package dimensions, the courier/service selected, and serviceability at that pincode.",
    ],
  },
  {
    id: "carrier",
    heading: "Carrier and service",
    body: "Once a logistics provider is connected, the carrier and service level shown at checkout, and the delivery estimate, come from that provider in real time. Until then, this website uses a placeholder rate calculation clearly for testing — see the site's technical README for current status.",
  },
  {
    id: "delivery-estimates",
    heading: "Delivery estimates",
    body: "Estimated delivery timelines are shown at checkout based on your pincode. These are estimates, not guarantees, and can be affected by courier delays outside our control.",
  },
  {
    id: "tracking",
    heading: "Order tracking",
    body: "Once your order ships, use the Track Order page with your Order Number to see its current status.",
  },
  {
    id: "exceptions",
    heading: "Delivery exceptions and delays",
    body: [
      "Delivery can occasionally be delayed or fail to complete for reasons including: an incorrect or incomplete delivery address, the customer being unavailable at the time of delivery, refusal to accept the shipment, a failed delivery attempt by the courier, serviceability or logistics limitations at the destination pincode, or events outside our reasonable control (such as courier network disruptions, weather, or local restrictions).",
      "If a delivery cannot be completed for one of these reasons, we or our courier partner will generally attempt to reschedule delivery or get in touch using the contact details provided at checkout. Please keep your contact number reachable and your delivery address accurate to avoid delays.",
    ],
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      intro="How we determine delivery availability, shipping charges and delivery timelines."
      sections={sections}
    />
  );
}
