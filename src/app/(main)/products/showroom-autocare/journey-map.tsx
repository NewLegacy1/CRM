"use client";

import { useId, useState, type ComponentType } from "react";
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
  Info,
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
  { ring: "#c084fc", glow: "rgba(192,132,252,0.75)", fill: "rgba(168,85,247,0.25)" },
  { ring: "#d946ef", glow: "rgba(217,70,239,0.7)", fill: "rgba(192,132,252,0.22)" },
  { ring: "#f472b6", glow: "rgba(244,114,182,0.7)", fill: "rgba(236,72,153,0.22)" },
  { ring: "#818cf8", glow: "rgba(129,140,248,0.7)", fill: "rgba(99,102,241,0.22)" },
  { ring: "#60a5fa", glow: "rgba(96,165,250,0.7)", fill: "rgba(59,130,246,0.22)" },
  { ring: "#22d3ee", glow: "rgba(34,211,238,0.75)", fill: "rgba(34,211,238,0.2)" },
  { ring: "#06b6d4", glow: "rgba(6,182,212,0.8)", fill: "rgba(6,182,212,0.25)" },
];

type TooltipTone = "violet" | "cyan" | "amber" | "default";

interface NodeTooltip {
  title: string;
  body: string;
  highlight: string;
  tone: TooltipTone;
}

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

function getNodeTooltip(
  stage: FunnelStageResult,
  index: number,
  stats: FunnelStageResult[],
  biggestDrop: BiggestDrop | null,
  hasData: boolean
): NodeTooltip {
  const label = STAGE_LABELS[stage.key] ?? stage.label;
  const prev = index > 0 ? stats[index - 1] : null;

  if (hasData && biggestDrop && stage.key === biggestDrop.toKey) {
    return {
      title: "Engagement Drop",
      tone: "violet",
      body: `${formatPercent(biggestDrop.dropRate)} of visitors leave between ${STAGE_LABELS[biggestDrop.fromKey] ?? biggestDrop.fromLabel} and ${label}.`,
      highlight: `${biggestDrop.sessionsLost.toLocaleString()} sessions lost`,
    };
  }

  if (hasData && stage.key === "datetime" && stage.conversionFromPrevious !== null) {
    return {
      title: "Booking Intent",
      tone: "cyan",
      body: "Visitors who reach date selection are more likely to finish checkout.",
      highlight: `${formatPercent(stage.conversionFromPrevious)} continue to confirm`,
    };
  }

  if (hasData && biggestDrop && stage.key === biggestDrop.fromKey) {
    return {
      title: "Drop-off starts here",
      tone: "amber",
      body: `This is where the largest fall-off begins before ${STAGE_LABELS[biggestDrop.toKey] ?? biggestDrop.toLabel}.`,
      highlight: `${formatPercent(biggestDrop.dropRate)} lost to next step`,
    };
  }

  return {
    title: label,
    tone: "default",
    body: prev
      ? `${formatPercent(stage.conversionFromPrevious)} of visitors continued from ${STAGE_LABELS[prev.key] ?? prev.label}.`
      : "Starting point for every tracked session on showroomautocare.ca.",
    highlight: `${stage.sessions.toLocaleString()} sessions · ${formatPercent(stage.conversionFromFirst)} of visits`,
  };
}

const TOOLTIP_STYLES: Record<TooltipTone, string> = {
  violet: "border-violet-400/30 bg-violet-950/90 shadow-[0_0_30px_rgba(139,92,246,0.25)]",
  cyan: "border-cyan-400/30 bg-cyan-950/90 shadow-[0_0_30px_rgba(34,211,238,0.2)]",
  amber: "border-amber-400/35 bg-amber-950/85 shadow-[0_0_30px_rgba(245,158,11,0.25)]",
  default: "border-white/15 bg-zinc-950/95 shadow-[0_0_30px_rgba(255,255,255,0.06)]",
};

const TOOLTIP_TITLE_STYLES: Record<TooltipTone, string> = {
  violet: "text-violet-300",
  cyan: "text-cyan-300",
  amber: "text-amber-300",
  default: "text-zinc-200",
};

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
  const uid = useId().replace(/:/g, "");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = stats.some((s) => s.sessions > 0);
  const totalSessions = stats[0]?.sessions ?? 0;
  const overallConversion = stats[stats.length - 1]?.conversionFromFirst ?? null;

  const dropFromIndex = biggestDrop
    ? stats.findIndex((s) => s.key === biggestDrop.fromKey)
    : -1;

  const insightText = biggestDrop
    ? `Strengthen the ${(STAGE_LABELS[biggestDrop.fromKey] ?? biggestDrop.fromLabel).toLowerCase()} step to reduce drop-offs before ${(STAGE_LABELS[biggestDrop.toKey] ?? biggestDrop.toLabel).toLowerCase()}.`
    : "Once traffic arrives, insights will highlight where visitors leave and what to fix first.";

  const nodeCount = stats.length;
  const nodeY = 118;
  const nodePositions = stats.map((_, i) => ({
    x: nodeCount > 1 ? 6 + (i / (nodeCount - 1)) * 88 : 50,
    y: nodeY,
  }));

  const pathD = buildCurvedPath(nodePositions);
  const dropSegmentD =
    biggestDrop && dropFromIndex >= 0 && dropFromIndex < nodeCount - 1
      ? buildCurvedPath([nodePositions[dropFromIndex], nodePositions[dropFromIndex + 1]])
      : null;

  const dropMidpoint =
    dropFromIndex >= 0 && dropFromIndex < nodeCount - 1
      ? {
          x: (nodePositions[dropFromIndex].x + nodePositions[dropFromIndex + 1].x) / 2,
          y: nodeY,
        }
      : null;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#08080d] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.9)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(ellipse 50% 35% at 85% 90%, rgba(6,182,212,0.1), transparent 55%)",
        }}
      />

      <div className="relative px-6 pb-6 pt-6 md:px-8 md:pb-8">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300">
            {dateRangeLabel}
          </span>
        </div>

        <div className="mt-6 text-center">
          <span className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
            Conversion Funnel
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">{subtitle}</p>
        </div>

        <div className="relative mx-auto mt-12 max-w-6xl">
          <div className="relative min-h-[360px] w-full overflow-x-auto overflow-y-visible pb-2">
            <div className="relative min-w-[1080px] px-8 pb-32">
              <svg
                className="pointer-events-none absolute left-8 right-8 top-0 h-[200px] w-[calc(100%-4rem)] overflow-visible"
                viewBox="0 0 100 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`${uid}-stroke`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="30%" stopColor="#e879f9" />
                    <stop offset="55%" stopColor="#f472b6" />
                    <stop offset="75%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                  <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
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
                      stroke={`url(#${uid}-stroke)`}
                      strokeWidth="10"
                      strokeLinecap="round"
                      opacity={hasData ? 0.55 : 0.2}
                      filter={`url(#${uid}-glow)`}
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={`url(#${uid}-stroke)`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity={hasData ? 1 : 0.4}
                    />
                  </>
                )}

                {hasData && dropSegmentD && (
                  <>
                    <path
                      d={dropSegmentD}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="9"
                      strokeLinecap="round"
                      opacity={0.4}
                      filter={`url(#${uid}-glow)`}
                    />
                    <path
                      d={dropSegmentD}
                      fill="none"
                      stroke="#fb923c"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {hasData && dropMidpoint && (
                  <g transform={`translate(${dropMidpoint.x}, ${dropMidpoint.y - 18})`}>
                    <polygon
                      points="0,-10 9,6 -9,6"
                      fill="#f97316"
                      stroke="#fdba74"
                      strokeWidth="1"
                      filter={`url(#${uid}-glow)`}
                    />
                    <text
                      x="0"
                      y="22"
                      textAnchor="middle"
                      fill="#fdba74"
                      fontSize="3.2"
                      fontWeight="700"
                      letterSpacing="0.08em"
                    >
                      BIGGEST DROP-OFF
                    </text>
                  </g>
                )}
              </svg>

              <div className="relative h-[260px] pt-[48px]">
                {stats.map((stage, index) => {
                  const Icon = STAGE_ICONS[stage.key] ?? Eye;
                  const theme = NODE_THEMES[index] ?? NODE_THEMES[0];
                  const empty = stage.sessions === 0;
                  const isDropTarget = biggestDrop?.toKey === stage.key;
                  const pos = nodePositions[index];
                  const tooltip = getNodeTooltip(stage, index, stats, biggestDrop, hasData);
                  const isHovered = hoveredIndex === index;

                  return (
                    <div
                      key={stage.key}
                      className="absolute -translate-x-1/2"
                      style={{ left: `${pos.x}%`, top: 0, width: 116, zIndex: isHovered ? 30 : 10 }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {isHovered && (
                        <div
                          className={`absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-[220px] -translate-x-1/2 rounded-2xl border p-3 backdrop-blur-xl ${TOOLTIP_STYLES[tooltip.tone]}`}
                        >
                          <p
                            className={`text-[11px] font-bold uppercase tracking-wide ${TOOLTIP_TITLE_STYLES[tooltip.tone]}`}
                          >
                            {tooltip.title}
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{tooltip.body}</p>
                          <p className="mt-2 text-sm font-bold text-white">{tooltip.highlight}</p>
                        </div>
                      )}

                      <p className="text-center text-[11px] font-bold text-zinc-500">{index + 1}</p>

                      <button
                        type="button"
                        className="relative mx-auto mt-3 flex h-[76px] w-[76px] cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
                        style={{
                          boxShadow: empty
                            ? "0 0 0 1px rgba(255,255,255,0.06)"
                            : `0 0 0 2px ${theme.ring}, 0 0 32px ${theme.glow}, 0 0 64px ${theme.glow}, inset 0 0 24px ${theme.fill}`,
                        }}
                        aria-label={`${STAGE_LABELS[stage.key] ?? stage.label}: ${stage.sessions} sessions`}
                      >
                        <span
                          className="absolute inset-[-6px] rounded-full border opacity-80"
                          style={{
                            borderColor: empty ? "rgba(255,255,255,0.06)" : theme.ring,
                            boxShadow: empty ? "none" : `0 0 20px ${theme.glow}`,
                          }}
                        />
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: empty
                              ? "rgba(39,39,42,0.6)"
                              : `radial-gradient(circle at 30% 30%, ${theme.fill}, rgba(0,0,0,0.5))`,
                            border: `2px solid ${empty ? "rgba(255,255,255,0.08)" : theme.ring}`,
                          }}
                        />
                        <Icon
                          className={`relative z-10 h-6 w-6 ${empty ? "text-zinc-500" : "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"}`}
                        />
                      </button>

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
                              ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
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

        {/* Unified bottom metrics bar */}
        <div className="mt-2 rounded-2xl border border-white/10 bg-transparent">
          <div className="flex flex-col gap-0 lg:flex-row lg:items-stretch">
            <div className="grid flex-1 grid-cols-2 divide-white/10 max-lg:divide-y lg:grid-cols-4 lg:divide-x">
              <MetricCell
                icon={Users}
                iconColor="text-violet-400"
                label="Total Sessions"
                value={totalSessions.toLocaleString()}
                detail="All steps combined"
              />
              <MetricCell
                icon={TrendingUp}
                iconColor="text-blue-400"
                label="Overall Conversion"
                value={hasData ? formatPercent(overallConversion) : "—"}
                detail="From visit to booking"
              />
              <MetricCell
                icon={TrendingDown}
                iconColor="text-pink-400"
                label="Biggest Drop-off"
                value={hasData && biggestDrop ? formatPercent(biggestDrop.dropRate) : "—"}
                detail={
                  hasData && biggestDrop
                    ? `Between ${STAGE_LABELS[biggestDrop.fromKey]} → ${STAGE_LABELS[biggestDrop.toKey]}`
                    : "Waiting for data"
                }
              />
              <MetricCell
                icon={ArrowUpRight}
                iconColor="text-emerald-400"
                label="Recovery Opportunity"
                value={hasData && biggestDrop ? formatRecoveryCount(biggestDrop.sessionsLost) : "—"}
                detail="Potential bookings"
              />
            </div>
            <div className="flex min-w-0 items-start gap-3 border-t border-white/10 p-5 lg:max-w-xs lg:border-l lg:border-t-0">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-300">Insight</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{insightText}</p>
              </div>
            </div>
          </div>
        </div>

        {!hasData && (
          <p className="mt-5 text-center text-sm text-zinc-500">
            No sessions recorded yet. Tracking is live — data will appear automatically once
            visitors hit showroomautocare.ca and go through DetailOps. Hover any step to preview
            what insights will show.
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

function MetricCell({
  icon: Icon,
  iconColor,
  label,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-5 text-center">
      <Icon className={`mb-2 h-4 w-4 ${iconColor}`} />
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-500">{detail}</p>
    </div>
  );
}
