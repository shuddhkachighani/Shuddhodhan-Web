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

export async function GET() {
  const base = {
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseServiceRoleKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    nodeEnv: process.env.NODE_ENV ?? null,
  };

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ...base,
        supabaseQuery: {
          status: "skipped_not_configured",
          errorCategory: null,
          errorCode: null,
          httpStatus: null,
          rowCountSample: null,
          timedOut: null,
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
      return NextResponse.json(
        {
          ...base,
          supabaseQuery: {
            status: "query_error",
            errorCategory: classifyError(error.code),
            // Short, standardized Postgres/PostgREST code (e.g. "42501",
            // "PGRST205") — never the free-text message/details/hint.
            errorCode: error.code || null,
            httpStatus: httpStatus ?? null,
            rowCountSample: null,
            timedOut: null,
          },
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        ...base,
        supabaseQuery: {
          status: "ok",
          errorCategory: null,
          errorCode: null,
          httpStatus: httpStatus ?? null,
          rowCountSample: data?.length ?? 0,
          timedOut: null,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        ...base,
        supabaseQuery: {
          status: "network_error",
          errorCategory: null,
          errorCode: null,
          httpStatus: null,
          rowCountSample: null,
          timedOut: isAbort,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
