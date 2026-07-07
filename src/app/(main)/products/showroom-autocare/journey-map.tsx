"use client";

import { useState, type ComponentType, type CSSProperties } from "react";
import {
  Eye,
  MousePointerClick,
  User,
  ShoppingBag,
  FileText,
  CalendarClock,
  CheckCircle2,
  Users,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { FunnelStageResult, BiggestDrop } from "@/lib/showroom-funnel";

const STAGE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  page_view: Eye,
  cta_click: MousePointerClick,
  contact: User,
  catalog: ShoppingBag,
  details: FileText,
  datetime: CalendarClock,
  booking_confirmed: CheckCircle2,
};

const STAGE_LABELS: Record<string, string> = {
  page_view: "Landing Page",
  cta_click: "Viewed Services",
  contact: "Selected Service",
  catalog: "Added to Cart",
  details: "Enter Details",
  datetime: "Select Date",
  booking_confirmed: "Booking Confirmed",
};

const NODE_THEMES = [
  { ring: "#a855f7", glow: "#a855f7" },
  { ring: "#a855f7", glow: "#b06bf5" },
  { ring: "#ec4899", glow: "#f43f5e" },
  { ring: "#3b82f6", glow: "#3b82f6" },
  { ring: "#3b82f6", glow: "#60a5fa" },
  { ring: "#06b6d4", glow: "#22d3ee" },
  { ring: "#22d3ee", glow: "#22d3ee" },
];

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatRecoveryCount(count: number): string {
  if (count >= 1000) return `+${(count / 1000).toFixed(1)}K`;
  if (count > 0) return `+${count.toLocaleString()}`;
  return "—";
}

function formatDelta(current: number, compare: number): string | null {
  if (compare === 0) return current > 0 ? "+100%" : null;
  const pct = ((current - compare) / compare) * 100;
  if (Math.abs(pct) < 0.05) return null;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

interface JourneyMapProps {
  title?: string;
  subtitle?: string;
  dateRangeLabel?: string;
  lastUpdated?: string | null;
  stats: FunnelStageResult[];
  compareStats?: FunnelStageResult[] | null;
  compareLabel?: string;
  biggestDrop: BiggestDrop | null;
  emptyPeriodLabel?: string;
}

export function JourneyMap({
  title = "Journey Map",
  subtitle = "See how customers move from first visit to confirmed booking.",
  dateRangeLabel = "All time",
  lastUpdated,
  stats,
  compareStats = null,
  compareLabel,
  biggestDrop,
  emptyPeriodLabel = "All time",
}: JourneyMapProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [hoveredLineMarker, setHoveredLineMarker] = useState<"drop" | "intent" | null>(null);

  const activeIndex = pinnedIndex ?? hoveredIndex;

  const hasData = stats.some((s) => s.sessions > 0);
  const count = stats.length;
  const totalSessions = stats[0]?.sessions ?? 0;
  const overallConversion = stats[stats.length - 1]?.conversionFromFirst ?? null;

  const dropFromIdx = biggestDrop
    ? stats.findIndex((s) => s.key === biggestDrop.fromKey)
    : -1;
  const showDrop =
    hasData &&
    biggestDrop !== null &&
    biggestDrop.dropRate > 0 &&
    biggestDrop.sessionsLost > 0 &&
    dropFromIdx >= 0;

  const datetimeIdx = stats.findIndex((s) => s.key === "datetime");
  const bookingIntent = datetimeIdx >= 0 ? stats[datetimeIdx] : null;

  const halfCol = 100 / count / 2;
  const nodeOnLine = (i: number) => (i / (count - 1)) * 100;
  const columnCenter = (i: number) => ((i + 0.5) / count) * 100;
  const segmentCenter = (fromIdx: number) =>
    (columnCenter(fromIdx) + columnCenter(fromIdx + 1)) / 2;

  const intentIdx = datetimeIdx >= 0 ? datetimeIdx : 5;
  const dropCalloutCenter = showDrop ? segmentCenter(dropFromIdx) : null;
  const intentCalloutCenter =
    intentIdx < count - 1 ? segmentCenter(intentIdx) : columnCenter(intentIdx);

  const lineGradient = `linear-gradient(90deg, ${NODE_THEMES.map(
    (t, i) => `${t.ring} ${nodeOnLine(i).toFixed(2)}%`
  ).join(", ")})`;

  const insightText = biggestDrop
    ? `Strengthen the ${(STAGE_LABELS[biggestDrop.fromKey] ?? biggestDrop.fromLabel).toLowerCase()} experience to reduce drop-offs and increase conversions.`
    : "Once traffic arrives, insights will highlight where visitors leave and what to fix first.";

  const activeStage = activeIndex !== null ? stats[activeIndex] : null;
  const compareStage =
    activeIndex !== null && compareStats ? compareStats[activeIndex] : null;
  const prevStage = activeIndex !== null && activeIndex > 0 ? stats[activeIndex - 1] : null;

  return (
    <section className="w-full">
      <div className="relative text-center">
        <h2 className="text-4xl font-extrabold normal-case tracking-tight text-white md:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">{subtitle}</p>
        <span className="mt-3 inline-block rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 xl:hidden">
          {dateRangeLabel}
        </span>
        <span className="absolute right-0 top-1 hidden rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 xl:inline-block">
          {dateRangeLabel}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto overflow-y-visible pb-2 [scrollbar-width:thin]">
        <div className="relative mx-auto min-w-[700px] max-w-5xl px-2 pt-[188px]">
          {hoveredLineMarker === "drop" && dropCalloutCenter !== null && biggestDrop && (
            <HoverCallout
              centerPercent={dropCalloutCenter}
              icon="drop"
              title="Engagement Drop"
              body="Many visitors leave after viewing without interacting."
              metaLabel={`From ${STAGE_LABELS[stats[dropFromIdx]?.key] ?? "previous step"}`}
              value={stats[dropFromIdx].sessions.toLocaleString()}
              delta={formatPercent(biggestDrop.dropRate)}
              deltaDirection="down"
              accent="#f43f5e"
            />
          )}

          {hoveredLineMarker === "intent" && (
            <HoverCallout
              centerPercent={intentCalloutCenter}
              icon="intent"
              title="Booking Intent"
              body="Users who select a date are highly likely to convert."
              metaLabel="Conversion after this step"
              value={hasData && bookingIntent ? formatPercent(bookingIntent.conversionFromPrevious) : "—"}
              delta={null}
              deltaDirection="up"
              accent="#22d3ee"
            />
          )}

          <div className="relative">
            <div
              className="absolute z-0"
              style={{ left: `${halfCol}%`, right: `${halfCol}%`, top: "80px" }}
            >
              <div className="pointer-events-none">
                <div
                  className="absolute left-0 right-0 top-0 h-4 -translate-y-1/2 rounded-full"
                  style={{ background: lineGradient, filter: "blur(14px)", opacity: hasData ? 0.7 : 0.5 }}
                />
                <div
                  className="absolute left-0 right-0 top-0 h-[7px] -translate-y-1/2 rounded-full"
                  style={{
                    background: lineGradient,
                    boxShadow: "0 0 6px rgba(255,255,255,0.25) inset, 0 0 10px rgba(255,255,255,0.15)",
                  }}
                />
              </div>

              {showDrop && (
                <div
                  className="absolute top-0"
                  style={{
                    left: `${nodeOnLine(dropFromIdx)}%`,
                    width: `${nodeOnLine(dropFromIdx + 1) - nodeOnLine(dropFromIdx)}%`,
                  }}
                >
                  <div className="pointer-events-none">
                    <div
                      className="absolute left-0 right-0 top-0 h-4 -translate-y-1/2 rounded-full"
                      style={{ background: "linear-gradient(90deg,#fb7185,#ef4444)", filter: "blur(12px)", opacity: 0.9 }}
                    />
                    <div
                      className="absolute left-0 right-0 top-0 h-[7px] -translate-y-1/2 rounded-full"
                      style={{ background: "linear-gradient(90deg,#fb7185,#ef4444)" }}
                    />
                  </div>

                  <button
                    type="button"
                    className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    onMouseEnter={() => setHoveredLineMarker("drop")}
                    onMouseLeave={() => setHoveredLineMarker(null)}
                    onFocus={() => setHoveredLineMarker("drop")}
                    onBlur={() => setHoveredLineMarker(null)}
                    aria-label="Engagement drop-off — hover for details"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-red-400/60 bg-[#1a0508]"
                      style={{ boxShadow: "0 0 14px rgba(239,68,68,0.85)" }}
                    >
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    </span>
                  </button>
                </div>
              )}

              {intentIdx < count - 1 && (
                <div
                  className="absolute top-0"
                  style={{
                    left: `${nodeOnLine(intentIdx)}%`,
                    width: `${nodeOnLine(intentIdx + 1) - nodeOnLine(intentIdx)}%`,
                  }}
                >
                  <button
                    type="button"
                    className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    onMouseEnter={() => setHoveredLineMarker("intent")}
                    onMouseLeave={() => setHoveredLineMarker(null)}
                    onFocus={() => setHoveredLineMarker("intent")}
                    onBlur={() => setHoveredLineMarker(null)}
                    aria-label="Booking intent — hover for details"
                  >
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-cyan-400/60 bg-[#051018]"
                      style={{ boxShadow: "0 0 14px rgba(34,211,238,0.75)" }}
                    >
                      <CalendarClock className="h-4 w-4 text-cyan-300" />
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
              {stats.map((stage, index) => {
                const theme = NODE_THEMES[index] ?? NODE_THEMES[0];
                const Icon = STAGE_ICONS[stage.key] ?? Eye;
                const isActive = activeIndex === index;
                const hasStepData = stage.sessions > 0;

                const glowStyle: CSSProperties = {
                  background: `radial-gradient(circle, ${theme.glow}80 0%, ${theme.glow}00 70%)`,
                  filter: "blur(10px)",
                };

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="flex h-8 items-center">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold"
                        style={{
                          borderColor: `${theme.ring}66`,
                          color: theme.ring,
                          background: "rgba(10,10,16,0.6)",
                        }}
                      >
                        {index + 1}
                      </span>
                    </div>

                    <div className="relative mt-2 h-20 w-20">
                      <div
                        className="absolute -inset-2 rounded-full transition-opacity duration-200"
                        style={{ ...glowStyle, opacity: isActive ? 1 : 0.85 }}
                        aria-hidden
                      />
                      <button
                        type="button"
                        onClick={() => setPinnedIndex(pinnedIndex === index ? null : index)}
                        className="relative flex h-full w-full items-center justify-center rounded-full transition-transform duration-200"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, ${theme.glow}33, #0a0a10 72%)`,
                          border: `2.5px solid ${theme.ring}`,
                          boxShadow: isActive
                            ? `0 0 0 4px ${theme.glow}44, 0 0 22px ${theme.glow}`
                            : `0 0 0 4px ${theme.glow}22, 0 0 18px ${theme.glow}99`,
                          transform: isActive ? "scale(1.08)" : "scale(1)",
                        }}
                        aria-label={`${STAGE_LABELS[stage.key]}: ${stage.sessions} sessions`}
                        aria-pressed={isActive}
                      >
                        <span style={{ filter: `drop-shadow(0 0 6px ${theme.ring})` }}>
                          <Icon className="h-7 w-7 text-white" />
                        </span>
                      </button>
                    </div>

                    <p className="mt-5 text-center text-[13px] font-semibold text-zinc-100">
                      {STAGE_LABELS[stage.key] ?? stage.label}
                    </p>
                    <p className={`mt-0.5 text-[11px] ${hasStepData ? "text-zinc-400" : "text-zinc-600"}`}>
                      {stage.sessions.toLocaleString()} sessions
                    </p>
                    <span
                      className="mt-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{
                        borderColor: `${theme.ring}55`,
                        color: theme.ring,
                        background: `${theme.glow}14`,
                      }}
                    >
                      {formatPercent(stage.conversionFromFirst)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed-height hover dock — does not shift KPI bar */}
      <div className="mx-auto mt-4 min-h-[92px] max-w-5xl rounded-2xl border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-sm">
        {activeStage && activeIndex !== null ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">
                Step {activeIndex + 1} · {STAGE_LABELS[activeStage.key] ?? activeStage.label}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {prevStage
                  ? `${formatPercent(activeStage.conversionFromPrevious)} continued from ${STAGE_LABELS[prevStage.key] ?? prevStage.label}.`
                  : "Entry point — every tracked visit starts here."}
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Current view</p>
                <p className="text-lg font-bold text-white">
                  {activeStage.sessions.toLocaleString()} sessions
                </p>
                <p className="text-xs text-zinc-500">{formatPercent(activeStage.conversionFromFirst)} of visits</p>
              </div>
              {compareStage && compareLabel && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{compareLabel}</p>
                  <p className="text-lg font-bold text-white">
                    {compareStage.sessions.toLocaleString()} sessions
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDelta(activeStage.sessions, compareStage.sessions) ?? "No change"} vs compare
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500">
            Hover a step for session details (click to pin). Hover the red or cyan icons on the path for drop-off and booking intent insights.
          </p>
        )}
      </div>

      <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <Metric
            icon={Users}
            iconBg="rgba(168,85,247,0.15)"
            iconColor="#c084fc"
            label="Total Sessions"
            value={totalSessions.toLocaleString()}
            detail="All steps combined"
          />
          <Metric
            icon={TrendingUp}
            iconBg="rgba(59,130,246,0.15)"
            iconColor="#60a5fa"
            label="Overall Conversion"
            value={hasData ? formatPercent(overallConversion) : "—"}
            detail="From visit to booking"
          />
          <Metric
            icon={TrendingDown}
            iconBg="rgba(244,63,94,0.15)"
            iconColor="#fb7185"
            label="Biggest Drop-off"
            value={showDrop && biggestDrop ? formatPercent(biggestDrop.dropRate) : "—"}
            detail={
              showDrop && biggestDrop
                ? `Between steps ${dropFromIdx + 1} → ${dropFromIdx + 2}`
                : "Waiting for data"
            }
          />
          <Metric
            icon={ArrowUpRight}
            iconBg="rgba(16,185,129,0.15)"
            iconColor="#34d399"
            label="Recovery Opportunity"
            value={showDrop && biggestDrop ? formatRecoveryCount(biggestDrop.sessionsLost) : "—"}
            detail="Potential bookings"
          />
          <div
            className="flex items-center gap-3 rounded-xl border p-4"
            style={{
              borderColor: "rgba(245,158,11,0.35)",
              background: "linear-gradient(135deg, rgba(245,158,11,0.16), rgba(245,158,11,0.04))",
            }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(245,158,11,0.2)" }}
            >
              <Lightbulb className="h-5 w-5 text-amber-400" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-amber-300">Insight</p>
              <p className="mt-0.5 text-xs leading-snug text-zinc-300">{insightText}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-amber-400/70" />
          </div>
        </div>
      </div>

      {lastUpdated ? (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <Info className="h-3 w-3" />
          Data updated {new Date(lastUpdated).toLocaleString()}
        </p>
      ) : (
        !hasData && (
          <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-zinc-600">
            {emptyPeriodLabel === "All time"
              ? "No sessions recorded yet. Tracking is live — data appears automatically once visitors hit showroomautocare.ca and go through DetailOps."
              : `No sessions in ${emptyPeriodLabel.toLowerCase()}. Try a wider range or check back as traffic comes in.`}
          </p>
        )
      )}
    </section>
  );
}

function HoverCallout({
  centerPercent,
  icon,
  title,
  body,
  metaLabel,
  value,
  delta,
  deltaDirection,
  accent,
}: {
  centerPercent: number;
  icon: "drop" | "intent";
  title: string;
  body: string;
  metaLabel: string;
  value: string;
  delta: string | null;
  deltaDirection: "up" | "down";
  accent: string;
}) {
  const clamped = Math.min(82, Math.max(18, centerPercent));
  const DeltaIcon = deltaDirection === "down" ? ArrowDownRight : ArrowUpRight;
  const deltaColor = deltaDirection === "down" ? "#fb7185" : "#34d399";
  const CalloutIcon = icon === "drop" ? MousePointerClick : CalendarClock;

  return (
    <div
      className="pointer-events-none absolute top-0 z-40 -translate-x-1/2"
      style={{ left: `${clamped}%` }}
    >
      <div
        className="w-[210px] rounded-2xl border border-white/10 bg-[#0c0c14]/95 p-3.5 backdrop-blur-md"
        style={{ boxShadow: `0 0 0 1px ${accent}22, 0 18px 40px rgba(0,0,0,0.5)` }}
      >
        <div className="flex items-start gap-2.5">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `${accent}22`, color: accent }}
          >
            <CalloutIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{body}</p>
          </div>
        </div>
        <div className="mt-2.5 border-t border-white/10 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{metaLabel}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className="text-lg font-bold text-white">{value}</span>
            {delta && (
              <span className="flex items-center gap-0.5 text-xs font-semibold" style={{ color: deltaColor }}>
                <DeltaIcon className="h-3.5 w-3.5" />
                {delta}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="relative mx-auto h-11 w-px" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${accent}, ${accent}00)` }}
        />
        <span
          className="absolute -top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
        />
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: iconBg }}
      >
        <span style={{ color: iconColor }}>
          <Icon className="h-5 w-5" />
        </span>
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-[11px] text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}
