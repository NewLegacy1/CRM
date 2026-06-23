import { getSupabaseAdmin } from "@/lib/db/supabaseAdmin";
import { APP_PRODUCTS } from "@/lib/stripe/apps";
import { backfillAppSubscriptions } from "@/lib/stripe/sync-subscription";

export async function autoSyncAllTrackedApps(): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;

  for (const app of APP_PRODUCTS) {
    try {
      await backfillAppSubscriptions(admin, app.slug);
    } catch (error) {
      console.error(`Auto-sync failed for ${app.slug}:`, error);
    }
  }
}
