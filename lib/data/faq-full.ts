// Extended, SEO-focused FAQ content for the standalone /faqs page (Step 5E).
//
// This is intentionally a SEPARATE dataset from lib/data/faq.ts, which stays
// unchanged and continues to drive the shorter homepage FAQ teaser section
// and its own JSON-LD. Keeping them separate means the homepage section's
// content and behaviour are not affected by this expansion.
//
// Every answer here is grounded in facts already established elsewhere in
// this repository (process-section.tsx, why-wood-cold-pressed.tsx, product
// data in lib/data/products.ts, and the site's own payment/shipping
// implementation). Nothing here asserts a delivery SLA, refund timeline,
// cancellation window, specific shelf-life duration, or medical/health claim
// that isn't already backed by real data in the codebase — where that
// information doesn't exist yet, the answer says so honestly and points to
// the relevant policy page instead of inventing a number.

export interface FaqLink {
  label: string;
  href: string;
}

export interface FullFaqItem {
  id: string;
  question: string;
  answer: string;
  links?: FaqLink[];
}

export interface FaqCluster {
  id: string;
  heading: string;
  items: FullFaqItem[];
}

export const faqClusters: FaqCluster[] = [
  {
    id: "wood-cold-pressed",
    heading: "Wood Cold Pressed & Kachi Ghani",
    items: [
      {
        id: "what-is-wood-cold-pressed-oil",
        question: "What is wood cold pressed oil?",
        answer:
          "Wood cold pressed oil is oil extracted by mechanically crushing seeds in a wooden churner at low speed, without added heat or chemical solvents. Only mechanical pressure is used to separate the oil from the seed.",
        links: [{ label: "Why wood cold pressed?", href: "/#process" }],
      },
      {
        id: "what-is-kachi-ghani-oil",
        question: "What is Kachi Ghani oil?",
        answer:
          "Kachi Ghani is the traditional Indian name for the wood cold pressing method — the same slow, wooden-churner process described above. Kachi Ghani and wood cold pressed refer to the same extraction method.",
      },
      {
        id: "how-is-wood-cold-pressed-oil-made",
        question: "How is wood cold pressed oil made?",
        answer:
          "Seeds are sourced and inspected, then pressed in a wooden Kachi Ghani that turns slowly without added heat. The pressed oil is filtered to remove sediment, then bottled.",
        links: [{ label: "See our process", href: "/#process" }],
      },
      {
        id: "how-does-wood-cold-pressed-differ-from-refined",
        question: "How does wood cold pressed oil differ from refined oil?",
        answer:
          "Refined oil is typically extracted using heat and chemical solvents, then further processed (refining, bleaching, deodorising). Wood cold pressed oil uses only slow mechanical pressure — no added heat and no chemical solvents at any stage.",
      },
      {
        id: "is-wood-cold-pressed-oil-extracted-without-heat",
        question: "Is wood cold pressed oil extracted without added heat?",
        answer:
          "Yes. The wooden churner turns at low speed, so the seeds are crushed without the oil being exposed to added processing heat.",
      },
      {
        id: "what-does-wooden-ghani-mean",
        question: "What does the traditional wooden ghani process mean?",
        answer:
          "A ghani is the churner used to press oil from seeds. A wooden ghani is built and operated the traditional way — turning slowly, powered mechanically rather than by high-speed modern expellers — the way oil has been extracted in Indian households for generations.",
      },
    ],
  },
  {
    id: "shuddhodhan-process",
    heading: "Shuddhodhan's Process",
    items: [
      {
        id: "how-does-shuddhodhan-make-its-oils",
        question: "How does Shuddhodhan make its oils?",
        answer:
          "Every Shuddhodhan oil goes through the same four steps: seeds are sourced and inspected, pressed in a wooden Kachi Ghani without added heat, filtered to remove sediment, and bottled for dispatch from our Indore base.",
        links: [{ label: "See our process", href: "/#process" }],
      },
      {
        id: "where-are-shuddhodhan-oils-made",
        question: "Where are Shuddhodhan oils made?",
        answer: "Shuddhodhan oils are pressed, filtered and bottled at our facility in Indore, Madhya Pradesh.",
      },
      {
        id: "what-happens-after-pressing",
        question: "What happens to the oil after it's pressed?",
        answer:
          "Once the oil is pressed, it is filtered to remove sediment left over from the crushed seed, then bottled and packed for dispatch.",
      },
      {
        id: "why-wooden-ghani-not-expeller",
        question: "Why does Shuddhodhan use a traditional wooden pressing process?",
        answer:
          "A wooden ghani turns more slowly than a modern steel expeller, which keeps the seed from being exposed to added heat during pressing and avoids the need for chemical solvents — the traditional method Indian households have used for generations.",
      },
      {
        id: "is-the-oil-filtered",
        question: "Is the oil filtered?",
        answer:
          "Yes. After pressing, the oil is filtered to remove sediment left over from the crushed seed, before it is bottled.",
      },
    ],
  },
  {
    id: "choosing-and-using-oils",
    heading: "Choosing & Using Our Oils",
    items: [
      {
        id: "wood-cold-pressed-groundnut-oil",
        question: "What is wood cold pressed groundnut oil used for?",
        answer:
          "Shuddhodhan Groundnut Oil is an everyday cooking oil, wood cold pressed using the Kachi Ghani process, suitable for regular Indian cooking — tempering, sautéing and general kitchen use.",
        links: [{ label: "Shop Groundnut Oil", href: "/oils/groundnut-oil" }],
      },
      {
        id: "is-mustard-oil-suitable-for-cooking",
        question: "Is Shuddhodhan mustard oil suitable for cooking?",
        answer:
          "Yes. Both our Black Mustard Oil and Yellow Mustard Oil are classified as everyday cooking oils, wood cold pressed and suitable for regular Indian cooking.",
        links: [
          { label: "Shop Black Mustard Oil", href: "/oils/black-mustard-oil" },
          { label: "Shop Yellow Mustard Oil", href: "/oils/yellow-mustard-oil" },
        ],
      },
      {
        id: "what-is-sesame-oil-used-for",
        question: "What is wood cold pressed sesame oil used for?",
        answer:
          "Our White Sesame Oil and Black Sesame Oil are everyday cooking oils, wood cold pressed and suited to regular Indian cooking such as tempering and sautéing.",
        links: [{ label: "Shop White Sesame Oil", href: "/oils/white-sesame-oil" }],
      },
      {
        id: "what-is-virgin-coconut-oil",
        question: "What is virgin coconut oil and how is it used?",
        answer:
          "Shuddhodhan Virgin Coconut Oil is wood cold pressed from coconut and classified as an everyday cooking oil, suitable for regular Indian cooking.",
        links: [{ label: "Shop Virgin Coconut Oil", href: "/oils/virgin-coconut-oil" }],
      },
      {
        id: "is-sunflower-oil-a-cooking-oil",
        question: "Is sunflower oil from Shuddhodhan a cooking oil?",
        answer:
          "Yes. Shuddhodhan Sunflower Oil is wood cold pressed and classified as an everyday cooking oil.",
        links: [{ label: "Shop Sunflower Oil", href: "/oils/sunflower-oil" }],
      },
      {
        id: "what-is-almond-oil-used-for",
        question: "What is Shuddhodhan almond oil used for?",
        answer:
          "Almond Oil is listed as a specialty/wellness oil rather than an everyday cooking oil. We don't make specific health or usage claims here — please use it as you would any specialty oil, and consult a qualified professional for advice on personal use.",
        links: [{ label: "Shop Almond Oil", href: "/oils/almond-oil" }],
      },
      {
        id: "is-castor-oil-meant-for-cooking",
        question: "Is castor oil meant for cooking?",
        answer:
          "No. Shuddhodhan Castor Oil is intended for topical and household use, not as an everyday edible cooking oil.",
        links: [{ label: "Shop Castor Oil", href: "/oils/castor-oil" }],
      },
    ],
  },
  {
    id: "storage-and-quality",
    heading: "Storage & Quality",
    items: [
      {
        id: "how-to-store-wood-cold-pressed-oil",
        question: "How should wood cold pressed oil be stored?",
        answer:
          "Store the bottle tightly sealed in a cool, dry place, away from direct sunlight, after each use.",
      },
      {
        id: "does-oil-need-refrigeration",
        question: "Does the oil need refrigeration?",
        answer:
          "Refrigeration is not required for most of our oils when stored in a cool, dry place away from sunlight as described above.",
      },
      {
        id: "how-long-does-oil-stay-good-after-opening",
        question: "How long does the oil remain good after opening?",
        answer:
          "We haven't published a specific number of days for this yet. Check the best-before date printed on your bottle, store it as described above, and contact us if you have any concern about a specific bottle.",
        links: [{ label: "Contact Us", href: "/contact" }],
      },
      {
        id: "why-natural-oils-vary-in-colour-or-aroma",
        question: "Why can natural oils vary slightly in colour or aroma?",
        answer:
          "Because our oils are wood cold pressed from real seed batches rather than standardised through refining, small natural variations in colour or aroma between batches are normal and expected.",
      },
    ],
  },
  {
    id: "ordering-payment-delivery",
    heading: "Ordering, Payment & Delivery",
    items: [
      {
        id: "do-you-offer-cod",
        question: "Do you offer Cash on Delivery (COD)?",
        answer:
          "No. Shuddhodhan orders are prepaid only, via secure online payment. We do not offer Cash on Delivery.",
        links: [{ label: "Payment Policy", href: "/legal/payment-policy" }],
      },
      {
        id: "where-does-shuddhodhan-deliver",
        question: "Where does Shuddhodhan deliver?",
        answer:
          "Enter your pincode on a product page or at checkout to instantly check delivery availability. Local delivery is available across serviceable Indore pincodes, and other pincodes across India are served through our courier partners where serviceable.",
        links: [{ label: "Shipping & Delivery Policy", href: "/legal/shipping-policy" }],
      },
      {
        id: "how-long-does-delivery-take",
        question: "How long does delivery take?",
        answer:
          "Estimated delivery time is shown at checkout once you enter your pincode, based on your location and the courier serving that pincode. These are estimates, not guarantees.",
        links: [{ label: "Shipping & Delivery Policy", href: "/legal/shipping-policy" }],
      },
      {
        id: "how-can-i-track-my-order",
        question: "How can I track my order?",
        answer:
          "Use the Track Order page with your Order Number and the mobile number used at checkout to see its current status.",
        links: [{ label: "Track Order", href: "/track-order" }],
      },
      {
        id: "what-payment-methods-are-available",
        question: "What payment methods are available?",
        answer:
          "Payments are processed online through Razorpay. The specific methods available (cards, UPI, net banking, wallets) depend on our gateway configuration at the time of checkout.",
        links: [{ label: "Payment Policy", href: "/legal/payment-policy" }],
      },
      {
        id: "can-i-cancel-my-order",
        question: "Can I cancel my order?",
        answer:
          "Our Refund, Return & Cancellation Policy covers cancellation. If you need to cancel or change an order, contact us as soon as possible with your order number.",
        links: [
          { label: "Refund, Return & Cancellation Policy", href: "/legal/refund-policy" },
          { label: "Contact Us", href: "/contact" },
        ],
      },
      {
        id: "what-if-order-arrives-damaged",
        question: "What happens if my order arrives damaged?",
        answer:
          "Contact us with your order number and photos of the damage so we can arrange a resolution. See our Refund, Return & Cancellation Policy for more detail.",
        links: [
          { label: "Refund, Return & Cancellation Policy", href: "/legal/refund-policy" },
          { label: "Contact Us", href: "/contact" },
        ],
      },
      {
        id: "what-bottle-sizes-are-available",
        question: "What bottle sizes are available?",
        answer:
          "Bottle sizes vary by oil, ranging from 100 ML specialty bottles up to 15 L bulk packs for our everyday cooking oils. Each product page shows the exact sizes and prices available for that oil.",
        links: [{ label: "Shop all oils", href: "/oils" }],
      },
    ],
  },
  {
    id: "choosing-the-right-oil",
    heading: "Choosing the Right Oil",
    items: [
      {
        id: "which-oil-for-everyday-cooking",
        question: "Which Shuddhodhan oil should I choose for everyday cooking?",
        answer:
          "Groundnut Oil, Black Mustard Oil, Yellow Mustard Oil, White Sesame Oil, Black Sesame Oil, Virgin Coconut Oil and Sunflower Oil are all wood cold pressed and classified as everyday cooking oils — the choice between them generally comes down to regional cooking preference and flavour.",
        links: [{ label: "Shop all oils", href: "/oils" }],
      },
      {
        id: "difference-between-groundnut-mustard-sesame-sunflower",
        question: "How do I choose between groundnut, mustard, sesame and sunflower oil?",
        answer:
          "All four are wood cold pressed, everyday cooking oils from Shuddhodhan. Each has its own traditional flavour profile used in different regional Indian cuisines, so the right choice depends on the dishes you cook and your personal taste rather than one oil being generally superior.",
        links: [{ label: "Shop all oils", href: "/oils" }],
      },
      {
        id: "which-oils-are-non-culinary",
        question: "Which oils are cooking oils and which are intended for non-culinary use?",
        answer:
          "Groundnut, Black Mustard, Yellow Mustard, White Sesame, Black Sesame, Virgin Coconut, Sunflower and Safflower Oil are everyday cooking oils. Almond Oil and Flaxseed Oil are listed as specialty/wellness oils rather than everyday cooking oils. Castor Oil is intended for topical and household use only, not as a cooking oil.",
        links: [{ label: "Shop all oils", href: "/oils" }],
      },
      {
        id: "how-can-i-get-help-choosing-an-oil",
        question: "How can I get help choosing an oil?",
        answer:
          "Contact us and we'll help you pick the right oil for your needs.",
        links: [{ label: "Contact Us", href: "/contact" }],
      },
    ],
  },
];

export const allFullFaqs: FullFaqItem[] = faqClusters.flatMap((cluster) => cluster.items);
