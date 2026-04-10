import type { Metadata } from "next";
import Link from "next/link";
import { CASE_STUDIES } from "@/lib/case-studies-data";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";
import { marketingCtaPrimaryLinkClasses } from "@/lib/marketing-cta-classes";

export const metadata: Metadata = {
  title: "Case studies",
};

export default function CaseStudiesPage() {
  return (
    <div className="marketing-page-bg min-h-screen px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">
          Case <span className="fire-text">studies</span>
        </h1>
        <p className="mt-4 text-lg text-[var(--ash-gray)]">
          Outcomes from real builds — systems that save time, tighten follow-up,
          and support growth.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-5xl space-y-12">
        {CASE_STUDIES.map((c) => (
          <article
            key={c.slug}
            className="rounded-2xl border border-white/10 bg-zinc-900/40 p-8 backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--phoenix-gold)]">
              {c.industry}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--pure-white)]">
              {c.company}
            </h2>
            <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
              {c.metrics.map((m) => (
                <div key={m.label} className="rounded-lg bg-white/[0.04] py-3 text-center">
                  <dt className="text-[10px] uppercase text-zinc-500">
                    {m.label}
                  </dt>
                  <dd className="text-xl font-bold text-[var(--pure-white)]">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
            <blockquote className="mt-6 border-l-2 border-[var(--phoenix-gold)]/50 pl-4 text-zinc-400 italic">
              &ldquo;{c.quote}&rdquo;
            </blockquote>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-md text-center">
        <Link href={BOOK_CONSULTATION_PATH} className={marketingCtaPrimaryLinkClasses}>
          Discuss your project
        </Link>
      </div>
    </div>
  );
}
