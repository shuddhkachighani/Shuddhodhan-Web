import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetailPurchase } from "@/components/product/product-detail-purchase";
import { getProductBySlug, products } from "@/lib/data/products";
import { siteSettings } from "@/lib/data/settings";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";

const USE_LABEL: Record<string, string> = {
  CULINARY: "Everyday Cooking Oil",
  SPECIALTY: "Specialty / Wellness Oil",
  NON_CULINARY: "Non-culinary — topical/household use only",
};

export function generateStaticParams() {
  return products.filter((p) => p.active).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/oils/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${siteSettings.brandName}`,
      description: product.shortDescription,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: siteSettings.siteUrl },
    { name: "Oils", url: `${siteSettings.siteUrl}/oils` },
    { name: product.name, url: `${siteSettings.siteUrl}/oils/${product.slug}` },
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <main className="pb-24 md:pb-0">
        <section className="container-page grid gap-10 py-10 md:grid-cols-2 md:py-14">
          <ProductGallery
            heroImage={product.heroImage}
            gallery={product.gallery}
            alt={product.name}
          />

          <div>
            <p className="eyebrow text-mustard">{USE_LABEL[product.intendedUse]}</p>
            <h1 className="mt-2 font-serif text-3xl text-brown-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-brown-700">{product.shortDescription}</p>

            <div className="mt-6">
              <ProductDetailPurchase product={product} />
            </div>
          </div>
        </section>

        <section className="border-t border-stone/60 bg-cream py-12">
          <div className="container-page grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-2xl text-brown-900">What is this oil?</h2>
              <p className="mt-3 text-sm text-brown-700">
                {product.name} from Shuddhodhan is wood cold pressed using the
                traditional Kachi Ghani method — seeds are mechanically crushed
                at low speed without added heat or chemical solvents.
              </p>

              <h2 className="mt-8 font-serif text-2xl text-brown-900">
                How Shuddhodhan makes it
              </h2>
              <p className="mt-3 text-sm text-brown-700">
                Seeds are sourced, cleaned, and pressed in a wooden churner,
                then filtered and bottled at our Indore base. See the{" "}
                <Link href="/#process" className="underline">
                  process section
                </Link>{" "}
                for more detail.
              </p>

              <h2 className="mt-8 font-serif text-2xl text-brown-900">How to use</h2>
              <p className="mt-3 text-sm text-brown-700">
                {product.intendedUse === "NON_CULINARY"
                  ? "For topical or household use only. Not intended as a cooking oil."
                  : "Suitable for everyday Indian cooking — tempering, sautéing and general kitchen use."}
              </p>

              <h2 className="mt-8 font-serif text-2xl text-brown-900">Storage</h2>
              <p className="mt-3 text-sm text-brown-700">
                Store in a cool, dry place away from direct sunlight, tightly
                sealed after each use.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brown-900">Available sizes</h2>
              <div className="mt-3 overflow-hidden rounded-lg border border-stone/60">
                <table className="w-full text-sm">
                  <thead className="bg-linen text-left text-brown-700">
                    <tr>
                      <th className="px-4 py-2 font-medium">Size</th>
                      <th className="px-4 py-2 font-medium">MRP</th>
                      <th className="px-4 py-2 font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v.id} className="border-t border-stone/40">
                        <td className="px-4 py-2 text-brown-900">{v.size}</td>
                        <td className="px-4 py-2 text-brown-500 line-through">
                          ₹{v.mrp.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2 font-semibold text-brown-900">
                          ₹{v.sellingPrice.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="mt-8 font-serif text-2xl text-brown-900">
                Product specifications
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-brown-500">Extraction method</dt>
                <dd className="text-brown-900">Wood cold pressed (Kachi Ghani)</dd>
                <dt className="text-brown-500">Intended use</dt>
                <dd className="text-brown-900">{USE_LABEL[product.intendedUse]}</dd>
                <dt className="text-brown-500">Origin</dt>
                <dd className="text-brown-900">Indore, Madhya Pradesh</dd>
              </dl>

              <h2 className="mt-8 font-serif text-2xl text-brown-900">
                Nutrition & regulatory information
              </h2>
              <p className="mt-3 text-sm text-brown-500">
                Detailed nutrition and FSSAI regulatory information will be
                published here once available from verified product labelling.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
