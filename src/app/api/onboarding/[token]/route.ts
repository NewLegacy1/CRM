import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import {
  buildOnboardingAgreementSections,
  getOnboardingTotal,
  type OnboardingLineItem,
} from "@/lib/onboarding/contract-template";
import { getOnboardingLinkByToken } from "@/lib/onboarding/resolve-link";
import { onboardingSubmitSchema } from "@/lib/validators/onboarding";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Onboarding is not configured." },
      { status: 503 }
    );
  }

  const { link, error } = await getOnboardingLinkByToken(admin, token);
  if (!link) {
    return NextResponse.json({ error }, { status: 404 });
  }

  const { data: submission } = await admin
    .from("client_onboarding_submissions")
    .select("id, submitted_at, signer_name")
    .eq("link_id", link.id)
    .maybeSingle();

  const lineItems = link.line_items as OnboardingLineItem[];
  const agreementSections = buildOnboardingAgreementSections({
    businessName: link.business_name,
    contactEmail: link.email,
    contactName: link.contact_name,
    lineItems,
    currency: link.currency,
    governingLawRegion: "Ontario",
  });

  return NextResponse.json({
    businessName: link.business_name,
    contactName: link.contact_name,
    email: link.email,
    currency: link.currency,
    lineItems,
    total: getOnboardingTotal(lineItems),
    agreementVersion: link.agreement_version,
    agreementSections,
    status: link.status,
    alreadySubmitted: Boolean(submission),
    submission: submission
      ? { id: submission.id, submittedAt: submission.submitted_at, signerName: submission.signer_name }
      : null,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Onboarding is not configured." },
      { status: 503 }
    );
  }

  const { link, error: linkError } = await getOnboardingLinkByToken(admin, token);
  if (!link) {
    return NextResponse.json({ error: linkError }, { status: 404 });
  }

  if (link.status !== "pending") {
    return NextResponse.json(
      { error: "This onboarding link has already been used." },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = onboardingSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const { data: submission, error: insertError } = await admin
    .from("client_onboarding_submissions")
    .insert([
      {
        link_id: link.id,
        payload: parsed.data.payload,
        signer_name: parsed.data.signerName.trim(),
        agreed_at: now,
        logo_urls: parsed.data.logoUrls,
        image_urls: parsed.data.imageUrls,
      },
    ])
    .select("id, submitted_at")
    .single();

  if (insertError) {
    console.error("[api/onboarding/submit]", insertError);
    return NextResponse.json(
      { error: "Could not save submission" },
      { status: 500 }
    );
  }

  await admin
    .from("client_onboarding_links")
    .update({ status: "submitted" })
    .eq("id", link.id);

  return NextResponse.json({
    ok: true,
    submissionId: submission.id,
    submittedAt: submission.submitted_at,
  });
}
