import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import { computeFunnelStats, findBiggestDrop, type FunnelEventRow } from "@/lib/showroom-funnel";
import { JourneyMap } from "./journey-map";
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
  const lastUpdated = allEvents.length > 0 ? allEvents[allEvents.length - 1].created_at : null;

  return (
    <div className="space-y-5">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-violet-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Products
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-zinc-900/40 px-4 py-3 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <ExperimentSelector experiments={experimentList} selectedId={experimentId ?? null} />
          {selectedExperiment?.description && (
            <p className="mt-2 text-xs text-zinc-500">{selectedExperiment.description}</p>
          )}
        </div>
        <LogExperimentDialog />
      </div>

      {selectedExperiment ? (
        <ExperimentComparison
          experiment={selectedExperiment}
          events={allEvents}
          lastUpdated={lastUpdated}
        />
      ) : (
        <OverallFunnel events={allEvents} lastUpdated={lastUpdated} />
      )}
    </div>
  );
}

function OverallFunnel({
  events,
  lastUpdated,
}: {
  events: FunnelEventRow[];
  lastUpdated: string | null;
}) {
  const stats = computeFunnelStats(events);
  const biggestDrop = findBiggestDrop(stats);

  return (
    <JourneyMap
      stats={stats}
      biggestDrop={biggestDrop}
      dateRangeLabel="All time"
      lastUpdated={lastUpdated}
    />
  );
}

function ExperimentComparison({
  experiment,
  events,
  lastUpdated,
}: {
  experiment: Experiment;
  events: FunnelEventRow[];
  lastUpdated: string | null;
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

  const rangeEnd = experiment.ended_at
    ? new Date(experiment.ended_at).toLocaleDateString()
    : "present";

  return (
    <div className="space-y-8">
      <JourneyMap
        title="Before"
        subtitle={`Sessions recorded before ${new Date(experiment.started_at).toLocaleString()}`}
        dateRangeLabel={`Before · ${experiment.name}`}
        stats={beforeStats}
        biggestDrop={findBiggestDrop(beforeStats)}
        lastUpdated={lastUpdated}
      />
      <JourneyMap
        title="After"
        subtitle={`Sessions from ${new Date(experiment.started_at).toLocaleString()} through ${rangeEnd}`}
        dateRangeLabel={`After · ${experiment.name}`}
        stats={afterStats}
        biggestDrop={findBiggestDrop(afterStats)}
        lastUpdated={lastUpdated}
      />
    </div>
  );
}
