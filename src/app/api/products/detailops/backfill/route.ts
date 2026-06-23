import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { backfillAppSubscriptions } from "@/lib/stripe/sync-subscription";

export async function POST() {
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

  if (profile?.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await backfillAppSubscriptions(admin, "detailops");
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backfill failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
