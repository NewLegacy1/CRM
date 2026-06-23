"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ExternalLink } from "lucide-react";

export interface DetailOpsSubscription {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  status: string;
  plan_name: string | null;
  amount_cents: number | null;
  currency: string;
  billing_interval: string | null;
  stripe_created_at: string;
  current_period_end: string | null;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

interface DetailOpsDashboardProps {
  subscriptions: DetailOpsSubscription[];
  stats: {
    activeCount: number;
    newThisWeek: number;
    mrrCents: number;
    currency: string;
  };
  logoUrl: string;
  tagline: string;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
    case "trialing":
      return "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";
    case "canceled":
    case "unpaid":
      return "bg-red-500/10 text-red-300 ring-red-400/20";
    case "past_due":
      return "bg-amber-500/10 text-amber-300 ring-amber-400/20";
    default:
      return "bg-zinc-500/10 text-zinc-300 ring-zinc-400/20";
  }
}

export function DetailOpsDashboard({
  subscriptions,
  stats,
  logoUrl,
  tagline,
}: DetailOpsDashboardProps) {
  const statCards = [
    { label: "Active subscribers", value: String(stats.activeCount) },
    { label: "New this week", value: String(stats.newThisWeek) },
    {
      label: "Monthly recurring revenue",
      value: formatMoney(stats.mrrCents, stats.currency),
    },
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-violet-300"
      >
        <ArrowLeft className="h-4 w-4" />
        All products
      </Link>

      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-violet-950/20">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-white/[0.06] px-6 py-6 md:px-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5 ring-1 ring-white/10">
              <Image
                src={logoUrl}
                alt="DetailOps logo"
                width={56}
                height={56}
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                  DetailOps
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live sync
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{tagline}</p>
            </div>
          </div>
          <a
            href="https://detailops.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-zinc-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-violet-200"
          >
            detailops.ca
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-zinc-950/50 px-5 py-4 ring-1 ring-white/[0.05]"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-violet-300">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900/40 backdrop-blur-xl">
        <div className="border-b border-white/[0.06] px-6 py-5 md:px-8">
          <h2 className="text-lg font-semibold text-zinc-100">All subscribers</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Updated automatically from Stripe when someone subscribes or changes
            plans.
          </p>
        </div>
        {subscriptions.length === 0 ? (
          <div className="px-6 py-16 text-center md:px-8">
            <p className="text-sm text-zinc-400">
              No subscribers yet. New DetailOps signups will appear here
              automatically.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Renews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-zinc-200">
                        {sub.customer_name ?? "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {sub.customer_email ?? sub.stripe_customer_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {sub.plan_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ${statusBadge(sub.status)}`}
                    >
                      {sub.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    {sub.amount_cents != null
                      ? `${formatMoney(sub.amount_cents, sub.currency)}/${sub.billing_interval ?? "mo"}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {new Date(sub.stripe_created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
