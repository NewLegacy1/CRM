export type CaseStudyMetric = { value: string; label: string };

export type CaseStudyDetail = {
  slug: string;
  company: string;
  industry: string;
  metrics: CaseStudyMetric[];
  testimonial: string;
  /** Shown below the quote when sourced from a named review */
  testimonialAttribution?: string;
  summary: string;
  problem: string;
  solution: string;
  stack?: string[];
  /** Shown in an iframe “device frame”; many sites block embedding — link always shown */
  demoUrl?: string;
  /** Brand mark from the client site (absolute URL) */
  logoUrl?: string;
  /**
   * Preview chrome shape: `landscape` = wide short window (good for marketing landers);
   * `portrait` = narrow tall window (better for dense / mobile-first sites that overlap at tablet widths).
   */
  demoFrameVariant?: "landscape" | "portrait";
};

export const CASE_STUDIES: CaseStudyDetail[] = [
  {
    slug: "detailops",
    company: "DetailOps",
    industry: "SaaS · CRM for auto detailers",
    metrics: [
      { value: "$2M+", label: "Booked via platform" },
      { value: "500+", label: "Detailers" },
      { value: "10 min", label: "Typical go-live" },
    ],
    testimonial:
      "New Legacy helped us turn a messy idea into something detailers actually use every day — booking, deposits, reminders, the whole loop. They built with us, not around us, and the product has scaled way past what I pictured when we started.",
    testimonialAttribution: "Will · DetailOps",
    summary:
      "The CRM built for detailers: professional booking pages, Stripe deposits, automated SMS/email reminders, client history, invoicing, and drip campaigns — so owners stop chasing texts and scale with a full calendar.",
    problem:
      "Detailers were losing revenue to booking chaos over DMs and calls, costly no-shows without deposits, and no systematic follow-up with past clients.",
    solution:
      "We shipped DetailOps end-to-end: branded booking links, deposits through Stripe, reminder automations, review requests, abandoned-booking recovery, and a dashboard built around how detailing shops actually work.",
    stack: ["Next.js", "Stripe", "SMS & email automation", "Multi-tenant CRM"],
    demoUrl: "https://detailops.ca",
    logoUrl: "https://detailops.ca/detailopslogo.png",
    demoFrameVariant: "portrait",
  },
  {
    slug: "showroom-autocare",
    company: "ShowRoom AutoCare",
    industry: "Mobile detailing · Hamilton & GTA",
    metrics: [
      { value: "135+", label: "Five-star Google reviews" },
      { value: "500+", label: "Vehicles detailed" },
      { value: "430+", label: "Trusted clients" },
    ],
    testimonial:
      "We needed a site that matched how we work in the field — clear packages, strong local presence, and a booking path that doesn’t waste our time on the phone. New Legacy delivered: it looks premium, ranks where we need it to, and feeds straight into DetailOps so the crew stays moving.",
    testimonialAttribution: "Nathan · ShowRoom AutoCare",
    summary:
      "A conversion-focused marketing site for Hamilton’s premium mobile detailer — built for local SEO across Hamilton, Ancaster, Burlington, and the GTA, with online quotes and AI-powered booking through a DetailOps intake page.",
    problem:
      "They needed more than a brochure: strong local search visibility, clear service and pricing story, and a booking path that didn’t rely on phone tag.",
    solution:
      "We built a fast, structured site with service pages, social proof, FAQ, and clear CTAs — wired to a branded DetailOps booking flow so leads self-serve time slots and deposits while the team stays in the field.",
    stack: ["Marketing site", "Local SEO", "DetailOps booking", "Lead intake"],
    demoUrl: "https://showroomautocare.ca",
    logoUrl: "https://showroomautocare.ca/logo.png",
    demoFrameVariant: "portrait",
  },
  {
    slug: "jay-that-drain-guy",
    company: "Jay That Drain Guy",
    industry: "Drain clearing & emergency service · Hamilton & GTA",
    metrics: [
      { value: "96+", label: "Five-star reviews" },
      { value: "19 yrs", label: "In the trade" },
      { value: "24/7", label: "Emergency calls" },
    ],
    testimonial:
      "When someone’s drain is backing up at midnight, your site has one job — make them trust you enough to call. New Legacy built exactly that: fast, mobile-first, emergency-first, and tuned for every city we cover. I’m proud to send people to it.",
    testimonialAttribution: "Jay · Jay That Drain Guy",
    summary:
      "A high-trust marketing site for a seasoned drain specialist — built for panicked homeowners searching on mobile, with clear emergency CTAs, review social proof, and strong local coverage across Hamilton, Burlington, and the GTA.",
    problem:
      "The business needed a modern site that matched the quality of the work: instant credibility, obvious phone path for emergencies, and local SEO so “drain” searches in their service towns actually found them.",
    solution:
      "We shipped a fast, mobile-first experience with review highlights, service areas, and 24/7 messaging — structured for conversions (click-to-call, clear guarantees) and tuned for the cities they serve.",
    stack: ["Marketing site", "Local SEO", "Mobile-first", "Analytics & GTM"],
    demoUrl: "https://jaythatdrainguy.ca",
    logoUrl: "https://www.jaythatdrainguy.ca/favicon.png",
    demoFrameVariant: "portrait",
  },
];

export function getCaseStudyBySlug(slug: string): CaseStudyDetail | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
