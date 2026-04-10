import type { Metadata } from "next";
import { CALENDLY_CONSULTATION_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Book a consultation",
};

export default function BookPage() {
  return (
    <div className="marketing-page-bg min-h-screen px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-center text-3xl font-bold text-[var(--pure-white)] sm:text-4xl">
          Book a <span className="fire-text">consultation</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-[var(--ash-gray)]">
          Pick a time that works for you — we&apos;ll map priorities and next
          steps on the call.
        </p>
        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-2xl">
          <iframe
            title="Schedule a consultation"
            src={CALENDLY_CONSULTATION_URL}
            className="h-[700px] w-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
