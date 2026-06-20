import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOnboardingLinkSchema } from "@/lib/validators/onboarding";

function generateToken(): string {
  return randomBytes(12).toString("base64url");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "owner" && role !== "account_manager" && role !== "closer" && role !== "demo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createOnboardingLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const token = generateToken();

  const { data: link, error } = await supabase
    .from("client_onboarding_links")
    .insert([
      {
        token,
        business_name: d.businessName,
        contact_name: d.contactName?.trim() || null,
        email: d.email,
        client_id: d.clientId ?? null,
        project_id: d.projectId ?? null,
        line_items: d.lineItems,
        currency: d.currency.toLowerCase(),
        created_by: user.id,
        status: "pending",
      },
    ])
    .select("id, token, business_name, email, status, created_at")
    .single();

  if (error) {
    console.error("[api/onboarding/links]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    link,
    path: `/start/${token}`,
  });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: links, error } = await supabase
    .from("client_onboarding_links")
    .select(
      `
      id,
      token,
      business_name,
      contact_name,
      email,
      currency,
      line_items,
      status,
      created_at,
      client_id,
      submission:client_onboarding_submissions(
        id,
        signer_name,
        submitted_at,
        logo_urls,
        image_urls,
        payload,
        invoice_id
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/onboarding/links GET]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ links: links ?? [] });
}
