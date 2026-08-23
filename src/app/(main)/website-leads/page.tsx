import { createClient } from "@/lib/supabase/server";
import { WebsiteLeadsTable, type WebsiteLeadRow } from "./website-leads-table";

export default async function WebsiteLeadsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_leads")
    .select("id, created_at, name, email, phone, niche, source, status, inquiry, website")
    .order("created_at", { ascending: false })
    .limit(500);

  const leads = (data ?? []) as WebsiteLeadRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Site leads</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Marketing form + Booked Jobs Launch. Separate from the cold-call list.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Could not load site leads. Check that website_leads is readable for your role.
        </p>
      ) : null}
      <WebsiteLeadsTable initialLeads={leads} />
    </div>
  );
}
