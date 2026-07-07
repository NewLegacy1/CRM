"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import {
  buildDateRangeSearchParams,
  toDateInputValue,
  type DateRangePreset,
  type DateRangeSelection,
} from "@/lib/showroom-date-range";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "custom", label: "Custom" },
];

interface DateRangePickerProps {
  value: DateRangeSelection;
}

export function DateRangePicker({ value }: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pushSelection = (next: DateRangeSelection) => {
    const params = buildDateRangeSearchParams(next, searchParams);
    const qs = params.toString();
    router.push(qs ? `/products/showroom-autocare?${qs}` : "/products/showroom-autocare");
  };

  const handlePreset = (preset: DateRangePreset) => {
    if (preset === "custom") {
      const today = toDateInputValue(new Date());
      pushSelection({ preset: "custom", from: value.from ?? today, to: value.to ?? today });
      return;
    }
    pushSelection({ preset, from: null, to: null });
  };

  const handleCustomChange = (field: "from" | "to", input: string) => {
    pushSelection({
      preset: "custom",
      from: field === "from" ? input : value.from ?? input,
      to: field === "to" ? input : value.to ?? input,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <CalendarRange className="h-4 w-4 text-violet-400" />
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Date range</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ id, label }) => {
          const active = value.preset === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handlePreset(id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {value.preset === "custom" && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">From</span>
            <input
              type="date"
              value={value.from ?? ""}
              onChange={(e) => handleCustomChange("from", e.target.value)}
              className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">To</span>
            <input
              type="date"
              value={value.to ?? ""}
              onChange={(e) => handleCustomChange("to", e.target.value)}
              className="h-9 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}
