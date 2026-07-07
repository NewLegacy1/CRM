"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FunnelEventRow, FunnelStageResult } from "@/lib/showroom-funnel";
import { computeFunnelStats, findBiggestDrop } from "@/lib/showroom-funnel";
import {
  filterEventsByDateRange,
  formatDateRangeLabel,
  type DateRangeSelection,
} from "@/lib/showroom-date-range";
import { JourneyMap } from "./journey-map";
import { ExperimentControls } from "./experiment-controls";
import { DateRangePicker } from "./date-range-picker";

interface Experiment {
  id: string;
  name: string;
  description: string | null;
  started_at: string;
  ended_at: string | null;
}

type SplitView = "all" | "before" | "after";

interface FunnelDashboardProps {
  events: FunnelEventRow[];
  experiments: Experiment[];
  selectedExperimentId: string | null;
  dateRange: DateRangeSelection;
}

export function FunnelDashboard({
  events,
  experiments,
  selectedExperimentId,
  dateRange,
}: FunnelDashboardProps) {
  const selectedExperiment = experiments.find((e) => e.id === selectedExperimentId) ?? null;
  const [splitView, setSplitView] = useState<SplitView>("all");

  useEffect(() => {
    setSplitView("all");
  }, [selectedExperimentId]);

  const dateFilteredEvents = useMemo(
    () => filterEventsByDateRange(events, dateRange),
    [events, dateRange]
  );

  const lastUpdated =
    dateFilteredEvents.length > 0
      ? dateFilteredEvents[dateFilteredEvents.length - 1].created_at
      : null;

  const periodLabel = formatDateRangeLabel(dateRange);

  const { beforeEvents, afterEvents } = useMemo(() => {
    if (!selectedExperiment) {
      return { beforeEvents: [] as FunnelEventRow[], afterEvents: [] as FunnelEventRow[] };
    }
    const startedAt = new Date(selectedExperiment.started_at).getTime();
    const endedAt = selectedExperiment.ended_at
      ? new Date(selectedExperiment.ended_at).getTime()
      : null;

    return {
      beforeEvents: dateFilteredEvents.filter((e) => new Date(e.created_at).getTime() < startedAt),
      afterEvents: dateFilteredEvents.filter((e) => {
        const t = new Date(e.created_at).getTime();
        return t >= startedAt && (endedAt === null || t < endedAt);
      }),
    };
  }, [dateFilteredEvents, selectedExperiment]);

  const allStats = useMemo(() => computeFunnelStats(dateFilteredEvents), [dateFilteredEvents]);
  const beforeStats = useMemo(() => computeFunnelStats(beforeEvents), [beforeEvents]);
  const afterStats = useMemo(() => computeFunnelStats(afterEvents), [afterEvents]);

  const activeStats: FunnelStageResult[] =
    selectedExperiment && splitView === "before"
      ? beforeStats
      : selectedExperiment && splitView === "after"
        ? afterStats
        : allStats;

  const compareStats: FunnelStageResult[] | null =
    selectedExperiment && splitView === "before"
      ? afterStats
      : selectedExperiment && splitView === "after"
        ? beforeStats
        : null;

  const compareLabel =
    selectedExperiment && splitView === "before"
      ? "After experiment"
      : selectedExperiment && splitView === "after"
        ? "Before experiment"
        : undefined;

  const biggestDrop = findBiggestDrop(activeStats);

  const title =
    selectedExperiment && splitView === "before"
      ? "Before"
      : selectedExperiment && splitView === "after"
        ? "After"
        : "Journey Map";

  const subtitle =
    selectedExperiment && splitView === "before"
      ? `Sessions before ${new Date(selectedExperiment.started_at).toLocaleString()} · ${periodLabel}`
      : selectedExperiment && splitView === "after"
        ? `Sessions from ${new Date(selectedExperiment.started_at).toLocaleString()} onward · ${periodLabel}`
        : "See how customers move from first visit to confirmed booking.";

  const journeyDateLabel =
    selectedExperiment && splitView === "before"
      ? `${periodLabel} · Before · ${selectedExperiment.name}`
      : selectedExperiment && splitView === "after"
        ? `${periodLabel} · After · ${selectedExperiment.name}`
        : periodLabel;

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="h-[88px] animate-pulse rounded-2xl border border-white/10 bg-black/20" />
        }
      >
        <DateRangePicker value={dateRange} />
      </Suspense>

      {selectedExperiment && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(["all", "before", "after"] as const).map((view) => {
            const labels: Record<SplitView, string> = {
              all: "All time",
              before: "Before",
              after: "After",
            };
            const active = splitView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => setSplitView(view)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                }`}
              >
                {labels[view]}
              </button>
            );
          })}
        </div>
      )}

      <JourneyMap
        title={title}
        subtitle={subtitle}
        dateRangeLabel={journeyDateLabel}
        stats={activeStats}
        compareStats={compareStats}
        compareLabel={compareLabel}
        biggestDrop={biggestDrop}
        lastUpdated={lastUpdated}
        emptyPeriodLabel={periodLabel}
      />

      <ExperimentControls
        experiments={experiments}
        selectedId={selectedExperimentId}
        description={selectedExperiment?.description ?? null}
      />
    </div>
  );
}
