import { afterEach, describe, expect, it, vi } from "vitest";
import { ShiprocketAuth, ShiprocketAuthError } from "./auth";

function stubFetchOnce(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue(response as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("ShiprocketAuth", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports NOT_CONFIGURED when no credentials are set", () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "");
    const auth = new ShiprocketAuth();
    expect(auth.status).toBe("NOT_CONFIGURED");
  });

  it("reports NOT_CONFIGURED when only one credential is set", () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "");
    const auth = new ShiprocketAuth();
    expect(auth.status).toBe("NOT_CONFIGURED");
  });

  it("reports READY once both credentials are set", () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    const auth = new ShiprocketAuth();
    expect(auth.status).toBe("READY");
  });

  it("fails safely, without ever calling fetch, when credentials are missing", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "");
    const fetchMock = stubFetchOnce({ ok: true, json: async () => ({ token: "should-not-be-used" }) });
    const auth = new ShiprocketAuth();

    await expect(auth.getToken()).rejects.toThrow(ShiprocketAuthError);
    await expect(auth.getToken()).rejects.toThrow(/SHIPROCKET_NOT_CONFIGURED/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("authenticates and returns the token from a mocked login response", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    const fetchMock = stubFetchOnce({ ok: true, json: async () => ({ token: "mock-token-123" }) });
    const auth = new ShiprocketAuth();

    const token = await auth.getToken();

    expect(token).toBe("mock-token-123");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://apiv2.shiprocket.in/v1/external/auth/login");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "ops@example.com", password: "secret" });
  });

  it("caches the token so a second call does not hit the network again", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    const fetchMock = stubFetchOnce({ ok: true, json: async () => ({ token: "mock-token-123" }) });
    const auth = new ShiprocketAuth();

    await auth.getToken();
    await auth.getToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("re-authenticates after clearCachedToken()", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    const fetchMock = stubFetchOnce({ ok: true, json: async () => ({ token: "mock-token-123" }) });
    const auth = new ShiprocketAuth();

    await auth.getToken();
    auth.clearCachedToken();
    await auth.getToken();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails safely on a non-OK login response", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "wrong-password");
    stubFetchOnce({ ok: false, status: 401, json: async () => ({ message: "Invalid credentials" }) });
    const auth = new ShiprocketAuth();

    await expect(auth.getToken()).rejects.toThrow(ShiprocketAuthError);
    await expect(auth.getToken()).rejects.toThrow(/status 401/);
  });

  it("fails safely when the login response has no token field", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    stubFetchOnce({ ok: true, json: async () => ({}) });
    const auth = new ShiprocketAuth();

    await expect(auth.getToken()).rejects.toThrow(ShiprocketAuthError);
    await expect(auth.getToken()).rejects.toThrow(/did not include a token/);
  });

  it("fails safely when the login request itself throws (network error)", async () => {
    vi.stubEnv("SHIPROCKET_API_EMAIL", "ops@example.com");
    vi.stubEnv("SHIPROCKET_API_PASSWORD", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("getaddrinfo ENOTFOUND apiv2.shiprocket.in"))
    );
    const auth = new ShiprocketAuth();

    await expect(auth.getToken()).rejects.toThrow(ShiprocketAuthError);
    await expect(auth.getToken()).rejects.toThrow(/request could not be sent/);
  });
});
