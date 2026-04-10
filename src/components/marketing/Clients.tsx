"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";
import { HOME_CLIENTS_INDUSTRY_ITEMS } from "@/lib/home-clients-industries";
import { INDUSTRY_QUERY_PARAM } from "@/lib/industries-query";
import { marketingCtaOutlineLinkClasses } from "@/lib/marketing-cta-classes";

const MotionLink = motion(Link);

const pillVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] },
  }),
};

const pillClassName =
  "inline-flex items-center gap-3 rounded-[1.25rem] px-6 py-3 border border-white/[0.1] bg-white/[0.05] transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/20 hover:bg-white/[0.08]";

export default function Clients() {
  return (
    <section id="clients" className="relative py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="rounded-[2rem] border-galaxy-neon">
          <div className="rounded-[calc(2rem-1px)] card-galaxy-glass px-8 py-12 md:px-14 md:py-16 ring-1 ring-white/[0.08]">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl">
                BUILT FOR <span className="gradient-text-highlight">BUSINESSES</span> THAT MOVE FAST
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {HOME_CLIENTS_INDUSTRY_ITEMS.map((ind, i) => {
                const Icon = ind.icon;
                const href = `/industries?${INDUSTRY_QUERY_PARAM}=${encodeURIComponent(ind.industryId)}`;
                return (
                  <MotionLink
                    key={ind.name}
                    href={href}
                    custom={i}
                    variants={pillVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={marketingWhileInView}
                    className={`${pillClassName} font-heading text-sm tracking-wider text-[#FAFAFA]`}
                    aria-label={`${ind.name} — view on industries page`}
                  >
                    <Icon size={18} className="text-white/65 shrink-0" aria-hidden />
                    <span>{ind.name}</span>
                  </MotionLink>
                );
              })}
            </div>

            <div className="mt-10 flex justify-center">
              <Link href="/industries" className={marketingCtaOutlineLinkClasses}>
                See all industries
                <ArrowUpRight
                  size={16}
                  className="text-white/50 group-hover:text-violet-300 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
