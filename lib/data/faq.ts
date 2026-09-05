import type { FaqItem } from "@/lib/types";

// General, factual FAQ content only — process/method facts and the site's own
// documented policies (no COD, pincode-based shipping, etc.). No certifications,
// awards, or brand claims are asserted here; those must come from verified
// Shuddhodhan material before publishing.
export const faqs: FaqItem[] = [
  {
    id: "what-is-wood-cold-pressed",
    question: "What is wood cold pressed (Kachi Ghani) oil?",
    answer:
      "Wood cold pressing, also called the Kachi Ghani process, extracts oil by mechanically crushing seeds in a wooden churner at low speed, without added heat or chemical solvents. This traditional method retains more of the seed's natural flavour and nutrients compared to heat- or solvent-extracted refined oils.",
    category: "PRODUCT",
  },
  {
    id: "is-castor-oil-edible",
    question: "Is Castor Oil meant for cooking?",
    answer:
      "No. Shuddhodhan Castor Oil is intended for topical and household use, not as an everyday edible cooking oil.",
    category: "PRODUCT",
  },
  {
    id: "how-to-store",
    question: "How should I store my oil after opening?",
    answer:
      "Store the bottle tightly sealed in a cool, dry place away from direct sunlight. Refrigeration is not required for most of our oils.",
    category: "PRODUCT",
  },
  {
    id: "cod-availability",
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "No. Shuddhodhan orders are prepaid only, via secure online payment. We do not offer Cash on Delivery.",
    category: "PAYMENT",
  },
  {
    id: "delivery-availability",
    question: "Do you deliver to my location?",
    answer:
      "Enter your pincode on the product or checkout page to instantly check delivery availability. Local delivery is available across serviceable Indore pincodes, and select pincodes across India are served through our courier partners.",
    category: "SHIPPING",
  },
  {
    id: "delivery-time",
    question: "How long will my order take to arrive?",
    answer:
      "Estimated delivery time is shown at checkout once you enter your pincode, based on your location and the courier serving that pincode.",
    category: "SHIPPING",
  },
  {
    id: "how-to-contact",
    question: "How can I get help choosing an oil?",
    answer:
      "Tap the WhatsApp button on any page to chat with us directly about choosing the right oil, an existing order, or delivery status.",
    category: "GENERAL",
  },
];

export function getFaqsByCategory(category: FaqItem["category"]): FaqItem[] {
  return faqs.filter((f) => f.category === category);
}
