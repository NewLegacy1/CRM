"use client";

import type { ComponentType } from "react";
import Image from "next/image";
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
  ExternalLink,
  Info,
  AlertTriangle,
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

/** Per-node accent colors along the mockup's purple → cyan gradient. */
const NODE_THEMES = [
  { ring: "#a855f7", glow: "rgba(168,85,247,0.55)", fill: "rgba(168,85,247,0.18)" },
  { ring: "#c084fc", glow: "rgba(192,132,252,0.5)", fill: "rgba(192,132,252,0.16)" },
  { ring: "#ec4899", glow: "rgba(236,72,153,0.5)", fill: "rgba(236,72,153,0.16)" },
  { ring: "#6366f1", glow: "rgba(99,102,241,0.5)", fill: "rgba(99,102,241,0.16)" },
  { ring: "#3b82f6", glow: "rgba(59,130,246,0.5)", fill: "rgba(59,130,246,0.16)" },
  { ring: "#22d3ee", glow: "rgba(34,211,238,0.5)", fill: "rgba(34,211,238,0.16)" },
  { ring: "#06b6d4", glow: "rgba(6,182,212,0.55)", fill: "rgba(6,182,212,0.18)" },
];

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatRecoveryCount(count: number): string {
  if (count >= 1000) return `+${(count / 1000).toFixed(1)}K`;
  if (count > 0) return `+${count}`;
  return "—";
}

function buildCurvedPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

interface JourneyMapProps {
  title?: string;
  subtitle?: string;
  dateRangeLabel?: string;
  lastUpdated?: string | null;
  stats: FunnelStageResult[];
  biggestDrop: BiggestDrop | null;
}

export function JourneyMap({
  title = "Journey Map",
  subtitle = "See how customers move from first visit to confirmed booking.",
  dateRangeLabel = "All time",
  lastUpdated,
  stats,
  biggestDrop,
}: JourneyMapProps) {
  const hasData = stats.some((s) => s.sessions > 0);
  const totalSessions = stats[0]?.sessions ?? 0;
  const overallConversion = stats[stats.length - 1]?.conversionFromFirst ?? null;
  const datetimeStage = stats.find((s) => s.key === "datetime");
  const bookingIntentRate = datetimeStage?.conversionFromPrevious ?? null;

  const dropFromIndex = biggestDrop
    ? stats.findIndex((s) => s.key === biggestDrop.fromKey)
    : -1;

  const insightText = biggestDrop
    ? `Strengthen the ${(STAGE_LABELS[biggestDrop.fromKey] ?? biggestDrop.fromLabel).toLowerCase()} step to reduce drop-offs before ${(STAGE_LABELS[biggestDrop.toKey] ?? biggestDrop.toLabel).toLowerCase()}.`
    : "Once traffic arrives, insights will highlight where visitors leave and what to fix first.";

  const nodeCount = stats.length;
  const nodeY = 118;
  const svgHeight = 200;
  const nodePositions = stats.map((_, i) => ({
    x: nodeCount > 1 ? 6 + (i / (nodeCount - 1)) * 88 : 50,
    y: nodeY,
  }));

  const pathD = buildCurvedPath(
    nodePositions.map((p) => ({ x: p.x, y: p.y }))
  );

  const dropSegmentD =
    biggestDrop && dropFromIndex >= 0 && dropFromIndex < nodeCount - 1
      ? buildCurvedPath([
          nodePositions[dropFromIndex],
          nodePositions[dropFromIndex + 1],
        ])
      : null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-[#0a0a0f] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85)]">
      {/* Ambient glow + grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139,92,246,0.22), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(6,182,212,0.12), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative px-6 pb-6 pt-5 md:px-8 md:pb-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-white/15">
              <Image
                src="https://www.showroomautocare.ca/logo.png"
                alt="Showroom AutoCare"
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              Showroom AutoCare
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300">
              {dateRangeLabel}
            </span>
            <a
              href="https://www.showroomautocare.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-violet-400/30 hover:text-violet-200"
            >
              Visit site
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Title block */}
        <div className="mt-8 text-center">
          <span className="inline-flex rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
            Conversion Funnel
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">{subtitle}</p>
        </div>

        {/* Journey path */}
        <div className="relative mx-auto mt-10 max-w-6xl">
          {/* Floating callouts */}
          {hasData && dropFromIndex >= 0 && biggestDrop && (
            <div
              className="absolute z-20 hidden max-w-[220px] rounded-2xl border border-white/10 bg-zinc-900/80 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:block"
              style={{
                left: `${nodePositions[Math.max(0, dropFromIndex)]?.x ?? 20}%`,
                top: "-8px",
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-300">
                Engagement Drop
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                {formatPercent(biggestDrop.dropRate)} of visitors leave between{" "}
                {biggestDrop.fromLabel} and {biggestDrop.toLabel}.
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {biggestDrop.sessionsLost.toLocaleString()} sessions lost
              </p>
            </div>
          )}

          {hasData && bookingIntentRate !== null && datetimeStage && (
            <div
              className="absolute z-20 hidden max-w-[220px] rounded-2xl border border-cyan-400/20 bg-cyan-950/40 p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:block"
              style={{
                left: `${nodePositions[5]?.x ?? 75}%`,
                top: "-8px",
                transform: "translateX(-50%)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                Booking Intent
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Visitors who reach date selection are more likely to finish checkout.
              </p>
              <p className="mt-2 text-sm font-bold text-cyan-200">
                {formatPercent(bookingIntentRate)} continue to confirm
              </p>
            </div>
          )}

          <div className="relative min-h-[340px] w-full overflow-x-auto overflow-y-visible pb-2">
            <div className="relative min-w-[1040px] px-6 pb-28">
              {/* SVG glow path */}
              <svg
                className="pointer-events-none absolute left-4 right-4 top-0 h-[200px] w-[calc(100%-2rem)] overflow-visible"
                viewBox="0 0 100 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="journeyStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="35%" stopColor="#ec4899" />
                    <stop offset="65%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="pathGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {pathD && (
                  <>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#journeyStroke)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity={hasData ? 0.25 : 0.12}
                      filter="url(#pathGlow)"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke="url(#journeyStroke)"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      opacity={hasData ? 0.95 : 0.3}
                    />
                    {hasData && dropSegmentD && (
                      <>
                        <path
                          d={dropSegmentD}
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="5"
                          strokeLinecap="round"
                          opacity={0.35}
                          filter="url(#pathGlow)"
                        />
                        <path
                          d={dropSegmentD}
                          fill="none"
                          stroke="#fb923c"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity={0.95}
                        />
                      </>
                    )}
                  </>
                )}
              </svg>

              {/* Biggest drop warning on path */}
              {hasData && biggestDrop && dropFromIndex >= 0 && dropFromIndex < nodeCount - 1 && (
                <div
                  className="absolute z-10 flex -translate-x-1/2 flex-col items-center"
                  style={{
                    left: `${(nodePositions[dropFromIndex].x + nodePositions[dropFromIndex + 1].x) / 2}%`,
                    top: "108px",
                  }}
                >
                  <div className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                    <AlertTriangle className="h-3 w-3 text-amber-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-200">
                      Biggest drop-off
                    </span>
                  </div>
                </div>
              )}

              {/* Nodes — circles sit on the path; labels hang below */}
              <div className="relative h-[240px] pt-[52px]">
                {stats.map((stage, index) => {
                  const Icon = STAGE_ICONS[stage.key] ?? Eye;
                  const theme = NODE_THEMES[index] ?? NODE_THEMES[0];
                  const empty = stage.sessions === 0;
                  const isDropTarget = biggestDrop?.toKey === stage.key;
                  const pos = nodePositions[index];

                  return (
                    <div
                      key={stage.key}
                      className="group absolute -translate-x-1/2"
                      style={{ left: `${pos.x}%`, top: 0, width: 108 }}
                    >
                      <p className="text-center text-[11px] font-bold text-zinc-500">{index + 1}</p>
                      <div
                        className="relative mx-auto mt-3 flex h-[72px] w-[72px] items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                        style={{
                          boxShadow: empty
                            ? "none"
                            : `0 0 28px ${theme.glow}, inset 0 0 20px ${theme.fill}`,
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: empty
                              ? "rgba(63,63,70,0.35)"
                              : `linear-gradient(135deg, ${theme.fill}, transparent)`,
                            border: `2px solid ${empty ? "rgba(255,255,255,0.08)" : theme.ring}`,
                          }}
                        />
                        <Icon
                          className={`relative z-10 h-6 w-6 ${empty ? "text-zinc-500" : "text-white"}`}
                        />
                      </div>
                      <p className="mt-4 text-center text-[11px] font-semibold leading-tight text-zinc-200">
                        {STAGE_LABELS[stage.key] ?? stage.label}
                      </p>
                      <p className="mt-1 text-center text-lg font-bold text-white">
                        {stage.sessions.toLocaleString()}
                      </p>
                      <div className="mt-1 flex justify-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isDropTarget && hasData
                              ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30"
                              : "bg-white/5 text-zinc-400 ring-1 ring-white/10"
                          }`}
                        >
                          {formatPercent(stage.conversionFromFirst)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom metrics strip */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <MetricTile
            icon={Users}
            iconClass="text-violet-300 bg-violet-500/15 ring-violet-400/25"
            label="Total Sessions"
            value={totalSessions.toLocaleString()}
            detail="All steps combined"
          />
          <MetricTile
            icon={TrendingUp}
            iconClass="text-blue-300 bg-blue-500/15 ring-blue-400/25"
            label="Overall Conversion"
            value={hasData ? formatPercent(overallConversion) : "—"}
            detail="From visit to booking"
          />
          <MetricTile
            icon={TrendingDown}
            iconClass="text-pink-300 bg-pink-500/15 ring-pink-400/25"
            label="Biggest Drop-off"
            value={hasData && biggestDrop ? formatPercent(biggestDrop.dropRate) : "—"}
            detail={
              hasData && biggestDrop
                ? `Between ${STAGE_LABELS[biggestDrop.fromKey] ?? biggestDrop.fromLabel} → ${STAGE_LABELS[biggestDrop.toKey] ?? biggestDrop.toLabel}`
                : "Waiting for data"
            }
          />
          <MetricTile
            icon={ArrowUpRight}
            iconClass="text-emerald-300 bg-emerald-500/15 ring-emerald-400/25"
            label="Recovery Opportunity"
            value={hasData && biggestDrop ? formatRecoveryCount(biggestDrop.sessionsLost) : "—"}
            detail="Potential bookings"
          />
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] to-zinc-900/60 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/25">
              <Lightbulb className="h-4 w-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200/90">
                Insight
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-300">{insightText}</p>
            </div>
          </div>
        </div>

        {!hasData && (
          <p className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center text-sm text-zinc-500">
            No sessions recorded yet. Tracking is live — data will appear automatically once
            visitors hit showroomautocare.ca and go through DetailOps.
          </p>
        )}

        {lastUpdated && (
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-zinc-600">
            <Info className="h-3 w-3" />
            Data updated {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricTile({
  icon: Icon,
  iconClass,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{detail}</p>
    </div>
  );
}
