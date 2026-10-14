const LOGIN_URL = "https://apiv2.shiprocket.in/v1/external/auth/login";

export type ShiprocketAuthStatus = "READY" | "NOT_CONFIGURED";

// Thrown for both "not configured" and "login failed" cases. The message
// never includes the password or a token — only a fixed, safe description —
// so it's safe to surface in error responses or crash reports.
export class ShiprocketAuthError extends Error {}

interface ShiprocketLoginResponse {
  token?: string;
}

/**
 * Authentication-only adapter for Shiprocket's REST API. Not wired into any
 * route yet — this just gets/caches a bearer token for future rate and
 * shipment-creation providers to share, so they don't each reimplement
 * login. Credentials are read from server-only env vars and never appear in
 * client bundles, responses, or logs.
 */
export class ShiprocketAuth {
  readonly name = "shiprocket";

  private cachedToken: string | null = null;

  get status(): ShiprocketAuthStatus {
    return this.email && this.password ? "READY" : "NOT_CONFIGURED";
  }

  private get email(): string {
    return process.env.SHIPROCKET_API_EMAIL || "";
  }

  private get password(): string {
    return process.env.SHIPROCKET_API_PASSWORD || "";
  }

  /**
   * Returns a cached bearer token if one was already fetched this process,
   * otherwise authenticates against Shiprocket and caches the result.
   * Throws ShiprocketAuthError (never crashes the process) if credentials
   * are missing or the login request fails.
   */
  async getToken(): Promise<string> {
    if (this.status === "NOT_CONFIGURED") {
      throw new ShiprocketAuthError(
        "SHIPROCKET_NOT_CONFIGURED: set SHIPROCKET_API_EMAIL and SHIPROCKET_API_PASSWORD."
      );
    }

    if (this.cachedToken) return this.cachedToken;

    let res: Response;
    try {
      res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: this.email, password: this.password }),
      });
    } catch {
      throw new ShiprocketAuthError("SHIPROCKET_AUTH_FAILED: login request could not be sent.");
    }

    if (!res.ok) {
      throw new ShiprocketAuthError(
        `SHIPROCKET_AUTH_FAILED: login request returned status ${res.status}.`
      );
    }

    let data: ShiprocketLoginResponse;
    try {
      data = await res.json();
    } catch {
      throw new ShiprocketAuthError("SHIPROCKET_AUTH_FAILED: login response was not valid JSON.");
    }

    if (!data.token) {
      throw new ShiprocketAuthError(
        "SHIPROCKET_AUTH_FAILED: login response did not include a token."
      );
    }

    this.cachedToken = data.token;
    return this.cachedToken;
  }

  /** Forces the next getToken() call to re-authenticate. */
  clearCachedToken(): void {
    this.cachedToken = null;
  }
}

export const shiprocketAuth = new ShiprocketAuth();
