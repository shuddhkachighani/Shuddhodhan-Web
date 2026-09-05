import { describe, expect, it } from "vitest";
import { products } from "./products";

// Regression guard against typos when the rate list is next updated by hand —
// every price in lib/data/products.ts should have come verbatim from the
// supplied Shuddhodhan rate list, so basic sanity invariants should always hold.
describe("product catalogue integrity", () => {
  it("has unique product slugs and ids", () => {
    const slugs = products.map((p) => p.slug);
    const ids = products.map((p) => p.id);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique variant ids across the whole catalogue", () => {
    const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(variantIds).size).toBe(variantIds.length);
  });

  it("never prices a variant's selling price above its MRP", () => {
    for (const product of products) {
      for (const variant of product.variants) {
        expect(variant.sellingPrice).toBeLessThanOrEqual(variant.mrp);
      }
    }
  });

  it("gives every active product at least one variant", () => {
    for (const product of products.filter((p) => p.active)) {
      expect(product.variants.length).toBeGreaterThan(0);
    }
  });

  it("marks Castor Oil as non-culinary", () => {
    const castor = products.find((p) => p.id === "castor-oil");
    expect(castor?.intendedUse).toBe("NON_CULINARY");
  });
});
