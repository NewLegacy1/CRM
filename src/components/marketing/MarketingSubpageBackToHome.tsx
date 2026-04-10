"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const linkClassName =
  "mb-6 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.875rem] border border-white/[0.12] bg-white/[0.06] text-white/75 ring-1 ring-white/[0.06] transition-colors hover:border-violet-400/35 hover:bg-white/[0.1] hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400/80";

export function MarketingSubpageBackToHome() {
  return (
    <Link href="/" className={linkClassName} aria-label="Back to home">
      <ArrowLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
    </Link>
  );
}
