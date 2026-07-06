import type { ComponentType } from "react";
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
  AlertTriangle,
  Lightbulb,
  Radio,
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

const STAGE_SHORT_LABELS: Record<string, string> = {
  page_view: "Page Visit",
  cta_click: "Book Now Click",
  contact: "Contact Info",
  catalog: "Services",
  details: "Details",
  datetime: "Date & Time",
  booking_confirmed: "Confirmed",
};

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

/** Interpolates a violet-to-cyan hue across the funnel so the path reads left-to-right. */
function stageColor(index: number, total: number): string {
  const start = 262; // violet
  const end = 189; // cyan
  const t = total > 1 ? index / (total - 1) : 0;
  const hue = start + (end - start) * t;
  return `hsl(${hue}, 82%, 62%)`;
}

const AMBER = "#f59e0b";

interface KpiCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "warning" | "info";
}

function KpiCard({ icon: Icon, label, value, detail, tone = "default" }: KpiCardProps) {
  const toneClasses =
    tone === "warning"
      ? "border-amber-500/30 bg-amber-500/[0.06]"
      : tone === "info"
        ? "border-cyan-500/20 bg-cyan-500/[0.05]"
        : "border-white/[0.08] bg-zinc-900/50";

  const iconToneClasses =
    tone === "warning"
      ? "bg-amber-500/15 text-amber-300 ring-amber-400/20"
      : tone === "info"
        ? "bg-cyan-500/15 text-cyan-300 ring-cyan-400/20"
        : "bg-violet-500/15 text-violet-300 ring-violet-400/20";

  return (
    <div className={`rounded-2xl border p-4 backdrop-blur-xl ${toneClasses}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ${iconToneClasses}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-100">{value}</p>
      {detail && <p className="mt-1 text-xs text-zinc-500">{detail}</p>}
    </div>
  );
}

interface JourneyMapProps {
  title: string;
  subtitle?: string;
  stats: FunnelStageResult[];
  biggestDrop: BiggestDrop | null;
}

export function JourneyMap({ title, subtitle, stats, biggestDrop }: JourneyMapProps) {
  const hasData = stats.some((s) => s.sessions > 0);
  const totalSessions = stats[0]?.sessions ?? 0;
  const overallConversion = stats[stats.length - 1]?.conversionFromFirst ?? null;

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-900/40 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard icon={Users} label="Total Sessions" value={totalSessions.toLocaleString()} />
        <KpiCard
          icon={TrendingUp}
          label="Overall Conversion"
          value={hasData ? formatPercent(overallConversion) : "—"}
          detail={hasData ? "visit → confirmed booking" : undefined}
        />
        {hasData && biggestDrop ? (
          <KpiCard
            icon={AlertTriangle}
            label="Biggest Drop-off"
            value={formatPercent(biggestDrop.dropRate)}
            detail={`${biggestDrop.fromLabel} → ${biggestDrop.toLabel}`}
            tone="warning"
          />
        ) : (
          <KpiCard icon={AlertTriangle} label="Biggest Drop-off" value="—" detail="Not enough data yet" />
        )}
        {hasData && biggestDrop ? (
          <KpiCard
            icon={Lightbulb}
            label="Sessions Lost There"
            value={biggestDrop.sessionsLost.toLocaleString()}
            detail="potential recoverable bookings"
            tone="info"
          />
        ) : (
          <KpiCard icon={Radio} label="Status" value="Listening" detail="Live and waiting for traffic" tone="info" />
        )}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start px-1">
          {stats.map((stage, index) => {
            const Icon = STAGE_ICONS[stage.key] ?? Eye;
            const color = stageColor(index, stats.length);
            const isDropEnd = biggestDrop?.toKey === stage.key;
            const nextStage = stats[index + 1];
            const isDropSegment = biggestDrop && nextStage?.key === biggestDrop.toKey && stage.key === biggestDrop.fromKey;
            const empty = stage.sessions === 0;

            return (
              <div key={stage.key} className="flex items-start">
                <div className="flex w-32 flex-shrink-0 flex-col items-center gap-2 text-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full ring-2 ring-white/10"
                    style={{
                      background: empty
                        ? "rgba(63,63,70,0.4)"
                        : `linear-gradient(135deg, ${color}, ${color}cc)`,
                      boxShadow: empty ? "none" : `0 0 20px -4px ${color}`,
                    }}
                  >
                    <Icon className={`h-5 w-5 ${empty ? "text-zinc-500" : "text-white"}`} />
                  </div>
                  <p className="text-xs font-medium leading-tight text-zinc-300">
                    {STAGE_SHORT_LABELS[stage.key] ?? stage.label}
                  </p>
                  <p className="text-lg font-bold text-zinc-100">{stage.sessions.toLocaleString()}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${
                      isDropEnd
                        ? "bg-amber-500/15 text-amber-300 ring-amber-400/30"
                        : "bg-violet-500/10 text-violet-300 ring-violet-400/20"
                    }`}
                  >
                    {formatPercent(stage.conversionFromFirst)}
                  </span>
                </div>

                {index < stats.length - 1 && (
                  <div className="relative mt-7 w-10 flex-shrink-0 md:w-16">
                    <div
                      className="h-1 rounded-full"
                      style={{
                        background: isDropSegment
                          ? AMBER
                          : `linear-gradient(90deg, ${color}, ${stageColor(index + 1, stats.length)})`,
                        boxShadow: isDropSegment ? `0 0 12px -1px ${AMBER}` : "none",
                      }}
                    />
                    {isDropSegment && (
                      <p className="absolute left-1/2 top-3 w-24 -translate-x-1/2 text-center text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                        Biggest drop
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!hasData && (
        <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-500">
          No sessions recorded yet for this range. The tracking pipeline is live and
          verified — this will fill in automatically once real visitors hit
          showroomautocare.ca and go through DetailOps.
        </p>
      )}
    </div>
  );
}
