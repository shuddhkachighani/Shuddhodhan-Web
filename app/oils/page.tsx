import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Shop All Oils",
  description:
    "Browse the full range of Shuddhodhan Wood Cold Pressed Oils — Groundnut, Mustard, Coconut, Sesame, Sunflower and more. Real MRP and selling price shown.",
  alternates: { canonical: "/oils" },
};

export default function OilsPage() {
  const activeProducts = products.filter((p) => p.active);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <section className="bg-cream py-12 md:py-16">
          <div className="container-page">
            <p className="eyebrow text-mustard">Shop</p>
            <h1 className="mt-3 font-serif text-4xl text-brown-900">All Oils</h1>
            <p className="mt-2 max-w-lg text-brown-700">
              Wood cold pressed, Kachi Ghani process. MRP and selling price shown
              on every product.
            </p>
          </div>
        </section>

        <section className="bg-warm-white py-12 md:py-16">
          <div className="container-page grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
