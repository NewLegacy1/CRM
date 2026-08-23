"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/neon-button";
import {
  marketingFormFieldClasses,
  marketingFormLabelClasses,
  marketingFormSelectClasses,
} from "@/lib/marketing-form-classes";
import { BOOKED_JOBS_TRADES } from "@/lib/booked-jobs-hooks";

type BookedJobsFormProps = {
  headlineVariant?: string;
  defaultTrade?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
};

export function BookedJobsForm({
  headlineVariant,
  defaultTrade,
  utm,
}: BookedJobsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      funnel: "booked-jobs" as const,
      name: String(form.get("name") ?? "").trim(),
      businessName: String(form.get("businessName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      trade: String(form.get("trade") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      gbpStatus: String(form.get("gbpStatus") ?? ""),
      jobsGoal: String(form.get("jobsGoal") ?? "").trim(),
      readyToInvest: String(form.get("readyToInvest") ?? ""),
      sourcePath: "/booked-jobs",
      headlineVariant,
      utmSource: utm.source,
      utmMedium: utm.medium,
      utmCampaign: utm.campaign,
      utmContent: utm.content,
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not send. Try again.");
      }
      const params = new URLSearchParams();
      if (payload.businessName) params.set("biz", payload.businessName);
      if (payload.city) params.set("city", payload.city);
      router.push(`/booked-jobs/thank-you?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="bj-name">
          <input id="bj-name" name="name" required autoComplete="name" className={marketingFormFieldClasses} />
        </Field>
        <Field label="Business name" htmlFor="bj-business">
          <input
            id="bj-business"
            name="businessName"
            required
            autoComplete="organization"
            className={marketingFormFieldClasses}
          />
        </Field>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Email" htmlFor="bj-email">
          <input
            id="bj-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={marketingFormFieldClasses}
          />
        </Field>
        <Field label="Mobile" htmlFor="bj-phone">
          <input
            id="bj-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={marketingFormFieldClasses}
          />
        </Field>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="Trade" htmlFor="bj-trade">
          <select
            id="bj-trade"
            name="trade"
            required
            defaultValue={defaultTrade ?? ""}
            className={marketingFormSelectClasses}
          >
            <option value="" disabled>
              Select trade
            </option>
            {BOOKED_JOBS_TRADES.map((trade) => (
              <option key={trade} value={trade}>
                {trade}
              </option>
            ))}
          </select>
        </Field>
        <Field label="City" htmlFor="bj-city">
          <input
            id="bj-city"
            name="city"
            required
            autoComplete="address-level2"
            placeholder="Hamilton, ON"
            className={marketingFormFieldClasses}
          />
        </Field>
      </div>
      <Field label="Google Business Profile?" htmlFor="bj-gbp">
        <select id="bj-gbp" name="gbpStatus" required defaultValue="" className={marketingFormSelectClasses}>
          <option value="" disabled>
            Select one
          </option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Not sure</option>
        </select>
      </Field>
      <Field label="Extra booked jobs you want per month" htmlFor="bj-jobs">
        <input
          id="bj-jobs"
          name="jobsGoal"
          required
          placeholder="e.g. 8–12"
          className={marketingFormFieldClasses}
        />
      </Field>
      <Field label="Ready to invest $2,500+ in 14 days if this is a fit?" htmlFor="bj-ready">
        <select
          id="bj-ready"
          name="readyToInvest"
          required
          defaultValue=""
          className={marketingFormSelectClasses}
        >
          <option value="" disabled>
            Select one
          </option>
          <option value="yes">Yes</option>
          <option value="not_yet">Not yet</option>
        </select>
      </Field>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <NeonButton type="submit" variant="solid" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Sending…" : "Show me the leak"}
      </NeonButton>
      <p className="text-center text-xs text-white/40">
        We’ll call you. We capture inbound jobs and get them to you. We do not answer your
        phones or quote work.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className={marketingFormLabelClasses}>{label}</span>
      {children}
    </label>
  );
}
