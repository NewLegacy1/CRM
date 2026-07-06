export interface FunnelEventRow {
  session_id: string;
  event_type: string;
  step: string | null;
  created_at: string;
}

export interface FunnelStageResult {
  key: string;
  label: string;
  sessions: number;
  conversionFromPrevious: number | null;
  conversionFromFirst: number | null;
}

interface FunnelStageDef {
  key: string;
  label: string;
  match: (event: FunnelEventRow) => boolean;
}

const FUNNEL_STAGES: FunnelStageDef[] = [
  { key: "page_view", label: "Page Visits", match: (e) => e.event_type === "page_view" },
  { key: "cta_click", label: "Clicked Book Now", match: (e) => e.event_type === "cta_click" },
  { key: "contact", label: "Started Booking (Contact Info)", match: (e) => e.step === "contact" },
  { key: "catalog", label: "Selected Services", match: (e) => e.step === "catalog" },
  { key: "details", label: "Entered Details", match: (e) => e.step === "details" },
  { key: "datetime", label: "Picked Date & Time", match: (e) => e.step === "datetime" },
  { key: "booking_confirmed", label: "Booking Confirmed", match: (e) => e.event_type === "booking_confirmed" },
];

/**
 * Counts distinct sessions reaching each funnel stage (not raw event counts —
 * a session can fire the same step event more than once). Stages are assumed
 * to be roughly sequential; conversion percentages are computed stage-to-stage
 * and against the first stage.
 */
export function computeFunnelStats(events: FunnelEventRow[]): FunnelStageResult[] {
  const stageSessions = FUNNEL_STAGES.map((stage) => {
    const sessions = new Set<string>();
    for (const event of events) {
      if (stage.match(event)) sessions.add(event.session_id);
    }
    return { ...stage, sessions };
  });

  const firstStageCount = stageSessions[0]?.sessions.size ?? 0;

  return stageSessions.map((stage, index) => {
    const count = stage.sessions.size;
    const previousCount = index > 0 ? stageSessions[index - 1].sessions.size : null;

    return {
      key: stage.key,
      label: stage.label,
      sessions: count,
      conversionFromPrevious:
        previousCount !== null && previousCount > 0 ? count / previousCount : null,
      conversionFromFirst: firstStageCount > 0 ? count / firstStageCount : null,
    };
  });
}

export interface BiggestDrop {
  fromLabel: string;
  toLabel: string;
  dropRate: number;
}

/** Finds the stage-to-stage transition with the largest percentage drop-off. */
export function findBiggestDrop(stats: FunnelStageResult[]): BiggestDrop | null {
  let biggest: BiggestDrop | null = null;

  for (let i = 1; i < stats.length; i++) {
    const prev = stats[i - 1];
    const curr = stats[i];
    if (prev.sessions === 0) continue;

    const dropRate = 1 - curr.sessions / prev.sessions;
    if (!biggest || dropRate > biggest.dropRate) {
      biggest = { fromLabel: prev.label, toLabel: curr.label, dropRate };
    }
  }

  return biggest;
}
