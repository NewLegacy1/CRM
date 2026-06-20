import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingLineItem } from "@/lib/onboarding/contract-template";

export type OnboardingLinkRow = {
  id: string;
  token: string;
  business_name: string;
  contact_name: string | null;
  email: string;
  client_id: string | null;
  line_items: OnboardingLineItem[];
  currency: string;
  agreement_version: string;
  status: string;
  expires_at: string | null;
};

export async function getOnboardingLinkByToken(
  admin: SupabaseClient,
  token: string
): Promise<{ link: OnboardingLinkRow | null; error?: string }> {
  const { data, error } = await admin
    .from("client_onboarding_links")
    .select(
      "id, token, business_name, contact_name, email, client_id, line_items, currency, agreement_version, status, expires_at"
    )
    .eq("token", token)
    .maybeSingle();

  if (error) {
    console.error("[onboarding] get link", error);
    return { link: null, error: "Could not load onboarding link" };
  }

  if (!data) {
    return { link: null, error: "Invalid or expired link" };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { link: null, error: "This onboarding link has expired" };
  }

  return {
    link: {
      ...data,
      line_items: Array.isArray(data.line_items) ? data.line_items : [],
    },
  };
}
