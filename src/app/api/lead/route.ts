import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validators/lead";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
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
          "Lead capture is not configured (missing SUPABASE_SERVICE_ROLE_KEY).",
      },
      { status: 503 }
    );
  }

  const data = parsed.data;
  const inquiry = {
    business_name: data.businessName ?? null,
    services_interested: data.servicesInterested,
    message: data.message ?? null,
    preferred_contact: data.preferredContact,
    source_path: data.sourcePath ?? null,
  };

  const { error } = await admin.from("website_leads").insert({
    name: data.name,
    email: data.email,
    phone: (data.phone ?? "").trim() || "—",
    website: data.websiteUrl?.trim() || null,
    source: "marketing_site",
    inquiry,
  });

  if (error) {
    console.error("[api/lead] website_leads", error);
    const fallback = await admin.from("lead_submissions").insert({
      id: randomUUID(),
      name: data.name,
      business_name: data.businessName ?? null,
      email: data.email,
      phone: data.phone ?? null,
      website_url: data.websiteUrl ?? null,
      services_interested: data.servicesInterested,
      message: data.message ?? null,
      preferred_contact: data.preferredContact,
      source_path: data.sourcePath ?? null,
    });
    if (fallback.error) {
      console.error("[api/lead] lead_submissions", fallback.error);
      return NextResponse.json(
        { error: "Could not save submission" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
