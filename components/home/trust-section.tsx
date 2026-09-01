const PILLARS = [
  {
    title: "Transparent Pricing",
    detail: "Every product shows its MRP alongside the actual selling price — no hidden markdowns.",
  },
  {
    title: "Secure Online Checkout",
    detail: "Payments are processed through a recognised online payment gateway. No Cash on Delivery.",
  },
  {
    title: "Made in Indore",
    detail: "Every order ships from our Indore base, tracked from checkout to your doorstep.",
  },
];

export function TrustSection() {
  return (
    <section className="bg-cream py-16 md:py-20">
      <div className="container-page">
        <p className="eyebrow text-mustard">Why Trust Shuddhodhan</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-brown-900 sm:text-4xl">
          Built on transparency, not marketing
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="border-t border-brown-900 pt-4">
              <p className="font-serif text-lg text-brown-900">{pillar.title}</p>
              <p className="mt-2 text-sm text-brown-700">{pillar.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
