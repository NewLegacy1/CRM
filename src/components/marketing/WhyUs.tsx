"use client";

import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Compass,
  Layers,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MarketingCtaDuo } from "@/components/marketing/MarketingCtaDuo";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";

const points: {
  title: string;
  body: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Strategy-first builds",
    body: "We design around your goals, not a template library.",
    icon: Compass,
  },
  {
    title: "Clean, scalable architecture",
    body: "Systems that are reliable today and easy to extend tomorrow.",
    icon: Layers,
  },
  {
    title: "Clear communication and timelines",
    body: "Transparent process, tight feedback loops, and predictable delivery.",
    icon: MessageSquare,
  },
  {
    title: "Systems designed to evolve",
    body: "Built to adapt as your business grows and priorities shift.",
    icon: RefreshCw,
  },
  {
    title: "Ongoing optimization & support",
    body: "Long-term support to keep performance, uptime, and data clean.",
    icon: Bot,
  },
];

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const listId = useId();

  const select = useCallback((i: number) => {
    setActive(i);
  }, []);

  const current = points[active]!;
  const CurrentIcon = current.icon;

  return (
    <section id="why-us" className="scroll-mt-24 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 lg:gap-y-8">
          {/* Mobile: title first. Desktop: left column row 1 */}
          <div className="order-1 lg:col-span-4 lg:row-start-1 lg:pt-1">
            <h2 className="text-left text-3xl font-bold text-foreground sm:text-4xl">
              EXPLORE THE{" "}
              <span className="gradient-text-highlight">FRONTIER.</span>
            </h2>
            <p className="mt-4 max-w-md text-left text-white/60 leading-relaxed">
              We don&apos;t sell software or templates. We design systems around how your business actually operates —
              and where it&apos;s going next.
            </p>
          </div>

          {/* Mobile: tabs + detail after title. Desktop: right column spans two rows */}
          <div className="order-2 flex flex-col gap-6 lg:col-span-8 lg:row-span-2 lg:row-start-1">
            <div
              className="rounded-[1.25rem] border-galaxy-neon"
              role="tablist"
              aria-label="Why New Legacy"
              aria-orientation="horizontal"
            >
              <div className="flex flex-wrap gap-1 rounded-[calc(1.25rem-1px)] bg-zinc-950/80 p-1.5 sm:flex-nowrap sm:gap-0">
                {points.map((p, i) => {
                  const Icon = p.icon;
                  const isOn = i === active;
                  return (
                    <button
                      key={p.title}
                      type="button"
                      role="tab"
                      id={`${listId}-tab-${i}`}
                      aria-selected={isOn}
                      aria-controls={`${listId}-panel`}
                      tabIndex={isOn ? 0 : -1}
                      onClick={() => select(i)}
                      className={`flex min-h-[3.25rem] flex-1 items-center justify-center rounded-xl px-2 py-2 transition-colors duration-200 sm:min-h-[3.5rem] sm:px-1 ${
                        isOn
                          ? "bg-white/[0.12] text-white ring-1 ring-violet-400/35"
                          : "text-white/45 hover:bg-white/[0.06] hover:text-white/80"
                      }`}
                      title={p.title}
                    >
                      <Icon className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
                      <span className="sr-only">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              id={`${listId}-panel`}
              role="tabpanel"
              aria-labelledby={`${listId}-tab-${active}`}
              className="min-h-[200px]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="rounded-[1.25rem] border-galaxy-neon"
                >
                  <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-6 ring-1 ring-white/[0.08] sm:p-8 md:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-white/12 md:h-16 md:w-16">
                        <CurrentIcon className="h-7 w-7 text-violet-300/90 md:h-8 md:w-8" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-xl font-semibold text-[#FAFAFA] md:text-2xl">
                          {current.title}
                        </h3>
                        <p className="mt-3 text-base leading-relaxed text-white/75 md:text-lg">{current.body}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile: CTAs last. Desktop: left column row 2 under title */}
          <motion.div
            className="order-3 w-full max-w-md lg:col-span-4 lg:row-start-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={marketingWhileInView}
            transition={{ duration: 0.5 }}
          >
            <MarketingCtaDuo equalWidthRow />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
