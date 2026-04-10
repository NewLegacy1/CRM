"use client";

import { motion } from "framer-motion";

const verticals = [
  "Healthcare",
  "Real Estate",
  "Law Firms",
  "Home Services",
  "Financial Services",
  "Consulting",
];

export default function Clients() {
  return (
    <section className="border-y border-white/[0.06] bg-black/20 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
          WE AUTOMATE FOR THE
          <br />
          <span className="fire-text">BUSINESSES THAT MOVE FAST.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--ash-gray)]">
          Whether you run a clinic, a closing team, or a service brand — we
          build systems that move with you.
        </p>
        <motion.ul
          className="mt-14 flex flex-wrap justify-center gap-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.06 },
            },
          }}
        >
          {verticals.map((v) => (
            <motion.li
              key={v}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0 },
              }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-sm font-medium uppercase tracking-wider text-zinc-200"
            >
              {v}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
