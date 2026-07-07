import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import type { FunnelEventRow } from "@/lib/showroom-funnel";
import { dateRangeFromSearchParams } from "@/lib/showroom-date-range";
import { FunnelDashboard } from "./funnel-dashboard";

interface Experiment {
  id: string;
  name: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
}

export default async function ShowroomAutoCarePage({
  searchParams,
}: {
  searchParams: Promise<{ experiment?: string; range?: string; from?: string; to?: string }>;
}) {
  const { experiment: experimentId, range, from, to } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) ?? "pending";
  if (role !== "owner") redirect("/products");

  const [{ data: experiments }, { data: events }] = await Promise.all([
    supabase
      .from("experiments")
      .select("id, name, description, started_at, ended_at")
      .order("started_at", { ascending: false }),
    supabase
      .from("showroom_funnel_events")
      .select("session_id, event_type, step, created_at")
      .order("created_at", { ascending: true }),
  ]);

  const allEvents: FunnelEventRow[] = events ?? [];
  const experimentList: Experiment[] = experiments ?? [];
  const dateRange = dateRangeFromSearchParams({ range, from, to });

  return (
    <div className="relative -mx-4 -mt-4 -mb-6 min-h-[calc(100dvh-4rem)] lg:-mx-6 lg:-mt-6">
      <div className="pointer-events-none absolute inset-0 bg-[#07070c]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -8%, rgba(139,92,246,0.22), transparent 58%), radial-gradient(ellipse 50% 40% at 92% 88%, rgba(6,182,212,0.14), transparent 52%)",
        }}
      />

      <div className="relative space-y-6 px-4 py-5 lg:px-6 lg:py-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-violet-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Products
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image
              src="https://www.showroomautocare.ca/logo.png"
              alt="Showroom AutoCare logo"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold normal-case tracking-tight text-zinc-100">Showroom AutoCare</h1>
              <p className="mt-0.5 text-sm text-zinc-500">Conversion journey · showroomautocare.ca</p>
            </div>
          </div>
          <a
            href="https://www.showroomautocare.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:text-violet-200"
          >
            Visit site
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <FunnelDashboard
          events={allEvents}
          experiments={experimentList}
          selectedExperimentId={experimentId ?? null}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
