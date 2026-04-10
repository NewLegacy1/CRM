"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CASE_STUDIES } from "@/lib/case-studies-data";

export default function CaseStudies() {
  return (
    <section className="border-t border-white/[0.06] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              REAL BUILDS.{" "}
              <span className="fire-text">REAL OUTCOMES.</span>
            </h2>
            <p className="mt-3 max-w-xl text-[var(--ash-gray)]">
              Every project is designed to remove friction, improve clarity, and
              support growth — not just look good.
            </p>
          </div>
          <Link
            href="/case-studies"
            className="text-sm font-semibold uppercase tracking-wider text-[var(--phoenix-gold)] hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {CASE_STUDIES.map((c, i) => (
            <motion.article
              key={c.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--phoenix-gold)]">
                {c.industry}
              </p>
              <h3 className="mt-2 text-xl font-bold text-[var(--pure-white)]">
                {c.company}
              </h3>
              <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
                {c.metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg bg-white/[0.04] py-3"
                  >
                    <dt className="text-[10px] uppercase tracking-wide text-zinc-500">
                      {m.label}
                    </dt>
                    <dd className="text-lg font-bold text-[var(--pure-white)]">
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <blockquote className="mt-6 flex-1 border-l-2 border-[var(--phoenix-gold)]/50 pl-4 text-sm italic leading-relaxed text-zinc-400">
                &ldquo;{c.quote}&rdquo;
              </blockquote>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
