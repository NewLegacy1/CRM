import { NextResponse } from "next/server";
import { showroomTrackEventSchema } from "@/lib/validators/showroom-tracking";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { buildCorsHeaders } from "@/lib/cors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Public, unauthenticated endpoint called from a different origin
// (showroomautocare.ca) via navigator.sendBeacon/fetch(keepalive). It must
// never be slow or throw in a way that could surface to the visitor — always
// resolve quickly with a plain JSON response.

const RATE_LIMIT = { limit: 60, windowMs: 60_000 };

export async function OPTIONS(request: Request) {
  const corsHeaders = buildCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers: corsHeaders ?? {} });
}

export async function POST(request: Request) {
  const corsHeaders = buildCorsHeaders(request) ?? {};

  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`track-showroom:${ip}`, RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limited" },
      { status: 429, headers: corsHeaders }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: corsHeaders }
    );
  }

  const parsed = showroomTrackEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400, headers: corsHeaders }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[api/track/showroom] missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { ok: false, error: "Tracking is not configured" },
      { status: 503, headers: corsHeaders }
    );
  }

  const data = parsed.data;
  const { error } = await admin.from("showroom_funnel_events").insert({
    session_id: data.session_id,
    source: "showroom_site",
    event_type: data.event_type,
    page_path: data.page_path ?? null,
    metadata: data.metadata ?? {},
  });

  if (error) {
    console.error("[api/track/showroom] insert failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not record event" },
      { status: 500, headers: corsHeaders }
    );
  }

  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}
