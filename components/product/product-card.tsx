"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart/cart-context";
import { trackAddToCart, trackViewContent } from "@/lib/analytics/events";
import { ProductImage } from "@/components/product/product-image";

export function ProductCard({ product }: { product: Product }) {
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState(inStockVariants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId),
    [product, variantId]
  );

  if (!variant) return null;

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
    setQuantity(1);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-stone/60 bg-warm-white">
      <Link
        href={`/oils/${product.slug}`}
        className="relative block aspect-square overflow-hidden"
        onClick={() =>
          trackViewContent({
            id: product.id,
            name: product.name,
            price: variant.sellingPrice,
          })
        }
      >
        <ProductImage src={product.heroImage} alt={product.name} />
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brown-900 px-2.5 py-1 text-[11px] font-semibold text-warm-white">
            {discountPercent}% off
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <Link href={`/oils/${product.slug}`}>
            <h3 className="font-serif text-lg text-brown-900">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-brown-700">
            {product.shortDescription}
          </p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-brown-900">
            ₹{variant.sellingPrice.toLocaleString("en-IN")}
          </span>
          {variant.mrp > variant.sellingPrice && (
            <span className="text-sm text-brown-500 line-through">
              ₹{variant.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {inStockVariants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                v.id === variantId
                  ? "border-brown-900 bg-brown-900 text-warm-white"
                  : "border-stone text-brown-700 hover:border-brown-500"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-1">
          <div className="flex items-center rounded-full border border-stone">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="px-2.5 py-1.5 text-brown-700"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="px-2.5 py-1.5 text-brown-700"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-full bg-mustard px-4 py-2 text-sm font-semibold text-warm-white transition-colors hover:bg-oil-dark"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
