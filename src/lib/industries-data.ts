import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Car,
  Cpu,
  HardHat,
  Stethoscope,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";

export type IndustryDetail = {
  id: string;
  title: string;
  short: string;
  icon: LucideIcon;
  headline: string;
  lead: string;
  builds: string[];
  aiAngles: string[];
};

export const INDUSTRIES: IndustryDetail[] = [
  {
    id: "restaurants",
    title: "Restaurants & hospitality",
    short: "Reservations, orders, repeat guests.",
    icon: UtensilsCrossed,
    headline: "Restaurants · From first click to repeat diner",
    lead:
      "Guests decide on your website and your follow-up long before they walk in. We build the digital layer that keeps tables full without burning out your team.",
    builds: [
      "Fast, appetizing sites with menus, hours, and clear CTAs",
      "Reservations and online ordering flows wired to how you operate",
      "Automated follow-up, events, and loyalty-style touches",
      "Simple dashboards so owners see bookings and demand at a glance",
    ],
    aiAngles: [
      "AI answers common questions (hours, dietary, parking) 24/7",
      "Smart prompts for reviews and return visits after a great meal",
      "Triage inbound messages so staff only handles what needs a human",
    ],
  },
  {
    id: "dental-medical",
    title: "Dental & medical",
    short: "Scheduling, intake, fewer no-shows.",
    icon: Stethoscope,
    headline: "Dental & medical · Calmer front desks, fuller chairs",
    lead:
      "Practices win when scheduling and intake are effortless for patients and staff. We align your site, reminders, and workflows so the team spends time on care—not phone tag.",
    builds: [
      "Patient-friendly sites with trust, services, and clear booking paths",
      "Intake and scheduling flows that reduce errors and no-shows",
      "Reminder and recall automation tuned to your practice rhythm",
      "Handoffs to your CRM or PMS where it makes sense",
    ],
    aiAngles: [
      "After-hours assistants for FAQs, directions, and insurance basics",
      "Drafted responses staff can approve before sending",
      "Summaries of form submissions so triage takes seconds",
    ],
  },
  {
    id: "contractors",
    title: "Contractors & trades",
    short: "Job-ready sites and lead follow-up.",
    icon: HardHat,
    headline: "Contractors & trades · More booked jobs, less chasing",
    lead:
      "Homeowners compare fast. You need credibility, service areas, and a lead path that doesn’t die in voicemail. We build sites and systems that turn searches into booked work.",
    builds: [
      "Portfolio and proof-heavy pages for each trade you run",
      "Quote requests and job intake that capture the right details",
      "SMS/email follow-up so hot leads don’t go cold",
      "Optional CRM views for pipeline and crew scheduling hooks",
    ],
    aiAngles: [
      "Instant replies after hours with next steps and emergency routing",
      "Qualify job types before you dispatch a callback",
      "Voice or chat helpers trained on your services and service area",
    ],
  },
  {
    id: "home-services",
    title: "Home services & emergencies",
    short: "Trust on mobile, 24/7-ready.",
    icon: Wrench,
    headline: "Home services · When the clock matters",
    lead:
      "Drain, HVAC, plumbing—customers are stressed and on their phone. Your site has to say “we’re the right call” in seconds and make reaching you frictionless.",
    builds: [
      "Mobile-first pages built for panic searches and local SEO",
      "Click-to-call, SMS, and clear emergency vs. standard service paths",
      "Review and guarantee blocks that earn trust before the dial",
      "Tracking so you know which neighborhoods and ads actually ring",
    ],
    aiAngles: [
      "AI triage: emergency vs. routine, with scripts your techs stand behind",
      "After-hours coverage that books or captures the lead for morning",
      "FAQ handling so your office isn’t repeating the same answers",
    ],
  },
  {
    id: "automotive",
    title: "Automotive & detailing",
    short: "Bookings, deposits, fleet-ready flows.",
    icon: Car,
    headline: "Automotive · Show the work, fill the calendar",
    lead:
      "Whether you run a shop or mobile detailing, buyers want photos, packages, and an easy yes. We connect marketing sites to booking, deposits, and follow-through.",
    builds: [
      "Showcase sites with packages, add-ons, and social proof",
      "Booking and deposit flows (including DetailOps-style setups)",
      "Reminder and rebook campaigns for seasonal and repeat work",
      "Lead capture from ads and Google Business in one place",
    ],
    aiAngles: [
      "Chat that answers pricing and availability questions on your rules",
      "Automated nurture for quotes that haven’t converted yet",
      "Summaries of customer history before you return a call",
    ],
  },
  {
    id: "professional",
    title: "Professional services",
    short: "Credibility, intake, pipeline.",
    icon: Briefcase,
    headline: "Professional services · Right clients, less admin",
    lead:
      "Law, consulting, finance—your brand is trust. We build intake and follow-up so you screen fit faster and spend time on billable work, not inbox archaeology.",
    builds: [
      "Authority-led websites with clear practice areas and proof",
      "Guided intake forms and scheduling that respect compliance needs",
      "CRM-ready records and tasking for your team",
      "Reporting on lead source and conversion without spreadsheet hell",
    ],
    aiAngles: [
      "First-pass intake summarization for faster partner review",
      "Smart routing: which matter belongs with which attorney or pod",
      "Client-safe drafts for routine follow-ups and confirmations",
    ],
  },
  {
    id: "saas",
    title: "SaaS & product",
    short: "Product UX, onboarding, scale.",
    icon: Cpu,
    headline: "SaaS & product · Systems that grow with the roadmap",
    lead:
      "When the product is the business, marketing and app blur together. We ship cohesive experiences—from landing to onboarding—so activation isn’t an afterthought.",
    builds: [
      "Marketing sites that match the product story and pricing motion",
      "Onboarding flows, in-app messaging hooks, and lifecycle email",
      "Admin tools, internal dashboards, and integrations your team actually uses",
      "Instrumentation so you see where users stall",
    ],
    aiAngles: [
      "In-product assistants for setup, troubleshooting, and expansion",
      "Support deflection with grounded answers from your docs",
      "Lead scoring and product-qualified lead signals into your stack",
    ],
  },
];
