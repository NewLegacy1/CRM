import type { SupabaseClient } from "@supabase/supabase-js";

const EPOCH = "1970-01-01T00:00:00.000Z";

export async function getUnseenSubscriberCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("products_last_seen_at")
    .eq("id", userId)
    .single();

  const since = profile?.products_last_seen_at ?? EPOCH;

  const { count, error } = await supabase
    .from("stripe_subscriptions")
    .select("*", { count: "exact", head: true })
    .gt("stripe_created_at", since);

  if (error) {
    console.error("Failed to count unseen subscribers:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function markProductsSeen(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ products_last_seen_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Failed to mark products seen:", error.message);
  }
}
