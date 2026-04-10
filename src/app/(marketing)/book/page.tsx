import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { CalendlyInlineEmbed } from "@/components/marketing/CalendlyInlineEmbed";
import Footer from "@/components/marketing/Footer";
import { CALENDLY_CONSULTATION_URL } from "@/lib/links";

export default function BookConsultationPage() {
  return (
    <div className="relative z-10 min-h-screen text-foreground pb-16 pt-16 md:pb-24 md:pt-20">
      <div className="container mx-auto max-w-4xl px-4">
        <p className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-sm tracking-wide text-white/60 transition-colors hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Back to home
          </Link>
        </p>

        <header className="mb-8 text-center md:mb-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
            <CalendarClock className="h-6 w-6 text-violet-300/90" aria-hidden />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl md:text-[2.25rem] md:leading-tight">
            Schedule a consultation
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/65 md:text-base">
            Choose a time that works for you. You&apos;ll stay on this page — no redirect. Calls are
            typically 20–30 minutes; we&apos;ll confirm your time zone automatically.
          </p>
        </header>

        {/*
          Avoid card-galaxy-glass / backdrop-filter directly around the iframe — it often paints a gray layer
          on top of embedded Calendly in WebKit/Chromium. Use an opaque frame + neon border only.
        */}
        <div className="rounded-[1.5rem] border-galaxy-neon shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="rounded-[calc(1.5rem-1px)] bg-[#09090b] p-2 sm:p-3 md:p-4 ring-1 ring-white/[0.08]">
            <div className="w-full overflow-visible rounded-xl bg-[#09090b]">
              <CalendlyInlineEmbed url={CALENDLY_CONSULTATION_URL} className="w-full" />
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          Prefer to open Calendly in a new tab?{" "}
          <a
            href={CALENDLY_CONSULTATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300/90 underline-offset-2 hover:text-violet-200 hover:underline"
          >
            Open scheduler
          </a>
        </p>
      </div>

      <div className="mt-20 md:mt-28">
        <Footer basePath="/" />
      </div>
    </div>
  );
}
