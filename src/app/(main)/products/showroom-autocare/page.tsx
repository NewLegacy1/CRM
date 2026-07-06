import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { computeFunnelStats, findBiggestDrop, type FunnelEventRow } from "@/lib/showroom-funnel";
import { FunnelStageTable } from "./funnel-stage-table";
import { ExperimentSelector } from "./experiment-selector";
import { LogExperimentDialog } from "./log-experiment-dialog";

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
  searchParams: Promise<{ experiment?: string }>;
}) {
  const { experiment: experimentId } = await searchParams;
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
  const selectedExperiment = experimentList.find((exp) => exp.id === experimentId) ?? null;

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-violet-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Products
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Showroom AutoCare Funnel</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Visitors to showroomautocare.ca through to a confirmed DetailOps booking.
          </p>
        </div>
        <LogExperimentDialog />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <Label>Split by experiment</Label>
        <div className="mt-2">
          <ExperimentSelector experiments={experimentList} selectedId={experimentId ?? null} />
        </div>
        {selectedExperiment?.description && (
          <p className="mt-3 text-sm text-zinc-400">{selectedExperiment.description}</p>
        )}
      </div>

      {selectedExperiment ? (
        <ExperimentComparison experiment={selectedExperiment} events={allEvents} />
      ) : (
        <OverallFunnel events={allEvents} />
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
      {children}
    </span>
  );
}

function OverallFunnel({ events }: { events: FunnelEventRow[] }) {
  const stats = computeFunnelStats(events);
  const biggestDrop = findBiggestDrop(stats);

  return (
    <FunnelStageTable
      title="All-time funnel"
      subtitle="Every recorded session, no experiment split applied."
      stats={stats}
      biggestDrop={biggestDrop}
    />
  );
}

function ExperimentComparison({
  experiment,
  events,
}: {
  experiment: Experiment;
  events: FunnelEventRow[];
}) {
  const startedAt = new Date(experiment.started_at).getTime();
  const endedAt = experiment.ended_at ? new Date(experiment.ended_at).getTime() : null;

  const beforeEvents = events.filter((e) => new Date(e.created_at).getTime() < startedAt);
  const afterEvents = events.filter((e) => {
    const t = new Date(e.created_at).getTime();
    return t >= startedAt && (endedAt === null || t < endedAt);
  });

  const beforeStats = computeFunnelStats(beforeEvents);
  const afterStats = computeFunnelStats(afterEvents);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <FunnelStageTable
        title={`Before: ${experiment.name}`}
        subtitle={`Sessions before ${new Date(experiment.started_at).toLocaleString()}`}
        stats={beforeStats}
        biggestDrop={findBiggestDrop(beforeStats)}
      />
      <FunnelStageTable
        title={`After: ${experiment.name}`}
        subtitle={`Sessions from ${new Date(experiment.started_at).toLocaleString()}${
          experiment.ended_at ? ` to ${new Date(experiment.ended_at).toLocaleString()}` : " onward"
        }`}
        stats={afterStats}
        biggestDrop={findBiggestDrop(afterStats)}
      />
    </div>
  );
}
