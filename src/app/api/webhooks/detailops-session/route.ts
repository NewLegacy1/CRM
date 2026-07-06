import { NextResponse } from "next/server";
import { detailopsSessionWebhookSchema } from "@/lib/validators/showroom-tracking";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";

// Server-to-server webhook from DetailOps. No CORS needed (never called from
// a browser). Authenticated via a shared secret header instead of Supabase
// auth, since DetailOps and this CRM are separate Supabase projects.
//
// DetailOps hardcodes this call to only ever fire for the Showroom AutoCare
// org, but we double-check org_slug here as defense in depth so a bug on
// their side can't silently leak another org's booking data into this table.

const SHOWROOM_ORG_SLUG = "showroom-autocare";

export async function POST(request: Request) {
  const secret = process.env.DETAILOPS_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[api/webhooks/detailops-session] missing DETAILOPS_WEBHOOK_SECRET");
    return NextResponse.json(
      { ok: false, error: "Webhook is not configured" },
      { status: 503 }
    );
  }

  const providedSecret = request.headers.get("x-detailops-webhook-secret");
  if (providedSecret !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = detailopsSessionWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.org_slug !== SHOWROOM_ORG_SLUG) {
    // Not an error from the caller's perspective — just ignore silently so
    // DetailOps never sees a failed webhook response for other orgs.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error("[api/webhooks/detailops-session] missing SUPABASE_SERVICE_ROLE_KEY");
    return NextResponse.json(
      { ok: false, error: "Webhook is not configured" },
      { status: 503 }
    );
  }

  const { error } = await admin.from("showroom_funnel_events").insert({
    session_id: data.session_id,
    source: "detailops",
    event_type: data.booked ? "booking_confirmed" : "step_reached",
    step: data.step_reached,
    metadata: data.metadata ?? {},
  });

  if (error) {
    console.error("[api/webhooks/detailops-session] insert failed", error);
    return NextResponse.json(
      { ok: false, error: "Could not record event" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
