"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Monitor } from "lucide-react";
import { MarketingSubpageBackToHome } from "@/components/marketing/MarketingSubpageBackToHome";
import { CASE_STUDIES } from "@/lib/case-studies-data";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";
import Footer from "@/components/marketing/Footer";

const sectionVariants = {
  hidden: { opacity: 1, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] },
  }),
};

function DemoFrame({
  url,
  title,
  variant = "landscape",
}: {
  url: string;
  title: string;
  variant?: "landscape" | "portrait";
}) {
  const origin = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  /** Portrait: fixed phone-width shell so the frame isn’t stretched to the full column (no side gutters). */
  const outerClass =
    variant === "portrait"
      ? "mx-auto w-[min(390px,calc(100vw-2rem))] shrink-0 max-w-full"
      : "w-full";

  /** Height follows width from aspect ratio only — avoids empty bands above/below the iframe. */
  const viewportClass =
    variant === "portrait"
      ? "relative w-full aspect-[9/19] bg-zinc-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      : "relative w-full aspect-[16/10] bg-zinc-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]";

  return (
    <div className={`${outerClass} rounded-[1.25rem] border-galaxy-neon`}>
      <div className="w-full rounded-[calc(1.25rem-1px)] bg-zinc-950 ring-1 ring-white/[0.08] overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900 px-3 py-2.5">
          <Monitor className="h-4 w-4 text-zinc-400 shrink-0" aria-hidden />
          <span className="text-[11px] font-mono text-zinc-200 truncate">{origin}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300 ring-1 ring-zinc-700 hover:bg-zinc-700 hover:text-violet-200"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className={viewportClass}>
          <iframe
            title={`${title} live preview`}
            src={url}
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="border-t border-zinc-800 bg-zinc-900 px-3 py-2.5 text-[10px] text-zinc-400 leading-snug">
          {variant === "portrait"
            ? "Scroll inside the preview, or use Open for the full site."
            : "If the preview is blank, the site may block embedding — use Open to view it directly."}
        </p>
      </div>
    </div>
  );
}

export default function CaseStudiesPage() {
  return (
    <div className="relative z-10 min-h-screen text-foreground pt-16 md:pt-20 pb-12">
      <div className="container mx-auto px-4">
        <MarketingSubpageBackToHome />

        <div className="max-w-3xl mb-14 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-5 leading-[0.95]">
            CASE STUDIES.{" "}
            <span className="gradient-text-highlight">REAL OUTCOMES.</span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl leading-relaxed">
            Each build is scoped to how the business runs today — and where it’s going next. Here’s how we’ve removed
            friction and made growth easier to operate.
          </p>
        </div>

        <div className="space-y-20 md:space-y-28">
          {CASE_STUDIES.map((study, i) => (
            <motion.article
              key={study.slug}
              id={study.slug}
              custom={i}
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={marketingWhileInView}
              className="scroll-mt-24"
            >
              <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-start lg:items-stretch">
                <div className="min-w-0">
                  {study.logoUrl ? (
                    <div className="mb-5 flex items-center">
                      <Image
                        src={study.logoUrl}
                        alt={`${study.company} logo`}
                        width={220}
                        height={64}
                        className="h-10 md:h-12 w-auto max-w-[220px] object-contain object-left"
                        sizes="220px"
                      />
                    </div>
                  ) : null}
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">{study.industry}</p>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#FAFAFA] mb-4">
                    {study.company}
                  </h2>
                  <p className="text-white/90 leading-relaxed mb-6">{study.summary}</p>

                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {study.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-3 text-center ring-1 ring-white/[0.06]"
                      >
                        <div className="font-heading font-bold text-lg text-[#FAFAFA]">{m.value}</div>
                        <div className="text-white/75 text-[10px] uppercase tracking-wide mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  <figure className="mb-8">
                    <blockquote className="text-white/85 text-sm leading-relaxed italic border-l-2 border-violet-400/40 pl-4">
                      &ldquo;{study.testimonial}&rdquo;
                    </blockquote>
                    {study.testimonialAttribution ? (
                      <figcaption className="mt-3 pl-4 text-white/45 text-xs not-italic">
                        — {study.testimonialAttribution}
                      </figcaption>
                    ) : null}
                  </figure>

                  <div className="space-y-4 text-sm text-white/85">
                    <div>
                      <h3 className="font-heading text-xs uppercase tracking-[0.16em] text-violet-300/90 mb-1">
                        Challenge
                      </h3>
                      <p className="leading-relaxed">{study.problem}</p>
                    </div>
                    <div>
                      <h3 className="font-heading text-xs uppercase tracking-[0.16em] text-violet-300/90 mb-1">
                        What we built
                      </h3>
                      <p className="leading-relaxed">{study.solution}</p>
                    </div>
                    {study.stack && study.stack.length > 0 ? (
                      <div>
                        <h3 className="font-heading text-xs uppercase tracking-[0.16em] text-violet-300/90 mb-2">
                          Stack
                        </h3>
                        <ul className="flex flex-wrap gap-2">
                          {study.stack.map((s) => (
                            <li
                              key={s}
                              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/80"
                            >
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0 lg:self-start">
                  {study.demoUrl ? (
                    <DemoFrame
                      url={study.demoUrl}
                      title={study.company}
                      variant={study.demoFrameVariant ?? "landscape"}
                    />
                  ) : (
                    <div className="rounded-[1.25rem] border-galaxy-neon">
                      <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-8 md:p-10 ring-1 ring-white/[0.08] min-h-[200px] flex flex-col items-center justify-center text-center">
                        <Monitor className="h-10 w-10 text-white/25 mb-4" aria-hidden />
                        <p className="text-white/70 text-sm max-w-xs">
                          Live site preview can be added when you&apos;re ready to share a public URL for this project.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <Footer basePath="/" />
      </div>
    </div>
  );
}
