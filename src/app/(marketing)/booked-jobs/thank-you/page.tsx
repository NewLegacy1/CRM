import { VslPlayer } from "@/components/marketing/booked-jobs/VslPlayer";

type Search = {
  biz?: string;
  city?: string;
};

export default async function BookedJobsThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { biz, city } = await searchParams;
  const who = [biz, city].filter(Boolean).join(" in ");

  return (
    <div className="relative z-10 min-h-screen pb-16 pt-10 text-foreground md:pt-16">
      <div className="container mx-auto max-w-3xl px-4">
        <p className="font-heading text-xs tracking-[0.28em] text-white/45">NEW LEGACY AI</p>
        <h1 className="mt-4 font-heading text-3xl font-bold text-[#FAFAFA] sm:text-4xl">
          We’re pulling your Google listing.
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/70">
          {who ? `${who}. ` : ""}
          The PDF hits your inbox in about five minutes. Watch this while it generates.
          We’ll call you — no calendar.
        </p>

        <div className="mt-8 rounded-[1.25rem] border-galaxy-neon">
          <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-5 ring-1 ring-white/[0.08]">
            <p className="font-heading text-sm text-[#FAFAFA]">What happens next</p>
            <ol className="mt-2 space-y-1.5 text-sm text-white/65">
              <li>1. Audit PDF to your email.</li>
              <li>2. We call you within 30 minutes during business hours.</li>
              <li>3. You watch the video so the call isn’t a first date.</li>
            </ol>
          </div>
        </div>

        <section className="mt-10">
          <VslPlayer
            title="Watch this before we call"
            caption="Six minutes. Sells the call, not the close. It goes here after you record it."
          />
        </section>
      </div>
    </div>
  );
}
