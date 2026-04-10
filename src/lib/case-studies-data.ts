export type CaseStudy = {
  slug: string;
  company: string;
  industry: string;
  metrics: { label: string; value: string }[];
  quote: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "elite-realty",
    company: "Elite Realty Group",
    industry: "Real Estate",
    metrics: [
      { label: "Saved Weekly", value: "20hrs" },
      { label: "Lead Response", value: "3x" },
      { label: "More Bookings", value: "45%" },
    ],
    quote:
      "The intake flow handles our initial client conversations so naturally, most people assume it's a live agent.",
  },
  {
    slug: "wellness-central",
    company: "Wellness Central",
    industry: "Healthcare",
    metrics: [
      { label: "Saved Weekly", value: "15hrs" },
      { label: "Response Rate", value: "98%" },
      { label: "Less No-Shows", value: "60%" },
    ],
    quote:
      "Scheduling and follow-ups are streamlined now. Our staff can focus on what matters most — patient care.",
  },
  {
    slug: "apex-law",
    company: "Apex Law Partners",
    industry: "Legal Services",
    metrics: [
      { label: "Saved Weekly", value: "25hrs" },
      { label: "Client Intake", value: "4x" },
      { label: "Faster Response", value: "70%" },
    ],
    quote:
      "Our intake and screening workflow runs smoothly. We're able to take on more clients without increasing our administrative burden.",
  },
];
