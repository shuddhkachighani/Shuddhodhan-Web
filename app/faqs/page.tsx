import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { faqClusters, allFullFaqs } from "@/lib/data/faq-full";
import { siteSettings } from "@/lib/data/settings";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about Shuddhodhan's wood cold pressed (Kachi Ghani) oils — how they're made, choosing the right oil, storage, ordering, payment and delivery.",
  alternates: { canonical: "/faqs" },
};

function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFullFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function FaqsPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: siteSettings.siteUrl },
    { name: "FAQs", url: `${siteSettings.siteUrl}/faqs` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <AnnouncementBar />
      <Header />
      <main className="bg-warm-white">
        <section className="border-b border-stone/60 bg-cream py-10 md:py-14">
          <div className="container-page max-w-3xl">
            <p className="eyebrow text-mustard-deep">Questions</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 max-w-2xl text-brown-700">
              Everything about our wood cold pressed (Kachi Ghani) oils —
              how they&apos;re made, choosing the right one, storage, ordering,
              payment and delivery.
            </p>
          </div>
        </section>

        <div className="container-page max-w-3xl py-10 md:py-14">
          <div className="flex flex-col gap-12">
            {faqClusters.map((cluster) => (
              <section key={cluster.id} aria-labelledby={`${cluster.id}-heading`}>
                <h2
                  id={`${cluster.id}-heading`}
                  className="font-serif text-2xl text-brown-900"
                >
                  {cluster.heading}
                </h2>
                <FaqAccordion items={cluster.items} />
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-lg border border-stone/60 bg-cream p-6 text-center">
            <p className="font-serif text-lg text-brown-900">
              Still have a question?
            </p>
            <p className="mt-1 text-sm text-brown-700">
              Reach our support team and we&apos;ll help directly.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-brown-900 px-6 py-2.5 text-sm font-semibold text-warm-white hover:bg-oil-dark"
              >
                Contact Us
              </Link>
              <Link
                href="/oils"
                className="rounded-full border border-brown-900 px-6 py-2.5 text-sm font-semibold text-brown-900 hover:bg-linen"
              >
                Shop All Oils
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
