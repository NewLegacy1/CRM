"use client";

import { motion } from "framer-motion";
import {
  Globe,
  Zap,
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Workflow,
  ArrowUpRight,
} from "lucide-react";
import { marketingWhileInView } from "@/lib/marketing-motion-viewport";
import { useLeadCapture } from "@/components/marketing/LeadCaptureProvider";
import { MarketingCtaDuo } from "@/components/marketing/MarketingCtaDuo";
import type { LucideIcon } from "lucide-react";

type ServiceCard = {
  title: string;
  body: string;
  icon: LucideIcon;
  span: string;
  /** Pre-selects this option in the lead form */
  leadService: string;
};

const SERVICES: ServiceCard[] = [
  {
    title: "Smart websites",
    body: "A site that welcomes visitors, answers common questions, and captures leads — so your first impression works around the clock.",
    icon: Globe,
    span: "md:col-span-2",
    leadService: "AI-Powered Website",
  },
  {
    title: "Lead follow-up",
    body: "When someone reaches out, they hear back fast — with clear next steps — without you glued to the inbox.",
    icon: Zap,
    span: "",
    leadService: "AI Lead Automation",
  },
  {
    title: "Client work in one place",
    body: "Pipeline, conversations, and tasks live together — so everyone sees the same picture and nothing slips through the cracks.",
    icon: LayoutDashboard,
    span: "",
    leadService: "Custom CRM & Apps",
  },
  {
    title: "AI assistants for customers",
    body: "Chat or voice support that handles the repeat questions so your team focuses on the conversations that matter.",
    icon: MessageSquare,
    span: "md:col-span-2",
    leadService: "AI Customer Agents",
  },
  {
    title: "Actionable insights",
    body: "Turn what’s happening in the business into clear next steps — what’s working, what’s stuck, and what to do about it.",
    icon: BarChart3,
    span: "",
    leadService: "Data & Insights",
  },
  {
    title: "Operations on autopilot",
    body: "We find the repetitive steps in your day and replace them with reliable workflows your team can actually trust.",
    icon: Workflow,
    span: "",
    leadService: "Business Automation",
  },
];

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
            TOOLS THAT{" "}
            <span className="gradient-text-highlight">TAKE YOU BEYOND.</span>
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed">
            Practical AI and automation so you win back time, stay in front of leads, and run the business — not the inbox.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:items-stretch">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div
                key={svc.title}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={marketingWhileInView}
                className={`group relative flex h-full min-h-0 flex-col rounded-[1.5rem] border-galaxy-neon ${svc.span}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    openLeadForm({ preselectServices: [svc.leadService] })
                  }
                  className="flex h-full min-h-0 w-full flex-1 flex-col text-left rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/80"
                >
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
                      {svc.title}
                    </h3>
                    <p className="flex-1 text-white/90 text-sm leading-relaxed">{svc.body}</p>
                    <span className="sr-only">Opens contact form with this service selected</span>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        <MarketingCtaDuo className="mt-16" />
      </div>
    </section>
  );
}
