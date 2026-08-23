import { MoneyLeakGraphic } from "@/components/marketing/booked-jobs/MoneyLeakGraphic";
import {
  BookedJobsCta,
  BookedJobsInteract,
  BookedJobsStickyBar,
} from "@/components/marketing/booked-jobs/BookedJobsCta";
import {
  headlineFromSlug,
  tradeFromSlug,
} from "@/lib/booked-jobs-hooks";

type Search = {
  h?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
};

export default async function BookedJobsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const headline = headlineFromSlug(sp.h);
  const defaultTrade = tradeFromSlug(sp.h);

  return (
    <BookedJobsInteract
      form={{
        headlineVariant: sp.h,
        defaultTrade,
        utm: {
          source: sp.utm_source,
          medium: sp.utm_medium,
          campaign: sp.utm_campaign,
          content: sp.utm_content,
        },
      }}
    >
      <div className="relative z-10 min-h-screen pb-24 text-foreground">
        <header className="px-4 pt-6">
          <p className="mx-auto max-w-6xl font-heading text-sm tracking-[0.2em] text-white/50">
            NEW LEGACY AI
          </p>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1fr_1fr] md:py-16">
          <div>
            <p className="font-heading text-xs tracking-[0.2em] text-cyan-200/80">
              ONTARIO HVAC · PLUMBER · ELECTRICIAN · ROOFER
            </p>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-[1.05] text-[#FAFAFA] sm:text-5xl md:text-[3.1rem]">
              {headline}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
              You’re already doing the work. The money walks to whoever shows up
              on Maps and picks up. We show the leak. Then we fix it in 14 days.
              You close.
            </p>
            <div className="mt-8">
              <BookedJobsCta />
            </div>
          </div>

          <MoneyLeakGraphic />
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-3 md:grid-cols-3">
            <LeakCard
              title="They never find you"
              body="Three names show. If you’re last, that job’s revenue is gone."
            />
            <LeakCard
              title="They skip you"
              body="Thin profile looks closed. They book the shop that looks busy."
            />
            <LeakCard
              title="They can’t reach you"
              body="Voicemail is a job you already paid to get — then gave away."
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="font-heading text-2xl text-[#FAFAFA] md:text-3xl">
            What 14 days actually is
          </h2>
          <ul className="mt-5 max-w-2xl space-y-3 text-sm leading-relaxed text-white/70 md:text-base">
            <li>Google Business Profile rebuilt so you show up and look open.</li>
            <li>A conversion page that sends the job to you — not a brochure site.</li>
            <li>Missed-call text-back so the homeowner doesn’t fund the next truck.</li>
            <li>Owner alerts. You call. You quote. You keep the money.</li>
            <li>GA4 + a 30-minute training so you can run it after day 14.</li>
          </ul>
        </section>

        <BookedJobsStickyBar />
      </div>
    </BookedJobsInteract>
  );
}

function LeakCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.25rem] border-galaxy-neon">
      <div className="rounded-[calc(1.25rem-1px)] card-galaxy-glass p-5 ring-1 ring-white/[0.08]">
        <p className="font-heading text-sm text-[#FAFAFA]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{body}</p>
      </div>
    </div>
  );
}
