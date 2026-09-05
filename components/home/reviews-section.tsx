import { reviews } from "@/lib/data/reviews";

export function ReviewsSection() {
  return (
    <section id="reviews" className="scroll-mt-16 bg-warm-white py-16 md:py-20">
      <div className="container-page">
        <p className="eyebrow text-mustard">Customer Reviews</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-brown-900 sm:text-4xl">
          What our customers say
        </h2>

        {reviews.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-stone/60 p-5">
                <div className="flex gap-0.5 text-mustard">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-brown-700">&ldquo;{review.text}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-brown-900">
                  {review.authorName}
                  {review.verifiedPurchase && (
                    <span className="ml-2 text-xs font-normal text-brown-500">
                      Verified purchase
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-stone px-6 py-14 text-center">
            <p className="text-sm text-brown-500">
              We&apos;re just getting started — genuine customer reviews will appear here soon.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
