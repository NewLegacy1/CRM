import type { FunnelStageResult, BiggestDrop } from "@/lib/showroom-funnel";

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

interface FunnelStageTableProps {
  title: string;
  subtitle?: string;
  stats: FunnelStageResult[];
  biggestDrop: BiggestDrop | null;
}

export function FunnelStageTable({ title, subtitle, stats, biggestDrop }: FunnelStageTableProps) {
  const maxSessions = Math.max(1, ...stats.map((s) => s.sessions));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>

      {stats.every((s) => s.sessions === 0) ? (
        <p className="text-sm text-zinc-500">
          No events recorded yet for this range. Once the Showroom site and DetailOps
          are wired up, funnel data will appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {stats.map((stage) => (
            <div key={stage.key}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium text-zinc-200">{stage.label}</span>
                <span className="text-zinc-400">
                  {stage.sessions.toLocaleString()}{" "}
                  {stage.conversionFromFirst !== null && (
                    <span className="text-zinc-500">
                      ({formatPercent(stage.conversionFromFirst)} of visits)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-violet-500"
                  style={{ width: `${(stage.sessions / maxSessions) * 100}%` }}
                />
              </div>
              {stage.conversionFromPrevious !== null && (
                <p className="mt-1 text-xs text-zinc-500">
                  {formatPercent(stage.conversionFromPrevious)} continued from previous step
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {biggestDrop && biggestDrop.dropRate > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-300">
            Biggest drop-off: <strong>{formatPercent(biggestDrop.dropRate)}</strong> of
            visitors leave between <strong>{biggestDrop.fromLabel}</strong> and{" "}
            <strong>{biggestDrop.toLabel}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
