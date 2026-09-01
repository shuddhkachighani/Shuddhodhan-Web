const POINTS = [
  { label: "Wood Cold Pressed", detail: "Kachi Ghani process" },
  { label: "Made in Indore", detail: "Madhya Pradesh, India" },
  { label: "Secure Online Payment", detail: "No Cash on Delivery" },
  { label: "Transparent Pricing", detail: "MRP shown on every product" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-stone/60 bg-warm-white">
      <div className="container-page grid grid-cols-2 gap-6 py-8 md:grid-cols-4 md:gap-4">
        {POINTS.map((point) => (
          <div key={point.label} className="text-center">
            <p className="text-sm font-semibold text-brown-900">{point.label}</p>
            <p className="mt-0.5 text-xs text-brown-500">{point.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
