export const BOOKED_JOBS_HOOKS: Record<string, string> = {
  "trade-three":
    "The homeowner calls three names. If you’re last, they never call back.",
  "trade-audit":
    "Stop losing jobs on Google Maps. We’ll show you exactly where in a free audit.",
  "trade-14days":
    "You’re 2+ years in, good at the work, bad at Google. That’s a 14-day problem, not a personality.",
  "trade-searched":
    "They searched. They called someone else. Your Google listing is why.",
  "trade-voicemail":
    "You’re losing money every week to whoever answers first.",
  "trade-money":
    "You’re losing money every week to whoever answers first.",
  "plumber-wom":
    "If you’re a plumber in Ontario and most jobs still come from word-of-mouth — this is for you.",
  "plumber-maps":
    "The plumber who shows up first on Google Maps isn’t better than you. He just shows up first.",
  "hvac-search":
    "People search “furnace repair near me.” If you’re not on that list, you don’t get the job.",
  "hvac-season":
    "Busy season is coming. If your Google listing is thin, you’ll stay slow.",
  "hvac-missed":
    "You missed a call on a job. That homeowner already booked someone else.",
  "elec-invisible":
    "Licensed, insured, years in — and they still can’t find you on Google.",
  "elec-first":
    "They don’t pick the best electrician. They pick the first one who looks open and answers.",
  "roof-storm": "After a storm they open Google, not your truck.",
  "roof-maps": "If they can’t find you on Maps, they found your competitor.",
  "plumber-burst":
    "A burst pipe doesn’t wait. If they can’t find you in 10 seconds, they call the next name.",
  "hvac-listing":
    "Your work is fine. Your Google listing is why they called someone else.",
  "elec-panel":
    "They needed a panel upgrade. They called whoever showed up first on Maps.",
  "trade-next":
    "Word-of-mouth got you here. Google is where the next jobs are.",
  "trade-threeleaks":
    "Free Google audit. We’ll show you the three places you’re losing jobs.",
  "trade-empty":
    "If your Google profile looks empty, they skip you. Even if the work is better.",
};

export const DEFAULT_BOOKED_JOBS_HEADLINE =
  "You’re losing money every week to whoever answers first.";

export const BOOKED_JOBS_TRADES = [
  "HVAC",
  "Plumber",
  "Electrician",
  "Roofer",
  "Other trade",
] as const;

export function headlineFromSlug(slug: string | undefined): string {
  if (!slug) return DEFAULT_BOOKED_JOBS_HEADLINE;
  return BOOKED_JOBS_HOOKS[slug] ?? DEFAULT_BOOKED_JOBS_HEADLINE;
}

export function tradeFromSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  if (slug.startsWith("plumber")) return "Plumber";
  if (slug.startsWith("hvac")) return "HVAC";
  if (slug.startsWith("elec")) return "Electrician";
  if (slug.startsWith("roof")) return "Roofer";
  return undefined;
}
