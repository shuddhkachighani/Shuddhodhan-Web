import type { Product } from "@/lib/types";

// SOURCE OF TRUTH: Shuddhodhan Kachi Ghani Rate List, dated 01 February 2026.
// Prices, MRP and sizes below are copied verbatim from that rate list — do not
// alter without an updated rate list. `intendedUse` follows the one explicit
// instruction given (Castor Oil is not an everyday edible oil); Almond Oil and
// Flaxseed Oil are provisionally marked SPECIALTY as they are commonly sold as
// wellness/nutritional oils rather than everyday cooking oil — this default
// should be confirmed against the actual Shuddhodhan product labels before
// launch. `heroImage`/`gallery` point at real Shuddhodhan product photography
// (supplied via Google Drive, resized/re-encoded, EXIF stripped) for the
// products photographed so far; products without supplied photos keep
// heroImage: null and the UI renders a labelled placeholder instead of a
// fabricated image.

export const products: Product[] = [
  {
    id: "groundnut-oil",
    slug: "groundnut-oil",
    name: "Groundnut Oil",
    shortDescription:
      "Wood cold pressed groundnut oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Groundnut",
    heroImage: "/products/groundnut-oil/hero.jpg",
    gallery: ["/products/groundnut-oil/gallery-1.jpg", "/products/groundnut-oil/gallery-2.jpg"],
    featured: true,
    active: true,
    variants: [
      { id: "groundnut-oil-1l", size: "1 L", sizeMl: 1000, mrp: 443, sellingPrice: 310, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
      { id: "groundnut-oil-2l", size: "2 L", sizeMl: 2000, mrp: 886, sellingPrice: 620, weightGrams: 1950, inStock: true, lengthCm: 21, widthCm: 12, heightCm: 9 },
      { id: "groundnut-oil-5l", size: "5 L", sizeMl: 5000, mrp: 2143, sellingPrice: 1500, weightGrams: 4750, inStock: true, lengthCm: 33, widthCm: 21, heightCm: 21 },
      { id: "groundnut-oil-15l", size: "15 L", sizeMl: 15000, mrp: 6214, sellingPrice: 4350, weightGrams: 14200, inStock: true, lengthCm: 39, widthCm: 27, heightCm: 27 },
    ],
  },
  {
    id: "virgin-coconut-oil",
    slug: "virgin-coconut-oil",
    name: "Virgin Coconut Oil",
    shortDescription:
      "Wood cold pressed virgin coconut oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Coconut",
    heroImage: "/products/virgin-coconut-oil/hero.jpg",
    gallery: ["/products/virgin-coconut-oil/gallery-1.jpg", "/products/virgin-coconut-oil/gallery-2.jpg"],
    featured: true,
    active: true,
    variants: [
      { id: "virgin-coconut-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 186, sellingPrice: 130, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
      { id: "virgin-coconut-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 386, sellingPrice: 270, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "virgin-coconut-oil-1l", size: "1 L", sizeMl: 1000, mrp: 743, sellingPrice: 520, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
    ],
  },
  {
    id: "black-mustard-oil",
    slug: "black-mustard-oil",
    name: "Black Mustard Oil",
    shortDescription:
      "Wood cold pressed black mustard oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Mustard",
    heroImage: "/products/black-mustard-oil/hero.jpg",
    gallery: ["/products/black-mustard-oil/gallery-1.jpg", "/products/black-mustard-oil/gallery-2.jpg"],
    featured: true,
    active: true,
    variants: [
      { id: "black-mustard-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 114, sellingPrice: 80, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
      { id: "black-mustard-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 243, sellingPrice: 170, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "black-mustard-oil-1l", size: "1 L", sizeMl: 1000, mrp: 471, sellingPrice: 330, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
      { id: "black-mustard-oil-5l", size: "5 L", sizeMl: 5000, mrp: 2286, sellingPrice: 1600, weightGrams: 4750, inStock: true, lengthCm: 33, widthCm: 21, heightCm: 21 },
      { id: "black-mustard-oil-15l", size: "15 L", sizeMl: 15000, mrp: 6643, sellingPrice: 4650, weightGrams: 14200, inStock: true, lengthCm: 39, widthCm: 27, heightCm: 27 },
    ],
  },
  {
    id: "yellow-mustard-oil",
    slug: "yellow-mustard-oil",
    name: "Yellow Mustard Oil",
    shortDescription:
      "Wood cold pressed yellow mustard oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Mustard",
    heroImage: null,
    gallery: [],
    featured: false,
    active: true,
    variants: [
      { id: "yellow-mustard-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 129, sellingPrice: 90, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
      { id: "yellow-mustard-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 286, sellingPrice: 200, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "yellow-mustard-oil-1l", size: "1 L", sizeMl: 1000, mrp: 543, sellingPrice: 380, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
      { id: "yellow-mustard-oil-5l", size: "5 L", sizeMl: 5000, mrp: 2643, sellingPrice: 1850, weightGrams: 4750, inStock: true, lengthCm: 33, widthCm: 21, heightCm: 21 },
    ],
  },
  {
    id: "white-sesame-oil",
    slug: "white-sesame-oil",
    name: "White Sesame Oil",
    shortDescription:
      "Wood cold pressed white sesame oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Sesame",
    heroImage: "/products/white-sesame-oil/hero.jpg",
    gallery: ["/products/white-sesame-oil/gallery-1.jpg", "/products/white-sesame-oil/gallery-2.jpg"],
    featured: true,
    active: true,
    variants: [
      { id: "white-sesame-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 171, sellingPrice: 120, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
      { id: "white-sesame-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 371, sellingPrice: 260, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "white-sesame-oil-1l", size: "1 L", sizeMl: 1000, mrp: 714, sellingPrice: 500, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
    ],
  },
  {
    id: "black-sesame-oil",
    slug: "black-sesame-oil",
    name: "Black Sesame Oil",
    shortDescription:
      "Wood cold pressed black sesame oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Sesame",
    heroImage: null,
    gallery: [],
    featured: false,
    active: true,
    variants: [
      { id: "black-sesame-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 200, sellingPrice: 140, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
      { id: "black-sesame-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 429, sellingPrice: 300, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "black-sesame-oil-1l", size: "1 L", sizeMl: 1000, mrp: 829, sellingPrice: 580, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
    ],
  },
  {
    id: "sunflower-oil",
    slug: "sunflower-oil",
    name: "Sunflower Oil",
    shortDescription:
      "Wood cold pressed sunflower oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Sunflower",
    heroImage: "/products/sunflower-oil/hero.jpg",
    gallery: ["/products/sunflower-oil/gallery-1.jpg"],
    featured: false,
    active: true,
    variants: [
      { id: "sunflower-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 286, sellingPrice: 200, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "sunflower-oil-1l", size: "1 L", sizeMl: 1000, mrp: 543, sellingPrice: 380, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
      { id: "sunflower-oil-5l", size: "5 L", sizeMl: 5000, mrp: 2643, sellingPrice: 1850, weightGrams: 4750, inStock: true, lengthCm: 33, widthCm: 21, heightCm: 21 },
    ],
  },
  {
    id: "safflower-oil",
    slug: "safflower-oil",
    name: "Safflower Oil",
    shortDescription:
      "Wood cold pressed safflower oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "CULINARY",
    category: "Specialty",
    heroImage: null,
    gallery: [],
    featured: false,
    active: true,
    variants: [
      { id: "safflower-oil-500ml", size: "500 ML", sizeMl: 500, mrp: 257, sellingPrice: 180, weightGrams: 520, inStock: true, lengthCm: 15, widthCm: 12, heightCm: 12 },
      { id: "safflower-oil-1l", size: "1 L", sizeMl: 1000, mrp: 500, sellingPrice: 350, weightGrams: 1000, inStock: true, lengthCm: 31, widthCm: 15, heightCm: 15 },
    ],
  },
  {
    id: "almond-oil",
    slug: "almond-oil",
    name: "Almond Oil",
    shortDescription:
      "Wood cold pressed almond oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "SPECIALTY",
    category: "Specialty",
    heroImage: "/products/almond-oil/hero.jpg",
    gallery: ["/products/almond-oil/gallery-1.jpg", "/products/almond-oil/gallery-2.jpg"],
    featured: false,
    active: true,
    variants: [
      { id: "almond-oil-100ml", size: "100 ML", sizeMl: 100, mrp: 371, sellingPrice: 260, weightGrams: 130, inStock: true, lengthCm: 9, widthCm: 4, heightCm: 4 },
    ],
  },
  {
    id: "flaxseed-oil",
    slug: "flaxseed-oil",
    name: "Flaxseed Oil",
    shortDescription:
      "Wood cold pressed flaxseed oil, extracted using the traditional Kachi Ghani process.",
    intendedUse: "SPECIALTY",
    category: "Specialty",
    heroImage: null,
    gallery: [],
    featured: false,
    active: true,
    variants: [
      { id: "flaxseed-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 157, sellingPrice: 110, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
    ],
  },
  {
    id: "castor-oil",
    slug: "castor-oil",
    name: "Castor Oil",
    shortDescription:
      "Wood cold pressed castor oil. Intended for topical/household use — not an everyday edible cooking oil.",
    intendedUse: "NON_CULINARY",
    category: "Specialty",
    heroImage: "/products/castor-oil/hero.jpg",
    gallery: ["/products/castor-oil/gallery-1.jpg", "/products/castor-oil/gallery-2.jpg"],
    featured: false,
    active: true,
    variants: [
      { id: "castor-oil-100ml", size: "100 ML", sizeMl: 100, mrp: 100, sellingPrice: 70, weightGrams: 130, inStock: true, lengthCm: 9, widthCm: 4, heightCm: 4 },
      { id: "castor-oil-200ml", size: "200 ML", sizeMl: 200, mrp: 186, sellingPrice: 130, weightGrams: 220, inStock: true, lengthCm: 12, widthCm: 6, heightCm: 6 },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.active);
}

export function getVariant(productId: string, variantId: string) {
  const product = products.find((p) => p.id === productId);
  return product?.variants.find((v) => v.id === variantId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured && p.active);
}
