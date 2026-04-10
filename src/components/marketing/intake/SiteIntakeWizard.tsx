"use client";

import { useCallback, useMemo, useState } from "react";
import { NeonButton } from "@/components/ui/neon-button";
import { Label } from "@/components/ui/label";
import {
  marketingFormFieldClasses,
  marketingFormLabelClasses,
  marketingFormSelectClasses,
  marketingFormTextareaClasses,
  marketingIntakeOuterNeonClasses,
  marketingIntakePanelClasses,
} from "@/lib/marketing-form-classes";
import { INTAKE_PAYLOAD_SCHEMA_VERSION } from "@/lib/validators/intake";
import { INTAKE_TIMEZONE_OPTIONS } from "@/lib/intake-timezones";

const STEPS = [
  { id: "contact", title: "Contact" },
  { id: "business", title: "Your business" },
  { id: "scope", title: "Site scope" },
  { id: "brand", title: "Brand & content" },
  { id: "technical", title: "Technical" },
  { id: "planning", title: "Timeline & budget" },
] as const;

type SiteDraft = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  timezone: string;
  targetAudience: string;
  industryNiche: string;
  valueProposition: string;
  projectSummary: string;
  pagesAndSections: string;
  featuresIntegrations: string;
  competitorsInspiration: string;
  brandGuidelines: string;
  assetStatus: string;
  contentPlan: string;
  currentWebsite: string;
  hostingDomain: string;
  technicalIntegrations: string;
  seoNeeds: string;
  timeline: string;
  budgetRange: string;
  stakeholders: string;
  additionalNotes: string;
};

const emptyDraft = (): SiteDraft => ({
  name: "",
  businessName: "",
  email: "",
  phone: "",
  timezone: "",
  targetAudience: "",
  industryNiche: "",
  valueProposition: "",
  projectSummary: "",
  pagesAndSections: "",
  featuresIntegrations: "",
  competitorsInspiration: "",
  brandGuidelines: "",
  assetStatus: "",
  contentPlan: "",
  currentWebsite: "",
  hostingDomain: "",
  technicalIntegrations: "",
  seoNeeds: "",
  timeline: "",
  budgetRange: "",
  stakeholders: "",
  additionalNotes: "",
});

type Props = {
  onSuccess: () => void;
};

export function SiteIntakeWizard({ onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<SiteDraft>(emptyDraft);
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  const update = useCallback(<K extends keyof SiteDraft>(key: K, value: SiteDraft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
  }, []);

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!d.name.trim()) return "Name is required.";
      if (!d.businessName.trim()) return "Business name is required.";
      if (!d.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return "Enter a valid email.";
      if (!d.phone.trim()) return "Phone is required.";
      if (!d.timezone.trim()) return "Select a time zone.";
    }
    if (step === 2 && !d.projectSummary.trim()) {
      return "Describe what you want to build before continuing.";
    }
    return null;
  }, [step, d]);

  const canNext = stepError === null;

  const submit = useCallback(async () => {
    if (!d.projectSummary.trim()) {
      setErrMsg("Project summary is required.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");
    const body = {
      name: d.name.trim(),
      businessName: d.businessName.trim(),
      email: d.email.trim(),
      phone: d.phone.trim(),
      timezone: d.timezone.trim(),
      payload: {
        schemaVersion: INTAKE_PAYLOAD_SCHEMA_VERSION,
        targetAudience: d.targetAudience.trim() || undefined,
        industryNiche: d.industryNiche.trim() || undefined,
        valueProposition: d.valueProposition.trim() || undefined,
        projectSummary: d.projectSummary.trim(),
        pagesAndSections: d.pagesAndSections.trim() || undefined,
        featuresIntegrations: d.featuresIntegrations.trim() || undefined,
        competitorsInspiration: d.competitorsInspiration.trim() || undefined,
        brandGuidelines: d.brandGuidelines.trim() || undefined,
        assetStatus: d.assetStatus.trim() || undefined,
        contentPlan: d.contentPlan.trim() || undefined,
        currentWebsite: d.currentWebsite.trim() || undefined,
        hostingDomain: d.hostingDomain.trim() || undefined,
        technicalIntegrations: d.technicalIntegrations.trim() || undefined,
        seoNeeds: d.seoNeeds.trim() || undefined,
        timeline: d.timeline.trim() || undefined,
        budgetRange: d.budgetRange.trim() || undefined,
        stakeholders: d.stakeholders.trim() || undefined,
        additionalNotes: d.additionalNotes.trim() || undefined,
      },
    };

    try {
      const res = await fetch("/api/intake/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; details?: unknown };
      if (!res.ok) {
        setErrMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("err");
        return;
      }
      setD(emptyDraft());
      setStep(0);
      onSuccess();
    } catch {
      setErrMsg("Network error. Check your connection and try again.");
      setStatus("err");
    } finally {
      setStatus("idle");
    }
  }, [d, onSuccess]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => (i < step ? setStep(i) : undefined)}
            disabled={i > step}
            className={`rounded-full px-3 py-1 text-[10px] font-heading font-semibold uppercase tracking-[0.14em] transition-colors ${
              i === step
                ? "bg-white/[0.14] text-white ring-1 ring-violet-400/40"
                : i < step
                  ? "text-violet-300/90 hover:text-violet-200"
                  : "text-white/35"
            }`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      <div className={marketingIntakeOuterNeonClasses}>
        <div className={marketingIntakePanelClasses}>
          {step === 0 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 1 — Contact</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name" htmlFor="si-name">
                  <input
                    id="si-name"
                    className={marketingFormFieldClasses}
                    value={d.name}
                    onChange={(e) => update("name", e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Business name" htmlFor="si-biz">
                  <input
                    id="si-biz"
                    className={marketingFormFieldClasses}
                    value={d.businessName}
                    onChange={(e) => update("businessName", e.target.value)}
                    autoComplete="organization"
                  />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="si-email">
                  <input
                    id="si-email"
                    type="email"
                    className={marketingFormFieldClasses}
                    value={d.email}
                    onChange={(e) => update("email", e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" htmlFor="si-phone">
                  <input
                    id="si-phone"
                    type="tel"
                    className={marketingFormFieldClasses}
                    value={d.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
              </div>
              <Field label="Time zone" htmlFor="si-tz">
                <select
                  id="si-tz"
                  className={marketingFormSelectClasses}
                  value={d.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                >
                  <option value="" className="bg-zinc-950 text-zinc-400">
                    Select…
                  </option>
                  {INTAKE_TIMEZONE_OPTIONS.map((z) => (
                    <option key={z.value} value={z.value} className="bg-zinc-950 text-zinc-100">
                      {z.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 2 — Your business</p>
              <Field label="Who is the site for? (ideal visitor / customer)" htmlFor="si-audience">
                <textarea
                  id="si-audience"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.targetAudience}
                  onChange={(e) => update("targetAudience", e.target.value)}
                />
              </Field>
              <Field label="Industry or niche" htmlFor="si-industry">
                <input
                  id="si-industry"
                  className={marketingFormFieldClasses}
                  value={d.industryNiche}
                  onChange={(e) => update("industryNiche", e.target.value)}
                />
              </Field>
              <Field label="What do you want visitors to understand in 10 seconds?" htmlFor="si-vp">
                <textarea
                  id="si-vp"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.valueProposition}
                  onChange={(e) => update("valueProposition", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 3 — Site scope</p>
              <Field label="Project summary (required)" htmlFor="si-sum">
                <textarea
                  id="si-sum"
                  className={marketingFormTextareaClasses}
                  rows={4}
                  required
                  value={d.projectSummary}
                  onChange={(e) => update("projectSummary", e.target.value)}
                  placeholder="Goals, must-haves, and what success looks like."
                />
              </Field>
              <Field label="Pages or sections you know you need" htmlFor="si-pages">
                <textarea
                  id="si-pages"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.pagesAndSections}
                  onChange={(e) => update("pagesAndSections", e.target.value)}
                />
              </Field>
              <Field label="Features, apps, or integrations" htmlFor="si-feat">
                <textarea
                  id="si-feat"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.featuresIntegrations}
                  onChange={(e) => update("featuresIntegrations", e.target.value)}
                />
              </Field>
              <Field label="Competitors or sites you admire" htmlFor="si-comp">
                <textarea
                  id="si-comp"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.competitorsInspiration}
                  onChange={(e) => update("competitorsInspiration", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 4 — Brand & content</p>
              <Field label="Brand guidelines or mood" htmlFor="si-brand">
                <textarea
                  id="si-brand"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.brandGuidelines}
                  onChange={(e) => update("brandGuidelines", e.target.value)}
                />
              </Field>
              <Field label="Logo, fonts, colors — what exists today?" htmlFor="si-assets">
                <textarea
                  id="si-assets"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.assetStatus}
                  onChange={(e) => update("assetStatus", e.target.value)}
                />
              </Field>
              <Field label="Who writes copy? Do you need help with content?" htmlFor="si-content">
                <textarea
                  id="si-content"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.contentPlan}
                  onChange={(e) => update("contentPlan", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 5 — Technical</p>
              <Field label="Current website (if any)" htmlFor="si-url">
                <input
                  id="si-url"
                  type="url"
                  className={marketingFormFieldClasses}
                  placeholder="https://"
                  value={d.currentWebsite}
                  onChange={(e) => update("currentWebsite", e.target.value)}
                />
              </Field>
              <Field label="Domain & hosting — owned, need help, unsure?" htmlFor="si-host">
                <textarea
                  id="si-host"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.hostingDomain}
                  onChange={(e) => update("hostingDomain", e.target.value)}
                />
              </Field>
              <Field label="Integrations (forms, CRM, booking, payments, etc.)" htmlFor="si-tech">
                <textarea
                  id="si-tech"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.technicalIntegrations}
                  onChange={(e) => update("technicalIntegrations", e.target.value)}
                />
              </Field>
              <Field label="SEO, analytics, accessibility priorities" htmlFor="si-seo">
                <textarea
                  id="si-seo"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.seoNeeds}
                  onChange={(e) => update("seoNeeds", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 6 — Timeline & budget</p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Target timeline" htmlFor="si-time">
                  <input
                    id="si-time"
                    className={marketingFormFieldClasses}
                    value={d.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                    placeholder="e.g. Q2 launch"
                  />
                </Field>
                <Field label="Budget range" htmlFor="si-budget">
                  <input
                    id="si-budget"
                    className={marketingFormFieldClasses}
                    value={d.budgetRange}
                    onChange={(e) => update("budgetRange", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Decision makers / approval process" htmlFor="si-stake">
                <textarea
                  id="si-stake"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.stakeholders}
                  onChange={(e) => update("stakeholders", e.target.value)}
                />
              </Field>
              <Field label="Anything else we should know?" htmlFor="si-notes">
                <textarea
                  id="si-notes"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.additionalNotes}
                  onChange={(e) => update("additionalNotes", e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>
      </div>

      {stepError ? <p className="text-sm text-rose-400">{stepError}</p> : null}
      {errMsg ? <p className="text-sm text-red-400">{errMsg}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NeonButton
          type="button"
          variant="ghost"
          neon={false}
          className="border border-white/15 bg-white/[0.04] text-white/90 hover:bg-white/[0.08]"
          disabled={step === 0 || status === "submitting"}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </NeonButton>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {step < STEPS.length - 1 ? (
            <NeonButton
              type="button"
              variant="solid"
              size="lg"
              disabled={!canNext || status === "submitting"}
              onClick={() => canNext && setStep((s) => s + 1)}
            >
              Continue
            </NeonButton>
          ) : (
            <NeonButton
              type="button"
              variant="solid"
              size="lg"
              disabled={status === "submitting" || !d.projectSummary.trim()}
              onClick={() => void submit()}
            >
              {status === "submitting" ? "Sending…" : "Submit intake"}
            </NeonButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className={marketingFormLabelClasses}>
        {label}
      </Label>
      {children}
    </div>
  );
}
