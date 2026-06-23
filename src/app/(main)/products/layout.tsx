import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { autoSyncAllTrackedApps } from "@/lib/stripe/auto-sync";
import { ProductsSeenMarker } from "./products-seen-marker";

export default async function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) ?? "pending";
  if (role !== "owner") redirect("/dashboard");

  await autoSyncAllTrackedApps();

  return (
    <>
      <ProductsSeenMarker />
      {children}
    </>
  );
}
