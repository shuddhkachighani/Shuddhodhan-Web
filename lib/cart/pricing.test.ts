import { describe, expect, it } from "vitest";
import { cartItemCount, cartSubtotal, cartWeightGrams, hydrateCartLines } from "./pricing";
import type { CartLine } from "@/lib/types";

describe("hydrateCartLines", () => {
  it("resolves known product/variant lines with correct pricing", () => {
    const lines: CartLine[] = [
      { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 2 },
    ];
    const detailed = hydrateCartLines(lines);

    expect(detailed).toHaveLength(1);
    expect(detailed[0]).toMatchObject({
      productName: "Groundnut Oil",
      variantSize: "1 L",
      sellingPrice: 310,
      mrp: 443,
      lineTotal: 620,
      lineMrpTotal: 886,
    });
  });

  it("drops lines referencing unknown products or variants", () => {
    const lines: CartLine[] = [
      { productId: "does-not-exist", variantId: "nope", quantity: 1 },
      { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 },
    ];
    expect(hydrateCartLines(lines)).toHaveLength(1);
  });
});

describe("cart aggregates", () => {
  const lines: CartLine[] = [
    { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 2 },
    { productId: "black-mustard-oil", variantId: "black-mustard-oil-500ml", quantity: 1 },
  ];
  const detailed = hydrateCartLines(lines);

  it("sums subtotal across lines", () => {
    // 2 * 310 (groundnut 1L) + 1 * 170 (mustard 500ML)
    expect(cartSubtotal(detailed)).toBe(790);
  });

  it("sums weight across lines", () => {
    // 2 * 1000g + 1 * 520g
    expect(cartWeightGrams(detailed)).toBe(2520);
  });

  it("sums item count from raw lines", () => {
    expect(cartItemCount(lines)).toBe(3);
  });
});
