import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ensureClientForOnboarding,
  sendClientInvoice,
} from "@/lib/stripe/send-client-invoice";
import type { OnboardingLineItem } from "@/lib/onboarding/contract-template";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { id: submissionId } = await context.params;
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
  if (role !== "owner" && role !== "account_manager" && role !== "demo") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: submission, error: subError } = await supabase
    .from("client_onboarding_submissions")
    .select(
      `
      id,
      invoice_id,
      link:client_onboarding_links(
        id,
        business_name,
        email,
        client_id,
        line_items,
        currency,
        status
      )
    `
    )
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.invoice_id) {
    return NextResponse.json(
      { error: "Invoice already sent for this submission" },
      { status: 409 }
    );
  }

  const rawLink = submission.link;
  const link = (Array.isArray(rawLink) ? rawLink[0] : rawLink) as {
    id: string;
    business_name: string;
    email: string;
    client_id: string | null;
    line_items: OnboardingLineItem[];
    currency: string;
    status: string;
  } | null;

  if (!link) {
    return NextResponse.json({ error: "Onboarding link not found" }, { status: 404 });
  }

  const { clientId, error: clientError } = await ensureClientForOnboarding({
    supabase,
    userId: user.id,
    businessName: link.business_name,
    email: link.email,
    existingClientId: link.client_id,
  });

  if (!clientId) {
    return NextResponse.json(
      { error: clientError ?? "Could not create client" },
      { status: 500 }
    );
  }

  if (!link.client_id) {
    await supabase
      .from("client_onboarding_links")
      .update({ client_id: clientId })
      .eq("id", link.id);
  }

  const result = await sendClientInvoice({
    supabase,
    userId: user.id,
    clientId,
    currency: link.currency,
    lineItems: link.line_items.map((row) => ({
      description: row.description,
      quantity: row.quantity,
      unit_amount: row.unit_amount,
    })),
    memo: `Website & Google Business Profile — ${link.business_name}`,
    footer: "Thank you for choosing New Legacy AI.",
  });

  if (!result.ok || !result.invoice) {
    return NextResponse.json(
      { error: result.error ?? "Failed to send invoice" },
      { status: 500 }
    );
  }

  await supabase
    .from("client_onboarding_submissions")
    .update({ invoice_id: result.invoice.id })
    .eq("id", submissionId);

  await supabase
    .from("client_onboarding_links")
    .update({ status: "invoiced" })
    .eq("id", link.id);

  return NextResponse.json({
    ok: true,
    invoice: result.invoice,
    message: result.message,
  });
}
