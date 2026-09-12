import { getProductBySlug, getVariant, products } from "@/lib/data/products";
import type { CartLine } from "@/lib/types";

export interface CartLineDetailed extends CartLine {
  productName: string;
  productSlug: string;
  variantSize: string;
  mrp: number;
  sellingPrice: number;
  lineTotal: number;
  lineMrpTotal: number;
  weightGrams: number;
}

export function hydrateCartLines(lines: CartLine[]): CartLineDetailed[] {
  return lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      const variant = getVariant(line.productId, line.variantId);
      if (!product || !variant) return null;
      return {
        ...line,
        productName: product.name,
        productSlug: product.slug,
        variantSize: variant.size,
        mrp: variant.mrp,
        sellingPrice: variant.sellingPrice,
        lineTotal: variant.sellingPrice * line.quantity,
        lineMrpTotal: variant.mrp * line.quantity,
        weightGrams: variant.weightGrams * line.quantity,
      };
    })
    .filter((l): l is CartLineDetailed => l !== null);
}

export function cartSubtotal(lines: CartLineDetailed[]): number {
  return lines.reduce((sum, l) => sum + l.lineTotal, 0);
}

export function cartWeightGrams(lines: CartLineDetailed[]): number {
  return lines.reduce((sum, l) => sum + l.weightGrams, 0);
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export { getProductBySlug };
