import type { SupabaseClient } from "@supabase/supabase-js";

export type OnboardingLineItem = {
  description: string;
  quantity: number;
  unit_amount: number;
};

export type ProjectOnboardingLink = {
  id: string;
  token: string;
  business_name: string;
  contact_name: string | null;
  email: string;
  currency: string;
  line_items: OnboardingLineItem[];
  status: string;
  created_at: string;
  submission: ProjectOnboardingSubmission | null;
};

export type ProjectOnboardingSubmission = {
  id: string;
  signer_name: string;
  submitted_at: string;
  logo_urls: string[];
  image_urls: string[];
  payload: Record<string, string | undefined>;
  invoice_id: string | null;
};

/** Links with a submission that still needs invoice review. */
export function isPendingContractReview(link: ProjectOnboardingLink): boolean {
  return link.status === "submitted" && Boolean(link.submission) && !link.submission?.invoice_id;
}

function normalizeSubmission(
  raw: ProjectOnboardingSubmission | ProjectOnboardingSubmission[] | null
): ProjectOnboardingSubmission | null {
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

export async function fetchProjectOnboardingLinks(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectOnboardingLink[]> {
  const { data, error } = await supabase
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
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[onboarding] fetchProjectOnboardingLinks", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    line_items: Array.isArray(row.line_items) ? row.line_items : [],
    submission: normalizeSubmission(
      row.submission as
        | ProjectOnboardingSubmission
        | ProjectOnboardingSubmission[]
        | null
    ),
  }));
}

export async function fetchPendingContractCountsByProject(
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("client_onboarding_links")
    .select(
      `
      project_id,
      status,
      submission:client_onboarding_submissions(invoice_id)
    `
    )
    .eq("status", "submitted")
    .not("project_id", "is", null);

  if (error) {
    console.error("[onboarding] fetchPendingContractCountsByProject", error);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const raw = row.submission as
      | { invoice_id: string | null }
      | { invoice_id: string | null }[]
      | null;
    const sub = Array.isArray(raw) ? raw[0] : raw;
    if (!row.project_id || sub?.invoice_id) continue;
    counts[row.project_id] = (counts[row.project_id] ?? 0) + 1;
  }
  return counts;
}

export function countPendingForProject(links: ProjectOnboardingLink[]): number {
  return links.filter(isPendingContractReview).length;
}

export function formatOnboardingTotal(
  lineItems: OnboardingLineItem[],
  currency: string
): string {
  const total = lineItems.reduce(
    (sum, row) => sum + row.quantity * row.unit_amount,
    0
  );
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(total);
}
