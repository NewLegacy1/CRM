"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";
import {
  marketingCtaPrimaryLinkClasses,
  marketingCtaSecondaryButtonClasses,
} from "@/lib/marketing-cta-classes";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center pt-20"
    >
      <div className="absolute right-0 top-1/4 -z-10 h-1/2 w-1/2 rounded-full bg-[var(--phoenix-gold)]/5 blur-[100px]" />

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center md:flex-row">
          <div className="w-full space-y-8 md:w-2/3">
            <motion.h1
              className="text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              THE LEGACY YOU BUILD <br />
              SHOULDN&apos;T <span className="fire-text">BURN YOU OUT.</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-xl font-light text-[var(--ash-gray)] sm:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Custom websites, CRMs + automations, and growth operations —
              built to keep your business scalable and easy to run.
            </motion.p>

            <motion.div
              className="flex flex-col gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href={BOOK_CONSULTATION_PATH}
                className={`${marketingCtaPrimaryLinkClasses} group relative`}
              >
                <span className="neon-cta-line-top" aria-hidden />
                <span className="neon-cta-line-bottom" aria-hidden />
                <span className="relative z-[1] inline-flex items-center gap-3">
                  BOOK A CONSULTATION
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-black/10">
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                </span>
              </Link>
              <a
                href="#services"
                className={`${marketingCtaSecondaryButtonClasses} flex items-center justify-center gap-2`}
              >
                <Play size={18} aria-hidden />
                SEE OUR SERVICES
              </a>
            </motion.div>
          </div>

          <motion.div
            className="mt-16 w-full md:mt-0 md:w-1/3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-[var(--phoenix-gold)] to-[var(--sunset-orange)] opacity-20 blur-xl" />
              <div className="relative rounded-xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-sm">
                <div className="space-y-6">
                  {[
                    "Custom Websites",
                    "Custom CRMs & Automations",
                    "Growth Operations for Creators",
                    "Custom App Solutions",
                  ].map((label, i) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--phoenix-gold)] text-sm font-bold text-zinc-950">
                        {i + 1}
                      </div>
                      <div className="text-[var(--pure-white)]">{label}</div>
                      <div className="ml-auto h-4 w-4 rounded-full bg-[var(--sunset-orange)]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
