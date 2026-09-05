import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit and then denies within the window", () => {
    const key = `test-key-${Math.random()}`;
    const options = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(true);

    const fourth = checkRateLimit(key, options);
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets once the window elapses", () => {
    const key = `test-key-${Math.random()}`;
    const options = { limit: 1, windowMs: 1000 };

    expect(checkRateLimit(key, options).allowed).toBe(true);
    expect(checkRateLimit(key, options).allowed).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(checkRateLimit(key, options).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const options = { limit: 1, windowMs: 60_000 };
    expect(checkRateLimit("key-a", options).allowed).toBe(true);
    expect(checkRateLimit("key-b", options).allowed).toBe(true);
    expect(checkRateLimit("key-a", options).allowed).toBe(false);
  });
});
