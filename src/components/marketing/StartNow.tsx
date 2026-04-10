"use client";

import Link from "next/link";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";
import { marketingCtaPrimaryLinkClasses } from "@/lib/marketing-cta-classes";

export default function StartNow() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--phoenix-gold)]/25 bg-gradient-to-br from-[var(--phoenix-gold)]/10 to-transparent p-10 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">
          READY TO BUILD IT <span className="fire-text">RIGHT?</span>
        </h2>
        <p className="mt-4 text-[var(--ash-gray)]">
          If your website looks good but your systems feel messy, we can fix
          both — and make everything measurable.
        </p>
        <Link
          href={BOOK_CONSULTATION_PATH}
          className={`${marketingCtaPrimaryLinkClasses} relative mt-8 inline-flex`}
        >
          <span className="neon-cta-line-top" aria-hidden />
          <span className="neon-cta-line-bottom" aria-hidden />
          <span className="relative z-[1]">BOOK A CONSULTATION</span>
        </Link>
      </div>
    </section>
  );
}
