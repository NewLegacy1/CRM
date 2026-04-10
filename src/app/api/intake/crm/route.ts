import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { crmIntakeSchema } from "@/lib/validators/intake";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = crmIntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Intake is not configured (missing SUPABASE_SERVICE_ROLE_KEY or URL).",
      },
      { status: 503 }
    );
  }

  const d = parsed.data;
  const { error } = await admin.from("crm_intake_submissions").insert({
    id: randomUUID(),
    business_name: d.businessName,
    primary_contact_name: d.primaryContactName,
    email: d.email,
    phone: d.phone,
    payload: d.payload,
  });

  if (error) {
    console.error("[api/intake/crm]", error);
    return NextResponse.json({ error: "Could not save submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
