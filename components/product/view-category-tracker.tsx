"use client";

import { useEffect, useRef } from "react";
import type { Product } from "@/lib/types";
import { trackViewItemList } from "@/lib/analytics/events";

// Smallest possible client leaf so the /oils page itself can stay a server
// component. Fires once per mount using the actual rendered product list —
// no fabricated data.
export function ViewCategoryTracker({
  products,
  listName,
}: {
  products: Product[];
  listName: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || products.length === 0) return;
    fired.current = true;
    trackViewItemList(
      products.map((product) => {
        const displayedVariant =
          product.variants.find((v) => v.inStock) ?? product.variants[0];
        return {
          id: product.id,
          name: product.name,
          price: displayedVariant?.sellingPrice ?? 0,
        };
      }),
      listName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
