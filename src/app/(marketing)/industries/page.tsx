import type { Metadata } from "next";
import Link from "next/link";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";

export const metadata: Metadata = {
  title: "Industries",
};

const rows = [
  {
    title: "Healthcare",
    body: "Scheduling, intake, and follow-up that protect staff time and patient experience.",
  },
  {
    title: "Real Estate",
    body: "Lead response, nurture, and handoffs so deals move without you living in the inbox.",
  },
  {
    title: "Legal & professional",
    body: "Screening, intake, and CRM workflows that scale new matters without scaling admin.",
  },
  {
    title: "Home services",
    body: "Dispatch-friendly flows, reminders, and pipelines built for high-volume leads.",
  },
  {
    title: "Creators & agencies",
    body: "Offers, onboarding, and delivery systems that stay organized as you grow.",
  },
];

export default function IndustriesPage() {
  return (
    <div className="marketing-page-bg min-h-screen px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          <span className="fire-text">Industries</span> we build for
        </h1>
        <p className="mt-4 text-lg text-[var(--ash-gray)]">
          Different verticals — same focus: remove friction, automate the
          repetitive, and keep revenue paths clear.
        </p>
      </div>
      <ul className="mx-auto mt-14 max-w-3xl space-y-4">
        {rows.map((r) => (
          <li
            key={r.title}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
          >
            <h2 className="text-xl font-semibold text-[var(--pure-white)]">
              {r.title}
            </h2>
            <p className="mt-2 text-[var(--ash-gray)]">{r.body}</p>
          </li>
        ))}
      </ul>
      <p className="mx-auto mt-12 max-w-lg text-center text-sm text-zinc-500">
        Don&apos;t see your niche? We still want to hear what you&apos;re
        building — most systems share the same moving parts.
      </p>
      <div className="mx-auto mt-8 flex justify-center">
        <Link
          href={BOOK_CONSULTATION_PATH}
          className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-zinc-950"
        >
          Book a consult
        </Link>
      </div>
    </div>
  );
}
