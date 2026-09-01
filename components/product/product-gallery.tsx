"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/components/product/product-image";

export function ProductGallery({
  heroImage,
  gallery,
  alt,
}: {
  heroImage: string | null;
  gallery: string[];
  alt: string;
}) {
  const images = heroImage ? [heroImage, ...gallery] : [];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-linen">
        <ProductImage src={images[active] ?? null} alt={alt} />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                i === active ? "border-brown-900" : "border-stone/60"
              }`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
