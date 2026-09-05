import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { TrustStrip } from "@/components/home/trust-strip";
import { VideoSection } from "@/components/home/video-section";
import { ProductStore } from "@/components/home/product-store";
import { OilSelectionGuide } from "@/components/home/oil-selection-guide";
import { WhyWoodColdPressed } from "@/components/home/why-wood-cold-pressed";
import { ProcessSection } from "@/components/home/process-section";
import { TrustSection } from "@/components/home/trust-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { faqs } from "@/lib/data/faq";
import { faqJsonLd } from "@/lib/seo/json-ld";

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
      />
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <TrustStrip />
        <VideoSection />
        <ProductStore />
        <OilSelectionGuide />
        <WhyWoodColdPressed />
        <ProcessSection />
        <TrustSection />
        <ReviewsSection />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
