import { afterEach, describe, expect, it, vi } from "vitest";

const { getTokenMock, clearCachedTokenMock, statusRef } = vi.hoisted(() => ({
  getTokenMock: vi.fn(),
  clearCachedTokenMock: vi.fn(),
  statusRef: { current: "READY" as "READY" | "NOT_CONFIGURED" },
}));

vi.mock("@/lib/shiprocket/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/shiprocket/auth")>();
  return {
    ...actual,
    shiprocketAuth: {
      get status() {
        return statusRef.current;
      },
      getToken: getTokenMock,
      clearCachedToken: clearCachedTokenMock,
    },
  };
});

import { NextRequest } from "next/server";
import { GET } from "./route";

const SECRET = "test-diagnostics-secret";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/diagnostics/shiprocket", {
    method: "GET",
    headers,
  });
}

describe("GET /api/diagnostics/shiprocket", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    statusRef.current = "READY";
    getTokenMock.mockReset();
    clearCachedTokenMock.mockReset();
  });

  it("returns a generic 404 when no access key is provided", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeRequest());

    expect(res.status).toBe(404);
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(clearCachedTokenMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a generic 404 when the access key is incorrect", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const res = await GET(makeRequest({ "x-diagnostics-key": "wrong-secret" }));

    expect(res.status).toBe(404);
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(clearCachedTokenMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports not_configured (and never attempts auth) when Shiprocket credentials are absent", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    statusRef.current = "NOT_CONFIGURED";

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ configured: false, status: "not_configured" });
    expect(getTokenMock).not.toHaveBeenCalled();
    expect(clearCachedTokenMock).not.toHaveBeenCalled();
  });

  it("with a correct access key, runs a fresh auth attempt and reports success", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getTokenMock.mockResolvedValue("super-secret-bearer-token-xyz");

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const rawText = await res.text();
    const body = JSON.parse(rawText);

    expect(res.status).toBe(200);
    expect(body).toEqual({ configured: true, status: "ok" });
    // clearCachedToken() must run, and must run before getToken() so this is
    // always a fresh attempt, never a cached result.
    expect(clearCachedTokenMock).toHaveBeenCalledTimes(1);
    expect(getTokenMock).toHaveBeenCalledTimes(1);
    expect(clearCachedTokenMock.mock.invocationCallOrder[0]).toBeLessThan(
      getTokenMock.mock.invocationCallOrder[0]
    );
    // The token itself must never appear anywhere in the response.
    expect(rawText).not.toContain("super-secret-bearer-token-xyz");
  });

  it("with a correct access key, classifies an authentication failure without exposing the raw error", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    const { ShiprocketAuthError } = await vi.importActual<typeof import("@/lib/shiprocket/auth")>(
      "@/lib/shiprocket/auth"
    );
    getTokenMock.mockRejectedValue(
      new ShiprocketAuthError("SHIPROCKET_AUTH_FAILED: login request returned status 401.")
    );

    const res = await GET(makeRequest({ "x-diagnostics-key": SECRET }));
    const rawText = await res.text();
    const body = JSON.parse(rawText);

    expect(res.status).toBe(200);
    expect(body).toEqual({ configured: true, status: "auth_failed", httpStatusHint: 401 });
    expect(clearCachedTokenMock).toHaveBeenCalledTimes(1);
    // Only the classified enum + a bare number may appear — never the raw
    // fixed-format error message text itself.
    expect(rawText).not.toContain("SHIPROCKET_AUTH_FAILED");
    expect(rawText).not.toContain("login request");
  });

  it("never calls fetch directly (all Shiprocket access is via the mocked auth module) across a full run", async () => {
    vi.stubEnv("DIAGNOSTICS_ACCESS_KEY", SECRET);
    getTokenMock.mockResolvedValue("token-abc");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await GET(makeRequest({ "x-diagnostics-key": SECRET }));

    // No courier/serviceability, order, shipment, AWB, or tracking endpoint
    // — in fact no HTTP call of any kind — is made by this route itself.
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
