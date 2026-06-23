"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { markProductsSeen } from "@/lib/products/notifications";

export async function markProductsSeenAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") return;

  await markProductsSeen(supabase, user.id);
  revalidatePath("/", "layout");
}
