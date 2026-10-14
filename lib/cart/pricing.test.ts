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
    // 2 * 990g (groundnut 1L actual finished packed weight) + 1 * 490g
    // (mustard 500ML actual finished packed weight)
    expect(cartWeightGrams(detailed)).toBe(2470);
  });

  it("sums item count from raw lines", () => {
    expect(cartItemCount(lines)).toBe(3);
  });
});

describe("cartWeightGrams: actual finished packed weight", () => {
  // These cover the authoritative business-supplied finished-pack weights
  // (product + bottle/jar/jerrycan), never the raw sizeMl/diagnostic values.

  it("1 x Groundnut Oil 1L = 990g", () => {
    const detailed = hydrateCartLines([
      { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 },
    ]);
    expect(cartWeightGrams(detailed)).toBe(990);
  });

  it("2 x Groundnut Oil 1L = 1980g", () => {
    const detailed = hydrateCartLines([
      { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 2 },
    ]);
    expect(cartWeightGrams(detailed)).toBe(1980);
  });

  it("1 x Groundnut Oil 5L = 4800g", () => {
    const detailed = hydrateCartLines([
      { productId: "groundnut-oil", variantId: "groundnut-oil-5l", quantity: 1 },
    ]);
    expect(cartWeightGrams(detailed)).toBe(4800);
  });

  it("1 x Groundnut Oil 15L = 14520g", () => {
    const detailed = hydrateCartLines([
      { productId: "groundnut-oil", variantId: "groundnut-oil-15l", quantity: 1 },
    ]);
    expect(cartWeightGrams(detailed)).toBe(14520);
  });

  // Ghee and Honey aren't in the product catalogue yet, so these exercise
  // cartWeightGrams() directly against synthetic line-weight data built from
  // the same authoritative finished-pack figures, rather than inventing
  // fictitious catalogue SKUs.
  function syntheticLine(weightGrams: number, quantity: number) {
    return {
      productId: "synthetic",
      variantId: "synthetic",
      quantity,
      productName: "Synthetic",
      productSlug: "synthetic",
      variantSize: "synthetic",
      mrp: 0,
      sellingPrice: 0,
      lineTotal: 0,
      lineMrpTotal: 0,
      weightGrams: weightGrams * quantity,
    };
  }

  it("1 x Ghee 1000ml pack = 1400g", () => {
    expect(cartWeightGrams([syntheticLine(1400, 1)])).toBe(1400);
  });

  it("1 x Honey 500g jar = 725g", () => {
    expect(cartWeightGrams([syntheticLine(725, 1)])).toBe(725);
  });

  it("sums a mixed-category cart with quantities greater than 1", () => {
    const detailed = hydrateCartLines([
      { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 2 },
      { productId: "virgin-coconut-oil", variantId: "virgin-coconut-oil-500ml", quantity: 3 },
      { productId: "black-mustard-oil", variantId: "black-mustard-oil-5l", quantity: 1 },
    ]);
    // 2 * 990g + 3 * 490g + 1 * 4800g = 1980 + 1470 + 4800 = 8250g
    expect(cartWeightGrams(detailed)).toBe(8250);
  });
});
