import dns from "node:dns";
import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server-client";

export const dynamic = "force-dynamic"; // never statically cache/prerender this

// Classifies a Postgres/PostgREST error code into a coarse, non-sensitive
// category. This is in addition to (not instead of) returning the raw code
// itself — the code is a short, standardized identifier (e.g. "42501",
// "PGRST205") and is safe to return; only the free-text message/details/hint
// (which can echo table/column names or other context) are withheld.
function classifyError(code: string | undefined): "auth" | "schema" | "other" {
  if (!code) return "other";
  if (code === "42501" || code.startsWith("PGRST3")) return "auth"; // insufficient_privilege / JWT-related
  if (code === "42P01" || code === "42703" || code.startsWith("PGRST2")) return "schema"; // undefined_table/column, or PostgREST schema-cache family (e.g. PGRST205)
  return "other";
}

// Extracts only safe, low-level identifiers from a thrown transport/fetch
// error: the JS error constructor name (e.g. "TypeError") and, if present,
// the same for its `.cause` plus a systemic error code (e.g. "ENOTFOUND",
// "ECONNRESET", "ETIMEDOUT"). Never touches `.message`/`.stack`, which can
// echo the request URL.
function extractTransportErrorInfo(err: unknown): {
  errorName: string | null;
  errorCauseCode: string | null;
  errorCauseName: string | null;
} {
  const errorName = err instanceof Error ? err.name : null;
  const cause =
    err instanceof Error ? (err.cause as { name?: string; code?: string } | undefined) : undefined;
  return {
    errorName,
    errorCauseCode: typeof cause?.code === "string" ? cause.code : null,
    errorCauseName: typeof cause?.name === "string" ? cause.name : null,
  };
}

type NetworkProbeResult = {
  dnsResolved: boolean | null;
  dnsErrorCode: string | null;
  networkProbeStatus: "http_response" | "network_error" | "timeout" | "skipped";
  networkHttpStatus: number | null;
  networkErrorName: string | null;
  networkErrorCode: string | null;
};

function rejectAfter(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("diagnostic_probe_timeout")), ms);
  });
}

// Independent, credential-free connectivity probe: resolves the Supabase
// hostname via DNS, then (if DNS succeeds) makes a bare fetch to the
// Supabase origin with no Authorization/apikey headers. This never touches
// @supabase/supabase-js or postgrest-js, so it isolates plain network
// reachability from anything Supabase-SDK- or auth-specific. Only coarse,
// non-sensitive metadata is returned — never the hostname/URL itself.
async function probeNetwork(): Promise<NetworkProbeResult> {
  const result: NetworkProbeResult = {
    dnsResolved: null,
    dnsErrorCode: null,
    networkProbeStatus: "skipped",
    networkHttpStatus: null,
    networkErrorName: null,
    networkErrorCode: null,
  };

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return result;

  let hostname: string;
  let origin: string;
  try {
    const parsed = new URL(rawUrl);
    hostname = parsed.hostname;
    origin = parsed.origin;
  } catch {
    return result;
  }

  try {
    await Promise.race([dns.promises.lookup(hostname), rejectAfter(3000)]);
    result.dnsResolved = true;
  } catch (dnsErr) {
    result.dnsResolved = false;
    const code = dnsErr instanceof Error ? (dnsErr as NodeJS.ErrnoException).code : undefined;
    result.dnsErrorCode = typeof code === "string" ? code : null;
    return result; // no point attempting the fetch if the hostname didn't resolve
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    // Bare GET, no Supabase apikey/Authorization headers — purely tests
    // whether the network path to the host is open.
    const res = await fetch(origin, { method: "GET", signal: controller.signal });
    result.networkProbeStatus = "http_response";
    result.networkHttpStatus = res.status;
  } catch (fetchErr) {
    const isAbort = fetchErr instanceof Error && fetchErr.name === "AbortError";
    result.networkProbeStatus = isAbort ? "timeout" : "network_error";
    const info = extractTransportErrorInfo(fetchErr);
    result.networkErrorName = info.errorName;
    result.networkErrorCode = info.errorCauseCode;
  } finally {
    clearTimeout(timeout);
  }

  return result;
}

export async function GET() {
  const networkProbe = await probeNetwork();

  const base = {
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV ?? null,
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ...base,
        networkProbe,
        supabaseQuery: {
          status: "skipped_not_configured",
          errorCategory: null,
          errorCode: null,
          httpStatus: null,
          rowCountSample: null,
          timedOut: null,
          errorName: null,
          errorCauseCode: null,
          errorCauseName: null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // Read-only probe, reusing the exact same client/credentials saveOrder()
    // uses. Never inserts/updates/upserts/deletes anything.
    const { data, error, status: httpStatus } = await supabase
      .from("orders")
      .select("order_id")
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      // httpStatus === 0 with no error.code is postgrest-js's signature for a
      // transport/fetch-level failure (DNS, connection refused/reset, TLS,
      // timeout) that never reached PostgREST's HTTP layer — for these,
      // error.code is deliberately empty by design, so the underlying JS
      // error name/cause is only recoverable via throwOnError(). Re-run the
      // identical read-only SELECT once, purely to extract those safe
      // low-level identifiers.
      let transportInfo: ReturnType<typeof extractTransportErrorInfo> = {
        errorName: null,
        errorCauseCode: null,
        errorCauseName: null,
      };
      if (httpStatus === 0 && !error.code) {
        try {
          const retryController = new AbortController();
          const retryTimeout = setTimeout(() => retryController.abort(), 5000);
          try {
            await supabase
              .from("orders")
              .select("order_id")
              .limit(1)
              .abortSignal(retryController.signal)
              .throwOnError();
          } finally {
            clearTimeout(retryTimeout);
          }
        } catch (retryErr) {
          transportInfo = extractTransportErrorInfo(retryErr);
        }
      }

      return NextResponse.json(
        {
          ...base,
          networkProbe,
          supabaseQuery: {
            status: "query_error",
            errorCategory: classifyError(error.code),
            // Short, standardized Postgres/PostgREST code (e.g. "42501",
            // "PGRST205") — never the free-text message/details/hint.
            errorCode: error.code || null,
            httpStatus: httpStatus ?? null,
            rowCountSample: null,
            timedOut: null,
            ...transportInfo,
          },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ...base,
        networkProbe,
        supabaseQuery: {
          status: "ok",
          errorCategory: null,
          errorCode: null,
          httpStatus: httpStatus ?? null,
          rowCountSample: data?.length ?? 0,
          timedOut: null,
          errorName: null,
          errorCauseCode: null,
          errorCauseName: null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        ...base,
        networkProbe,
        supabaseQuery: {
          status: "network_error",
          errorCategory: null,
          errorCode: null,
          httpStatus: null,
          rowCountSample: null,
          timedOut: isAbort,
          ...extractTransportErrorInfo(err),
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
