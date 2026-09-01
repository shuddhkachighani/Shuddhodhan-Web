import Link from "next/link";

export function FinalCta() {
  return (
    <section className="bg-oil-dark py-16 text-center text-warm-white md:py-20">
      <div className="container-page">
        <h2 className="font-serif text-3xl sm:text-4xl">
          Bring home the taste of tradition
        </h2>
        <p className="mx-auto mt-3 max-w-md text-warm-white/80">
          Wood cold pressed oils, delivered to your kitchen.
        </p>
        <Link
          href="/oils"
          className="mt-8 inline-block rounded-full bg-warm-white px-8 py-3.5 text-sm font-semibold tracking-wide text-brown-900 hover:bg-cream"
        >
          EXPLORE OUR OILS
        </Link>
      </div>
    </section>
  );
}
