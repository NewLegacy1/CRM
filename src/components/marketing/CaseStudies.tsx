"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Star, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { CASE_STUDIES } from "@/lib/case-studies-data";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";
import { marketingCtaOutlineLinkClasses } from "@/lib/marketing-cta-classes";

type MetricRow = { icon: React.ReactNode; value: string; label: string };

function metricsWithIcons(slug: string, metrics: { value: string; label: string }[]): MetricRow[] {
  const iconSets: Record<string, LucideIcon[]> = {
    detailops: [TrendingUp, Users, Clock],
    "showroom-autocare": [Star, Users, TrendingUp],
    "jay-that-drain-guy": [Star, Clock, TrendingUp],
  };
  const icons = iconSets[slug] ?? [TrendingUp, Users, Clock];
  return metrics.map((m, i) => {
    const Icon = icons[i] ?? TrendingUp;
    return {
      icon: <Icon size={18} aria-hidden />,
      value: m.value,
      label: m.label,
    };
  });
}

type CaseStudyCardProps = {
  company: string;
  industry: string;
  logoUrl?: string;
  metrics: MetricRow[];
  testimonial: string;
  figcaption?: string;
  delay: number;
};

function CaseStudyCard({
  company,
  industry,
  logoUrl,
  metrics,
  testimonial,
  figcaption,
  delay,
}: CaseStudyCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={marketingWhileInView}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="flex h-full min-h-0 flex-col rounded-[1.5rem] border-galaxy-neon"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-[calc(1.5rem-1px)] card-galaxy-glass p-6 ring-1 ring-white/[0.08] md:p-7">
        {logoUrl ? (
          <div className="mb-4 flex h-10 items-center md:h-11">
            <Image
              src={logoUrl}
              alt={`${company} logo`}
              width={200}
              height={48}
              className="h-8 w-auto max-w-[180px] object-contain object-left md:h-9"
              sizes="180px"
            />
          </div>
        ) : null}
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-400/90">{industry}</p>
        <h3 className="font-heading mt-2 text-lg font-semibold leading-tight text-[#FAFAFA]">{company}</h3>

        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 ring-1 ring-white/[0.05]"
            >
              <dt className="text-[10px] uppercase tracking-wide text-white/45">{m.label}</dt>
              <dd className="mt-0.5 flex items-center justify-center gap-1 text-base font-bold text-[#FAFAFA]">
                <span className="text-violet-400/80">{m.icon}</span>
                {m.value}
              </dd>
            </div>
          ))}
        </dl>

        <blockquote className="mt-5 flex-1 border-l-2 border-violet-500/40 pl-4 text-sm italic leading-relaxed text-white/70">
          &ldquo;{testimonial}&rdquo;
        </blockquote>
        {figcaption ? <p className="mt-2 pl-4 text-[11px] text-white/45">{figcaption}</p> : null}
      </div>
    </motion.article>
  );
}

export default function CaseStudies() {
  const delays = [100, 200, 300];

  return (
    <section id="case-studies" className="relative px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            REAL BUILDS. <span className="gradient-text-highlight">REAL OUTCOMES.</span>
          </h2>
          <p className="mt-3 max-w-xl text-white/60">
            Every project is designed to remove friction, improve clarity, and support growth — not just look good.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CASE_STUDIES.map((study, i) => (
            <CaseStudyCard
              key={study.slug}
              company={study.company}
              industry={study.industry}
              logoUrl={study.logoUrl}
              metrics={metricsWithIcons(study.slug, study.metrics)}
              testimonial={study.testimonial}
              figcaption={
                study.testimonialAttribution ? `— ${study.testimonialAttribution}` : undefined
              }
              delay={delays[i] ?? 100 * (i + 1)}
            />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link href="/case-studies" className={marketingCtaOutlineLinkClasses}>
            Full case studies
            <ArrowUpRight
              size={16}
              className="text-white/50 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-300"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
