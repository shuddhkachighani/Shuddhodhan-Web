"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-context";
import { trackAddToCart, trackViewContent } from "@/lib/analytics/events";

export function ProductDetailPurchase({ product }: { product: Product }) {
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState(inStockVariants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product, variantId]
  );

  useEffect(() => {
    if (variant) {
      trackViewContent({
        id: product.id,
        name: product.name,
        price: variant.sellingPrice,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  if (!variant) {
    return <p className="text-sm text-brown-500">Currently out of stock.</p>;
  }

  const discountPercent = Math.round(
    ((variant.mrp - variant.sellingPrice) / variant.mrp) * 100
  );

  const handleAdd = () => {
    addItem(product.id, variant.id, quantity);
    trackAddToCart({
      id: variant.id,
      name: `${product.name} — ${variant.size}`,
      price: variant.sellingPrice,
      quantity,
    });
  };

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-brown-900">
          ₹{variant.sellingPrice.toLocaleString("en-IN")}
        </span>
        {variant.mrp > variant.sellingPrice && (
          <>
            <span className="text-lg text-brown-500 line-through">
              ₹{variant.mrp.toLocaleString("en-IN")}
            </span>
            <span className="text-sm font-medium text-mustard">
              {discountPercent}% off
            </span>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-brown-500">Inclusive of all taxes</p>

      <div className="mt-6">
        <p className="text-sm font-medium text-brown-900">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {inStockVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                v.id === variantId
                  ? "border-brown-900 bg-brown-900 text-warm-white"
                  : "border-stone text-brown-700 hover:border-brown-500"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-stone">
          <button
            type="button"
            aria-label="Decrease quantity"
            className="px-3 py-2 text-brown-700"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="min-w-[2rem] text-center">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            className="px-3 py-2 text-brown-700"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="hidden flex-1 rounded-full bg-mustard px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-oil-dark md:block md:flex-none md:px-10"
        >
          Add to Cart
        </button>
      </div>
      <p className="mt-2 text-xs text-brown-500 md:hidden">
        Use Add to Cart in the bar below.
      </p>

      {/* Mobile sticky purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-stone/60 bg-warm-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] md:hidden">
        <div>
          <p className="text-base font-semibold text-brown-900">
            ₹{variant.sellingPrice.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-brown-500">{variant.size}</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 rounded-full bg-mustard px-6 py-3 text-sm font-semibold text-warm-white"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
