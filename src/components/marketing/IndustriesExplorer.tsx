"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { INDUSTRIES } from "@/lib/industries-data";
import { getIndustryIndexFromQueryParam, getIndustryIdAtIndex } from "@/lib/industries-query";
import { MarketingCtaDuo } from "@/components/marketing/MarketingCtaDuo";
import { MarketingSubpageBackToHome } from "@/components/marketing/MarketingSubpageBackToHome";

function IndustriesExplorerFallback() {
  return (
    <section className="relative pb-16 md:pb-20" aria-busy="true" aria-label="Loading industries">
      <div className="container mx-auto relative px-4 py-24 text-center text-white/45 text-sm font-heading tracking-wide">
        <div className="mb-8 text-left">
          <MarketingSubpageBackToHome />
        </div>
        Loading industries…
      </div>
    </section>
  );
}

function IndustriesExplorerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const iParam = searchParams.get("i");
  const indexFromUrl = useMemo(() => getIndustryIndexFromQueryParam(iParam), [iParam]);

  const [activeIndex, setActiveIndex] = useState(indexFromUrl);

  useEffect(() => {
    setActiveIndex(indexFromUrl);
  }, [indexFromUrl]);

  const selectIndustry = useCallback(
    (i: number) => {
      const id = getIndustryIdAtIndex(i);
      setActiveIndex(i);
      const params = new URLSearchParams(searchParams.toString());
      params.set("i", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const active = INDUSTRIES[activeIndex];
  const ActiveIcon = active.icon;
  const detailId = "industry-detail-panel";

  return (
    <section className="relative pb-16 md:pb-20" aria-labelledby="industries-heading">
      <div className="container mx-auto relative px-4">
        <MarketingSubpageBackToHome />
        <div className="max-w-2xl mb-14">
          <h1 id="industries-heading" className="text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
            BUILT FOR{" "}
            <span className="gradient-text-highlight">YOUR INDUSTRY.</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-6 leading-relaxed max-w-xl">
            Pick a vertical to see what we build and where AI fits—then talk to us about your operation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-3">
          <div className="lg:col-span-5 space-y-1" role="tablist" aria-label="Industries">
            {INDUSTRIES.map((industry, i) => {
              const Icon = industry.icon;
              const isActive = i === activeIndex;
              const row = (
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors duration-400 ${
                      isActive
                        ? "bg-white/12 ring-1 ring-white/25"
                        : "bg-white/5 ring-1 ring-white/10"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={`transition-colors duration-400 ${
                        isActive ? "text-white" : "text-white/45"
                      }`}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <p
                      className={`font-heading text-[13px] font-semibold transition-colors duration-300 ${
                        isActive ? "text-white" : "text-white/70"
                      }`}
                    >
                      {industry.title}
                    </p>
                    {isActive ? (
                      <p className="text-white text-[11px] mt-0.5 leading-snug">{industry.short}</p>
                    ) : null}
                  </div>
                </div>
              );
              return (
                <button
                  key={industry.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={detailId}
                  id={`industry-tab-${industry.id}`}
                  onClick={() => selectIndustry(i)}
                  className={`w-full text-left rounded-[1.25rem] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] group ${
                    isActive
                      ? "border-galaxy-neon p-0"
                      : "border border-white/[0.08] bg-transparent p-4 hover:border-white/18 hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive ? (
                    <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-4 ring-1 ring-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                      {row}
                    </div>
                  ) : (
                    row
                  )}
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border-galaxy-neon h-full">
              <div className="rounded-[calc(2rem-1px)] card-galaxy-glass p-8 md:p-12 h-full flex flex-col justify-between min-h-[min(420px,70vh)] ring-1 ring-white/[0.08]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    id={detailId}
                    role="tabpanel"
                    aria-labelledby={`industry-tab-${active.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] ring-1 ring-white/12 mb-7">
                      <ActiveIcon size={24} className="text-white/80" aria-hidden />
                    </div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold mb-3 text-white">
                      {active.headline}
                    </h2>
                    <p className="text-white/95 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
                      {active.lead}
                    </p>

                    <div className="grid gap-8 sm:grid-cols-2 max-w-3xl">
                      <div>
                        <h3 className="font-heading text-xs uppercase tracking-[0.16em] text-violet-300/90 mb-3">
                          What we build
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/88 leading-relaxed">
                          {active.builds.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span className="text-violet-400/90 shrink-0 mt-0.5" aria-hidden>
                                ·
                              </span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs uppercase tracking-[0.16em] text-violet-300/90 mb-3">
                          Where AI fits
                        </h3>
                        <ul className="space-y-2.5 text-sm text-white/88 leading-relaxed">
                          {active.aiAngles.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span className="text-cyan-400/90 shrink-0 mt-0.5" aria-hidden>
                                ·
                              </span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </motion.div>
                </AnimatePresence>

                <MarketingCtaDuo
                  className="mt-10 pt-2"
                  leadFormOptions={{
                    prefillMessage: `Interested in solutions for: ${active.title}. `,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IndustriesExplorer() {
  return (
    <Suspense fallback={<IndustriesExplorerFallback />}>
      <IndustriesExplorerContent />
    </Suspense>
  );
}
