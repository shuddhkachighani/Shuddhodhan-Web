import Link from "next/link";
import { products } from "@/lib/data/products";
import { ProductCard } from "@/components/product/product-card";

export function ProductStore() {
  return (
    <section id="products" className="scroll-mt-16 bg-cream py-16 md:py-20">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-mustard">Our Oils</p>
            <h2 className="mt-3 font-serif text-3xl text-brown-900 sm:text-4xl">
              Wood cold pressed, one bottle at a time
            </h2>
          </div>
          <Link
            href="/oils"
            className="text-sm font-semibold text-brown-900 underline underline-offset-4"
          >
            View all oils
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products
            .filter((p) => p.active)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </div>
    </section>
  );
}
