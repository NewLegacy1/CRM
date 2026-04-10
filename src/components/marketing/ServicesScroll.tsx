"use client";

import { motion } from "framer-motion";

const blocks = [
  {
    title: "Custom Websites",
    body: "High-performance websites and web apps built for speed, SEO, and conversion — tailored to your offer, not a template.",
    bullets: [
      "Landing pages and full sites",
      "Performance and SEO foundations",
      "Conversion-first structure",
    ],
  },
  {
    title: "Custom CRMs & Automations",
    body: "Pipelines, follow-up, and handoffs wired together so nothing slips — and your team spends time on revenue, not busywork.",
    bullets: [
      "Lead routing & reminders",
      "Integrations that stick",
      "Reporting you can trust",
    ],
  },
  {
    title: "Growth Operations",
    body: "Systems for owners and creators who need to scale without adding chaos — from intake to delivery.",
    bullets: [
      "Process + tooling design",
      "Handoff-ready playbooks",
      "Ongoing optimization",
    ],
  },
];

export default function ServicesScroll() {
  return (
    <section id="services" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-[var(--phoenix-gold)]">
          Systems built for growth
        </p>
        <h2 className="mt-4 text-center text-3xl font-bold text-[var(--pure-white)] sm:text-4xl md:text-5xl">
          SYSTEMS BUILT FOR
          <span className="fire-text"> GROWTH.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[var(--ash-gray)]">
          Scroll to explore the systems we build.
        </p>

        <div className="mt-16 space-y-20">
          {blocks.map((b, i) => (
            <motion.article
              key={b.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="grid gap-10 md:grid-cols-2 md:items-center"
            >
              <div>
                <h3 className="text-2xl font-bold text-[var(--pure-white)] md:text-3xl">
                  {b.title}
                </h3>
                <p className="mt-4 text-[var(--ash-gray)]">{b.body}</p>
              </div>
              <ul className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                {b.bullets.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--phoenix-gold)]" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
