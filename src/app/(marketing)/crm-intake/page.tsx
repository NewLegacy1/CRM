"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/marketing/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { CrmIntakeWizard } from "@/components/marketing/intake/CrmIntakeWizard";

export default function CrmIntakePage() {
  const [status, setStatus] = useState<"form" | "ok">("form");

  return (
    <div className="relative z-10 min-h-screen text-foreground pb-16 pt-16 md:pb-24 md:pt-20">
      <div className="container mx-auto max-w-3xl px-4">
        <p className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-sm tracking-wide text-white/60 transition-colors hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Back to home
          </Link>
        </p>

        <header className="mb-10">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
            CRM &amp; <span className="gradient-text-highlight">automations</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
            Tell us how you operate today and what &quot;done right&quot; looks like. Multi-step — save time by skipping
            optional fields. We&apos;ll reply with a clear next step.
          </p>
        </header>

        {status === "ok" ? (
          <div className="rounded-[1.25rem] border-galaxy-neon">
            <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-8 ring-1 ring-white/[0.08]">
              <p className="font-heading text-lg text-[#FAFAFA]">Thanks — we received your intake.</p>
              <p className="mt-2 text-sm text-white/75">
                We&apos;ll review it and reach out at the email you provided.
              </p>
              <NeonButton
                variant="solid"
                size="lg"
                className="mt-6 w-full sm:w-auto"
                onClick={() => setStatus("form")}
              >
                Submit another
              </NeonButton>
            </div>
          </div>
        ) : (
          <CrmIntakeWizard onSuccess={() => setStatus("ok")} />
        )}
      </div>

      <div className="mt-24 md:mt-32">
        <Footer basePath="/" />
      </div>
    </div>
  );
}
