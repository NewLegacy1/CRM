"use client";

import { useCallback, useMemo, useState } from "react";
import { NeonButton } from "@/components/ui/neon-button";
import { Label } from "@/components/ui/label";
import {
  marketingFormFieldClasses,
  marketingFormLabelClasses,
  marketingFormTextareaClasses,
  marketingIntakeOuterNeonClasses,
  marketingIntakePanelClasses,
} from "@/lib/marketing-form-classes";
import { INTAKE_PAYLOAD_SCHEMA_VERSION } from "@/lib/validators/intake";

const STEPS = [
  { id: "contact", title: "Contact" },
  { id: "team", title: "Team & ops" },
  { id: "tools", title: "Tools & data" },
  { id: "pipeline", title: "Pipeline & goals" },
  { id: "wrap", title: "Compliance & timing" },
] as const;

type CrmDraft = {
  businessName: string;
  primaryContactName: string;
  email: string;
  phone: string;
  teamSize: string;
  rolesInvolved: string;
  locations: string;
  currentTools: string;
  dataSources: string;
  pipelineDescription: string;
  leadSources: string;
  painPoints: string;
  automationGoals: string;
  integrationsWanted: string;
  complianceConsiderations: string;
  reportingNeeds: string;
  timeline: string;
  additionalNotes: string;
};

const emptyDraft = (): CrmDraft => ({
  businessName: "",
  primaryContactName: "",
  email: "",
  phone: "",
  teamSize: "",
  rolesInvolved: "",
  locations: "",
  currentTools: "",
  dataSources: "",
  pipelineDescription: "",
  leadSources: "",
  painPoints: "",
  automationGoals: "",
  integrationsWanted: "",
  complianceConsiderations: "",
  reportingNeeds: "",
  timeline: "",
  additionalNotes: "",
});

type Props = {
  onSuccess: () => void;
};

export function CrmIntakeWizard({ onSuccess }: Props) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<CrmDraft>(emptyDraft);
  const [status, setStatus] = useState<"idle" | "submitting" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  const update = useCallback(<K extends keyof CrmDraft>(key: K, value: CrmDraft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
  }, []);

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!d.businessName.trim()) return "Business name is required.";
      if (!d.primaryContactName.trim()) return "Primary contact is required.";
      if (!d.email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return "Enter a valid email.";
      if (!d.phone.trim()) return "Phone is required.";
    }
    if (step === 3 && !d.automationGoals.trim()) {
      return "Describe what you want to achieve before continuing.";
    }
    return null;
  }, [step, d]);

  const canNext = stepError === null;

  const submit = useCallback(async () => {
    if (!d.automationGoals.trim()) {
      setErrMsg("Automation goals are required.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");
    const body = {
      businessName: d.businessName.trim(),
      primaryContactName: d.primaryContactName.trim(),
      email: d.email.trim(),
      phone: d.phone.trim(),
      payload: {
        schemaVersion: INTAKE_PAYLOAD_SCHEMA_VERSION,
        teamSize: d.teamSize.trim() || undefined,
        rolesInvolved: d.rolesInvolved.trim() || undefined,
        locations: d.locations.trim() || undefined,
        currentTools: d.currentTools.trim() || undefined,
        dataSources: d.dataSources.trim() || undefined,
        pipelineDescription: d.pipelineDescription.trim() || undefined,
        leadSources: d.leadSources.trim() || undefined,
        painPoints: d.painPoints.trim() || undefined,
        automationGoals: d.automationGoals.trim(),
        integrationsWanted: d.integrationsWanted.trim() || undefined,
        complianceConsiderations: d.complianceConsiderations.trim() || undefined,
        reportingNeeds: d.reportingNeeds.trim() || undefined,
        timeline: d.timeline.trim() || undefined,
        additionalNotes: d.additionalNotes.trim() || undefined,
      },
    };

    try {
      const res = await fetch("/api/intake/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
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
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 1 — Company & contact</p>
              <Field label="Business name" htmlFor="ci-biz">
                <input
                  id="ci-biz"
                  className={marketingFormFieldClasses}
                  value={d.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  autoComplete="organization"
                />
              </Field>
              <Field label="Primary contact" htmlFor="ci-contact">
                <input
                  id="ci-contact"
                  className={marketingFormFieldClasses}
                  value={d.primaryContactName}
                  onChange={(e) => update("primaryContactName", e.target.value)}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="ci-email">
                  <input
                    id="ci-email"
                    type="email"
                    className={marketingFormFieldClasses}
                    value={d.email}
                    onChange={(e) => update("email", e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Phone" htmlFor="ci-phone">
                  <input
                    id="ci-phone"
                    type="tel"
                    className={marketingFormFieldClasses}
                    value={d.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 2 — Team & operations</p>
              <Field label="Team size" htmlFor="ci-team">
                <input
                  id="ci-team"
                  className={marketingFormFieldClasses}
                  value={d.teamSize}
                  onChange={(e) => update("teamSize", e.target.value)}
                  placeholder="e.g. 8 people across sales & ops"
                />
              </Field>
              <Field label="Roles involved in this project" htmlFor="ci-roles">
                <textarea
                  id="ci-roles"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.rolesInvolved}
                  onChange={(e) => update("rolesInvolved", e.target.value)}
                />
              </Field>
              <Field label="Locations / time zones" htmlFor="ci-loc">
                <textarea
                  id="ci-loc"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.locations}
                  onChange={(e) => update("locations", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 3 — Tools & data</p>
              <Field label="Tools you use today" htmlFor="ci-tools">
                <textarea
                  id="ci-tools"
                  className={marketingFormTextareaClasses}
                  rows={4}
                  value={d.currentTools}
                  onChange={(e) => update("currentTools", e.target.value)}
                  placeholder="CRM, spreadsheets, inbox, scheduling, billing…"
                />
              </Field>
              <Field label="Where does customer / job data live?" htmlFor="ci-data">
                <textarea
                  id="ci-data"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.dataSources}
                  onChange={(e) => update("dataSources", e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 4 — Pipeline & goals</p>
              <Field label="How does a lead become a customer today?" htmlFor="ci-pipe">
                <textarea
                  id="ci-pipe"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.pipelineDescription}
                  onChange={(e) => update("pipelineDescription", e.target.value)}
                />
              </Field>
              <Field label="Main lead sources" htmlFor="ci-leads">
                <textarea
                  id="ci-leads"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.leadSources}
                  onChange={(e) => update("leadSources", e.target.value)}
                />
              </Field>
              <Field label="Biggest bottlenecks or pain points" htmlFor="ci-pain">
                <textarea
                  id="ci-pain"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.painPoints}
                  onChange={(e) => update("painPoints", e.target.value)}
                />
              </Field>
              <Field label="What should automation or a CRM fix for you? (required)" htmlFor="ci-goals">
                <textarea
                  id="ci-goals"
                  className={marketingFormTextareaClasses}
                  rows={4}
                  value={d.automationGoals}
                  onChange={(e) => update("automationGoals", e.target.value)}
                  placeholder="Outcomes, not just tools — e.g. faster follow-up, fewer missed leads."
                />
              </Field>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Step 5 — Compliance & timing</p>
              <Field label="Integrations or systems to connect" htmlFor="ci-int">
                <textarea
                  id="ci-int"
                  className={marketingFormTextareaClasses}
                  rows={3}
                  value={d.integrationsWanted}
                  onChange={(e) => update("integrationsWanted", e.target.value)}
                />
              </Field>
              <Field label="Compliance / privacy considerations" htmlFor="ci-comp">
                <textarea
                  id="ci-comp"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.complianceConsiderations}
                  onChange={(e) => update("complianceConsiderations", e.target.value)}
                />
              </Field>
              <Field label="Reporting or dashboards you need" htmlFor="ci-rep">
                <textarea
                  id="ci-rep"
                  className={marketingFormTextareaClasses}
                  rows={2}
                  value={d.reportingNeeds}
                  onChange={(e) => update("reportingNeeds", e.target.value)}
                />
              </Field>
              <Field label="Target timeline" htmlFor="ci-time">
                <input
                  id="ci-time"
                  className={marketingFormFieldClasses}
                  value={d.timeline}
                  onChange={(e) => update("timeline", e.target.value)}
                />
              </Field>
              <Field label="Additional notes" htmlFor="ci-notes">
                <textarea
                  id="ci-notes"
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
              disabled={status === "submitting"}
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
