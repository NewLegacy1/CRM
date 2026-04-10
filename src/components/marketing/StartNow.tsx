"use client";

import { MarketingCtaDuo } from "@/components/marketing/MarketingCtaDuo";

export default function StartNow() {
  return (
    <section
      id="start-now"
      className="relative pt-6 pb-28 md:pt-12 md:pb-40"
    >
      <div className="container mx-auto relative max-w-4xl px-4 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-[0.95]">
          LET&apos;S EXPLORE THE{" "}
          <span className="gradient-text-highlight">UNIVERSE OF AI.</span>
        </h2>
        <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          If your site isn&apos;t pulling its weight or the day-to-day still runs on manual work,
          we&apos;ll help you modernize — in plain terms, with results you can see.
        </p>

        <MarketingCtaDuo />
      </div>
    </section>
  );
}
