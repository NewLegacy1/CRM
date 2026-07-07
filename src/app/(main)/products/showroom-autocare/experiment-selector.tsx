"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ExperimentOption {
  id: string;
  name: string;
  started_at: string;
}

interface ExperimentSelectorProps {
  experiments: ExperimentOption[];
  selectedId: string | null;
}

export function ExperimentSelector({ experiments, selectedId }: ExperimentSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={selectedId ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("experiment", value);
        } else {
          params.delete("experiment");
        }
        const qs = params.toString();
        router.push(qs ? `/products/showroom-autocare?${qs}` : "/products/showroom-autocare");
      }}
      className="flex h-10 w-full max-w-sm rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
    >
      <option value="">All-time (no experiment split)</option>
      {experiments.map((experiment) => (
        <option key={experiment.id} value={experiment.id}>
          {experiment.name} — started {new Date(experiment.started_at).toLocaleDateString()}
        </option>
      ))}
    </select>
  );
}
