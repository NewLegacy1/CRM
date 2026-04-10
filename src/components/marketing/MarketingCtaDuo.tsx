"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";
import type { OpenLeadFormOptions } from "@/components/marketing/LeadCaptureProvider";
import { useLeadCapture } from "@/components/marketing/LeadCaptureProvider";
import {
  marketingCtaPrimaryLinkClasses,
  marketingCtaSecondaryButtonClasses,
} from "@/lib/marketing-cta-classes";
import { cn } from "@/lib/utils";

type MarketingCtaDuoProps = {
  className?: string;
  leadFormOptions?: OpenLeadFormOptions;
  /** One row, equal flex width (e.g. Why Us). Default stacks on xs, row from sm+. */
  equalWidthRow?: boolean;
};

export function MarketingCtaDuo({ className = "", leadFormOptions, equalWidthRow }: MarketingCtaDuoProps) {
  const { openLeadForm } = useLeadCapture();

  const primaryExtra = equalWidthRow
    ? "min-h-[52px] w-full min-w-0 flex-1 basis-0 justify-center text-center"
    : "";
  const secondaryExtra = equalWidthRow
    ? "min-h-[52px] w-full min-w-0 flex-1 basis-0 justify-center"
    : "";

  return (
    <div
      className={cn(
        equalWidthRow
          ? "flex w-full max-w-full flex-row flex-nowrap items-stretch gap-3"
          : "flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4",
        className
      )}
    >
      <Link
        href={BOOK_CONSULTATION_PATH}
        className={cn(marketingCtaPrimaryLinkClasses, primaryExtra)}
      >
        <span className="neon-cta-line-top" aria-hidden />
        <span className="neon-cta-line-bottom" aria-hidden />
        <span className="relative z-[1] inline-flex items-center gap-2 sm:gap-3">
          BOOK A CONSULTATION
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/10">
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => openLeadForm(leadFormOptions)}
        className={cn(marketingCtaSecondaryButtonClasses, secondaryExtra)}
      >
        GET IN TOUCH
      </button>
    </div>
  );
}
