import type { FunnelEventRow } from "./showroom-funnel";

export type DateRangePreset = "all" | "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeSelection {
  preset: DateRangePreset;
  /** ISO date string YYYY-MM-DD, inclusive start (local calendar day) */
  from: string | null;
  /** ISO date string YYYY-MM-DD, inclusive end (local calendar day) */
  to: string | null;
}

export interface DateRangeBounds {
  start: Date | null;
  end: Date | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local calendar date as YYYY-MM-DD */
export function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function defaultDateRangeSelection(): DateRangeSelection {
  return { preset: "all", from: null, to: null };
}

export function dateRangeFromSearchParams(params: {
  range?: string;
  from?: string;
  to?: string;
}): DateRangeSelection {
  const preset = isDateRangePreset(params.range) ? params.range : "all";

  if (preset === "custom" && params.from && params.to) {
    return { preset: "custom", from: params.from, to: params.to };
  }

  if (preset !== "all" && preset !== "custom") {
    const bounds = resolveDateRangeBounds({ preset, from: null, to: null });
    if (bounds.start && bounds.end) {
      return {
        preset,
        from: toDateInputValue(bounds.start),
        to: toDateInputValue(bounds.end),
      };
    }
  }

  return defaultDateRangeSelection();
}

function isDateRangePreset(value: string | undefined): value is DateRangePreset {
  return value === "all" || value === "today" || value === "7d" || value === "30d" || value === "90d" || value === "custom";
}

/** Resolve inclusive local-day bounds for a selection. All time → null bounds. */
export function resolveDateRangeBounds(selection: DateRangeSelection): DateRangeBounds {
  const now = new Date();

  switch (selection.preset) {
    case "all":
      return { start: null, end: null };
    case "today": {
      return { start: startOfDay(now), end: endOfDay(now) };
    }
    case "7d":
    case "30d":
    case "90d": {
      const days = selection.preset === "7d" ? 7 : selection.preset === "30d" ? 30 : 90;
      const start = startOfDay(now);
      start.setDate(start.getDate() - (days - 1));
      return { start, end: endOfDay(now) };
    }
    case "custom": {
      if (!selection.from || !selection.to) return { start: null, end: null };
      const from = startOfDay(parseDateInput(selection.from));
      const to = endOfDay(parseDateInput(selection.to));
      if (from.getTime() > to.getTime()) return { start: to, end: from };
      return { start: from, end: to };
    }
    default: {
      const _exhaustive: never = selection.preset;
      return _exhaustive;
    }
  }
}

export function filterEventsByDateRange(
  events: FunnelEventRow[],
  selection: DateRangeSelection
): FunnelEventRow[] {
  const { start, end } = resolveDateRangeBounds(selection);
  if (!start || !end) return events;

  const startMs = start.getTime();
  const endMs = end.getTime();

  return events.filter((event) => {
    const t = new Date(event.created_at).getTime();
    return t >= startMs && t <= endMs;
  });
}

export function formatDateRangeLabel(selection: DateRangeSelection): string {
  const { start, end } = resolveDateRangeBounds(selection);
  if (!start || !end) return "All time";

  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  if (selection.preset === "today") return `Today · ${fmt(start)}`;

  if (selection.preset === "7d") return `Last 7 days · ${fmt(start)} – ${fmt(end)}`;
  if (selection.preset === "30d") return `Last 30 days · ${fmt(start)} – ${fmt(end)}`;
  if (selection.preset === "90d") return `Last 90 days · ${fmt(start)} – ${fmt(end)}`;

  if (start.toDateString() === end.toDateString()) return fmt(start);
  return `${fmt(start)} – ${fmt(end)}`;
}

export function buildDateRangeSearchParams(
  selection: DateRangeSelection,
  base?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(base?.toString() ?? "");

  if (selection.preset === "all") {
    params.delete("range");
    params.delete("from");
    params.delete("to");
    return params;
  }

  params.set("range", selection.preset);

  if (selection.preset === "custom" && selection.from && selection.to) {
    params.set("from", selection.from);
    params.set("to", selection.to);
  } else {
    params.delete("from");
    params.delete("to");
  }

  return params;
}
