import { randomUUID } from "crypto";
import { after, NextResponse } from "next/server";
import {
  bookedJobsLeadSchema,
  type BookedJobsLeadInput,
} from "@/lib/validators/booked-jobs-lead";
import { leadSchema } from "@/lib/validators/lead";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { generateAuditForLead } from "@/lib/audit/generate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const booked = bookedJobsLeadSchema.safeParse(body);
  if (booked.success) {
    return insertBookedJobsLead(booked.data);
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

async function insertBookedJobsLead(data: BookedJobsLeadInput) {
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

  const inquiry = {
    funnel: "booked-jobs",
    business_name: data.businessName,
    trade: data.trade,
    city: data.city,
    gbp_status: data.gbpStatus,
    jobs_goal: data.jobsGoal,
    ready_to_invest: data.readyToInvest,
    source_path: data.sourcePath ?? "/booked-jobs",
    headline_variant: data.headlineVariant ?? null,
    utm_source: data.utmSource ?? null,
    utm_medium: data.utmMedium ?? null,
    utm_campaign: data.utmCampaign ?? null,
    utm_content: data.utmContent ?? null,
  };

  const baseRow = {
    name: data.name,
    email: data.email,
    phone: data.phone.trim(),
    niche: data.trade,
    source: "booked-jobs",
    inquiry,
  };

  const withTracking = {
    ...baseRow,
    utm_source: data.utmSource ?? null,
    utm_medium: data.utmMedium ?? null,
    utm_campaign: data.utmCampaign ?? null,
    utm_content: data.utmContent ?? null,
    headline_variant: data.headlineVariant ?? null,
  };

  const first = await admin
    .from("website_leads")
    .insert(withTracking)
    .select("id")
    .single();
  let leadId = first.data?.id ?? null;
  if (first.error) {
    const fallback = await admin
      .from("website_leads")
      .insert(baseRow)
      .select("id")
      .single();
    if (fallback.error) {
      console.error("[api/lead] booked-jobs", first.error, fallback.error);
      return NextResponse.json(
        { error: "Could not save submission" },
        { status: 500 }
      );
    }
    leadId = fallback.data?.id ?? null;
  }

  if (leadId) {
    after(() => {
      void generateAuditForLead(leadId);
    });
  }

  return NextResponse.json({ ok: true, leadId });
}
