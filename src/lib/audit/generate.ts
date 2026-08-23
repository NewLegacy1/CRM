import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { listingGaps, scoreListing } from "@/lib/audit/score";
import { scrapeSubjectAndCompetitors } from "@/lib/audit/scrape-listing";
import type { AuditResult, ListingSnapshot } from "@/lib/audit/types";

function asSnapshot(
  place: Awaited<ReturnType<typeof scrapeSubjectAndCompetitors>>["subject"]
): ListingSnapshot | null {
  if (!place) return null;
  return place;
}

export async function generateAuditForLead(leadId: string): Promise<AuditResult> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { status: "failed", score: null, subject: null, competitors: [], gaps: [], error: "no admin" };
  }

  const { data: lead, error } = await admin
    .from("website_leads")
    .select("id, inquiry")
    .eq("id", leadId)
    .single();

  if (error || !lead) {
    return { status: "failed", score: null, subject: null, competitors: [], gaps: [], error: "lead not found" };
  }

  const inquiry = (lead.inquiry ?? {}) as Record<string, unknown>;
  const businessName = String(inquiry.business_name ?? "");
  const trade = String(inquiry.trade ?? "");
  const city = String(inquiry.city ?? "");

  if (!businessName || !city) {
    const failed: AuditResult = {
      status: "failed",
      score: null,
      subject: null,
      competitors: [],
      gaps: [],
      error: "missing business or city",
    };
    await persistAudit(leadId, inquiry, failed);
    return failed;
  }

  try {
    const scraped = await scrapeSubjectAndCompetitors({
      businessName,
      trade: trade || "contractor",
      city,
    });
    const subject = asSnapshot(scraped.subject);
    if (!subject) {
      const failed: AuditResult = {
        status: "failed",
        score: null,
        subject: null,
        competitors: scraped.competitors,
        gaps: [],
        error: "listing not found",
      };
      await persistAudit(leadId, inquiry, failed);
      return failed;
    }

    const score = scoreListing(subject);
    const result: AuditResult = {
      status: "ready",
      score,
      subject,
      competitors: scraped.competitors,
      gaps: listingGaps(subject, score),
    };
    await persistAudit(leadId, inquiry, result);
    return result;
  } catch (err) {
    const failed: AuditResult = {
      status: "failed",
      score: null,
      subject: null,
      competitors: [],
      gaps: [],
      error: err instanceof Error ? err.message : "scrape failed",
    };
    await persistAudit(leadId, inquiry, failed);
    return failed;
  }
}

async function persistAudit(
  leadId: string,
  inquiry: Record<string, unknown>,
  result: AuditResult
) {
  const admin = getSupabaseAdmin();
  if (!admin) return;

  await admin
    .from("website_leads")
    .update({ inquiry: { ...inquiry, audit: result } })
    .eq("id", leadId);

  const row = {
    website_lead_id: leadId,
    score: result.score?.total ?? null,
    status: result.status === "ready" ? "review" : "failed",
    payload: result,
  };

  const inserted = await admin.from("lead_audits").insert(row);
  if (inserted.error) {
    console.info("[audit] lead_audits insert skipped", inserted.error.message);
  }
}
