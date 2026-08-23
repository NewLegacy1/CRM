"use client";

import { motion } from "framer-motion";
import { Globe, LayoutDashboard, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";
import { useLeadCapture } from "@/components/marketing/LeadCaptureProvider";
import { MarketingCtaDuo } from "@/components/marketing/MarketingCtaDuo";
import type { LucideIcon } from "lucide-react";

type PathCard = {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
  leadService?: string;
  href?: string;
};

const PATHS: PathCard[] = [
  {
    id: "local",
    title: "Local Growth",
    body: "Get found on Google, look trusted, and capture every lead. Websites, Google Business Profile, missed-call text-back — live in 14 days. You close the job.",
    icon: Globe,
    leadService: "AI-Powered Website",
  },
  {
    id: "custom",
    title: "Custom Software",
    body: "CRMs, booking systems, client portals, and AI workflows for firms that outgrew spreadsheets. $5k–$50k builds, phased delivery.",
    icon: LayoutDashboard,
    href: "/crm-intake",
  },
];

const MORE_CAPABILITIES = [
  "Lead follow-up",
  "AI assistants",
  "Dashboards",
  "Workflow automation",
] as const;

const cardVariants = {
  hidden: { opacity: 1, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.32, 0.72, 0, 1] },
  }),
};

const headerVariants = {
  hidden: { opacity: 1, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.32, 0.72, 0, 1] as const },
  },
};

export default function ServicesScroll() {
  const { openLeadForm } = useLeadCapture();

  return (
    <section
      id="services"
      className="relative max-md:mt-0 max-md:pt-4 md:-mt-[6vh] pt-6 pb-28 md:pt-8 md:pb-36 scroll-mt-4"
    >
      <div className="container mx-auto relative px-4">
        <motion.div
          className="max-w-2xl mb-12 md:mb-14"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={marketingWhileInView}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-[0.95]">
            TWO WAYS{" "}
            <span className="gradient-text-highlight">WE WORK.</span>
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed">
            Pick the path that fits. Same team, same standard: systems that produce revenue, not tech talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:items-stretch">
          {PATHS.map((path, i) => {
            const Icon = path.icon;
            const inner = (
              <div className="relative flex min-h-0 flex-1 flex-col rounded-[calc(1.5rem-1px)] card-galaxy-glass p-7 md:p-8 h-full min-h-full ring-1 ring-white/[0.08] transition-colors duration-300 group-hover:ring-white/15">
                <div className="flex items-start justify-between mb-6">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                    <Icon size={20} className="text-white/75" />
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-500 shrink-0"
                    aria-hidden
                  />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-3 text-[#FAFAFA]">
                  {path.title}
                </h3>
                <p className="flex-1 text-white/90 text-sm leading-relaxed">{path.body}</p>
              </div>
            );

            return (
              <motion.div
                key={path.id}
                id={path.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={marketingWhileInView}
                className="group relative flex h-full min-h-0 flex-col rounded-[1.5rem] border-galaxy-neon scroll-mt-24"
              >
                {path.href ? (
                  <Link
                    href={path.href}
                    className="flex h-full min-h-0 w-full flex-1 flex-col text-left rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/80"
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openLeadForm({
                        preselectServices: path.leadService
                          ? [path.leadService]
                          : undefined,
                      })
                    }
                    className="flex h-full min-h-0 w-full flex-1 flex-col text-left rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/80"
                  >
                    {inner}
                    <span className="sr-only">Opens contact form</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-white/50">
          More capabilities:{" "}
          {MORE_CAPABILITIES.map((label, i) => (
            <span key={label}>
              <button
                type="button"
                onClick={() => openLeadForm()}
                className="text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                {label}
              </button>
              {i < MORE_CAPABILITIES.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>

        <MarketingCtaDuo className="mt-16" />
      </div>
    </section>
  );
}
