import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { APP_PRODUCTS } from "@/lib/stripe/apps";
import { ArrowRight, ExternalLink, Layers } from "lucide-react";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from("stripe_subscriptions")
    .select("app_slug, status, amount_cents, currency");

  const statsByApp = new Map<
    string,
    { active: number; total: number; mrrCents: number; currency: string }
  >();

  for (const row of subscriptions ?? []) {
    const current = statsByApp.get(row.app_slug) ?? {
      active: 0,
      total: 0,
      mrrCents: 0,
      currency: row.currency ?? "cad",
    };
    current.total += 1;
    if (row.status === "active" || row.status === "trialing") {
      current.active += 1;
      current.mrrCents += row.amount_cents ?? 0;
    }
    statsByApp.set(row.app_slug, current);
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-violet-500/10 via-zinc-900/60 to-zinc-950 p-8">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15 ring-1 ring-violet-400/20">
            <Layers className="h-6 w-6 text-violet-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
              Products
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Apps and builds you operate. Subscriptions stay in sync with Stripe
              automatically — no manual refresh needed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {APP_PRODUCTS.map((app) => {
          const stats = statsByApp.get(app.slug) ?? {
            active: 0,
            total: 0,
            mrrCents: 0,
            currency: "cad",
          };

          return (
            <article
              key={app.slug}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/50 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl transition hover:border-violet-400/20 hover:bg-zinc-900/70"
            >
              <div className="border-b border-white/[0.06] bg-gradient-to-r from-zinc-900/80 to-violet-950/20 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-white/10">
                      <Image
                        src={app.logoUrl}
                        alt={`${app.name} logo`}
                        width={48}
                        height={48}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">
                        {app.name}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-violet-300/80">
                        {app.tagline}
                      </p>
                    </div>
                  </div>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-violet-300"
                    aria-label={`Open ${app.name}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-1 flex-col px-6 py-5">
                <p className="text-sm leading-relaxed text-zinc-400">
                  {app.description}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-zinc-950/60 px-3 py-3 ring-1 ring-white/[0.04]">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Active
                    </p>
                    <p className="mt-1 text-xl font-bold text-emerald-400">
                      {stats.active}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-950/60 px-3 py-3 ring-1 ring-white/[0.04]">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Total
                    </p>
                    <p className="mt-1 text-xl font-bold text-zinc-100">
                      {stats.total}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-950/60 px-3 py-3 ring-1 ring-white/[0.04]">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      MRR
                    </p>
                    <p className="mt-1 text-lg font-bold text-violet-300">
                      {formatMoney(stats.mrrCents, stats.currency)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/products/${app.slug}`}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20 transition group-hover:bg-violet-500/25"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
