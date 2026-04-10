"use client";

import { motion } from "framer-motion";

const points = [
  {
    title: "Strategy-first builds",
    body: "We design around your goals, not a template library.",
  },
  {
    title: "Clean, scalable architecture",
    body: "Systems that are reliable today and easy to extend tomorrow.",
  },
  {
    title: "Clear communication and timelines",
    body: "Transparent process, tight feedback loops, and predictable delivery.",
  },
  {
    title: "Systems designed to evolve",
    body: "Built to adapt as your business grows and priorities shift.",
  },
  {
    title: "Ongoing optimization & support",
    body: "Long-term support to keep performance, uptime, and data clean.",
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          WHY <span className="fire-text">NEWLEGACY.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--ash-gray)]">
          We don&apos;t sell software or templates. We design systems around how
          your business actually operates — and where it&apos;s going next.
        </p>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--pure-white)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ash-gray)]">
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
