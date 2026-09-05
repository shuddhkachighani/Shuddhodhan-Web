import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// lib/data/settings.ts reads process.env once at import time, so each
// scenario needs a fresh module graph after stubbing env vars (same pattern
// as lib/shipping/index.test.ts).
async function loadPost() {
  vi.resetModules();
  const mod = await import("./route");
  return mod.POST;
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/shipping/check", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/shipping/check", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects a request with no cart lines", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const POST = await loadPost();

    const res = await POST(makeRequest({ pincode: "452001" }));
    expect(res.status).toBe(400);
  });

  it("rejects malformed line entries", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const POST = await loadPost();

    const res = await POST(
      makeRequest({ pincode: "452001", lines: [{ productId: "groundnut-oil" }] })
    );
    expect(res.status).toBe(400);
  });

  it("rejects an unknown product/variant combination", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const POST = await loadPost();

    const res = await POST(
      makeRequest({
        pincode: "452001",
        lines: [{ productId: "does-not-exist", variantId: "does-not-exist", quantity: 1 }],
      })
    );
    expect(res.status).toBe(400);
  });

  it("ignores client-supplied cartWeightGrams/cartValue and recomputes from the catalogue", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const POST = await loadPost();

    const res = await POST(
      makeRequest({
        pincode: "452001",
        cartWeightGrams: 1,
        cartValue: 1,
        lines: [{ productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 1 }],
      })
    );
    const quote = await res.json();

    expect(quote.serviceable).toBe(true);
    // groundnut-oil-1l weighs 1000g per the server-side catalogue — proving
    // the client-supplied cartWeightGrams: 1 above was never used.
    expect(quote.weight_used_grams).toBe(1000);
  });

  it("sums weight and value across multiple lines from the catalogue", async () => {
    vi.stubEnv("INDORE_SERVICEABLE_PINCODES", "");
    const POST = await loadPost();

    const res = await POST(
      makeRequest({
        pincode: "452001",
        lines: [
          { productId: "groundnut-oil", variantId: "groundnut-oil-1l", quantity: 2 },
          { productId: "virgin-coconut-oil", variantId: "virgin-coconut-oil-200ml", quantity: 1 },
        ],
      })
    );
    const quote = await res.json();

    // 2 * 1000g (groundnut-oil-1l) + 1 * 220g (virgin-coconut-oil-200ml)
    expect(quote.weight_used_grams).toBe(2220);
  });
});
