import { createClient } from "@/lib/supabase/server";
import { getAppBySlug } from "@/lib/stripe/apps";
import { DetailOpsDashboard } from "./detailops-dashboard";

export default async function DetailOpsPage() {
  const supabase = await createClient();
  const app = getAppBySlug("detailops");

  const { data: subscriptions } = await supabase
    .from("stripe_subscriptions")
    .select(
      "id, customer_email, customer_name, status, plan_name, amount_cents, currency, billing_interval, stripe_created_at, current_period_end, stripe_subscription_id, stripe_customer_id"
    )
    .eq("app_slug", "detailops")
    .order("stripe_created_at", { ascending: false });

  const rows = subscriptions ?? [];
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const activeRows = rows.filter(
    (row) => row.status === "active" || row.status === "trialing"
  );

  const newThisWeek = rows.filter(
    (row) => new Date(row.stripe_created_at).getTime() >= weekAgo
  ).length;

  const mrrCents = activeRows.reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0
  );

  const currency = activeRows[0]?.currency ?? rows[0]?.currency ?? "cad";

  return (
    <DetailOpsDashboard
      subscriptions={rows}
      stats={{
        activeCount: activeRows.length,
        newThisWeek,
        mrrCents,
        currency,
      }}
      logoUrl={app?.logoUrl ?? "https://detailops.ca/detailopslogo.png"}
      tagline={app?.tagline ?? "SaaS · CRM for auto detailers"}
    />
  );
}
