import type { ReviewItem } from "@/lib/types";

// No invented testimonials or star ratings (spec section 45). Populate with
// genuine, verified customer reviews once collected — the ReviewsSection
// component already renders an honest empty state when this array is empty.
export const reviews: ReviewItem[] = [];

export function getReviewsForProduct(productId: string): ReviewItem[] {
  return reviews.filter((r) => r.productId === productId);
}
