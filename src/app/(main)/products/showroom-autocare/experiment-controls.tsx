"use client";

import { Suspense } from "react";
import { ExperimentSelector } from "./experiment-selector";
import { LogExperimentDialog } from "./log-experiment-dialog";

interface ExperimentOption {
  id: string;
  name: string;
  started_at: string;
}

interface ExperimentControlsProps {
  experiments: ExperimentOption[];
  selectedId: string | null;
  description: string | null;
}

export function ExperimentControls({
  experiments,
  selectedId,
  description,
}: ExperimentControlsProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/[0.08] bg-transparent px-4 py-4">
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Split by experiment
        </p>
        <Suspense fallback={<div className="h-10 max-w-sm animate-pulse rounded-lg bg-zinc-800" />}>
          <ExperimentSelector experiments={experiments} selectedId={selectedId} />
        </Suspense>
        {description && <p className="mt-2 text-xs text-zinc-500">{description}</p>}
      </div>
      <LogExperimentDialog />
    </div>
  );
}
