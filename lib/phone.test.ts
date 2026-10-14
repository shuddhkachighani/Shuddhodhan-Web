import { describe, expect, it } from "vitest";
import { isValidNormalizedMobile, normalizeMobile } from "./phone";

describe("normalizeMobile", () => {
  it("strips non-digit characters", () => {
    expect(normalizeMobile("98765 43210")).toBe("9876543210");
    expect(normalizeMobile("+91-98765-43210")).toBe("9876543210");
  });

  it("drops a country-code prefix by keeping the last 10 digits", () => {
    expect(normalizeMobile("919876543210")).toBe("9876543210");
    expect(normalizeMobile("+919876543210")).toBe("9876543210");
  });

  it("leaves a bare 10-digit number unchanged", () => {
    expect(normalizeMobile("9876543210")).toBe("9876543210");
  });
});

describe("isValidNormalizedMobile", () => {
  it("accepts a valid 10-digit Indian mobile number", () => {
    expect(isValidNormalizedMobile("9876543210")).toBe(true);
  });

  it("rejects numbers that are too short, too long, or start wrong", () => {
    expect(isValidNormalizedMobile("987654321")).toBe(false);
    expect(isValidNormalizedMobile("98765432101")).toBe(false);
    expect(isValidNormalizedMobile("1876543210")).toBe(false);
    expect(isValidNormalizedMobile("")).toBe(false);
  });
});
