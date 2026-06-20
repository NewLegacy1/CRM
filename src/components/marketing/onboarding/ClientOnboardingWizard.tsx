"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Loader2, Upload, X } from "lucide-react";
import Footer from "@/components/marketing/Footer";
import { NeonButton } from "@/components/ui/neon-button";
import { Label } from "@/components/ui/label";
import {
  marketingFormFieldClasses,
  marketingFormLabelClasses,
  marketingFormTextareaClasses,
  marketingIntakeOuterNeonClasses,
  marketingIntakePanelClasses,
} from "@/lib/marketing-form-classes";
import { getOnboardingTotal } from "@/lib/onboarding/contract-template";

type AgreementSection = { title: string; paragraphs: string[] };

type OnboardingData = {
  businessName: string;
  contactName: string | null;
  email: string;
  currency: string;
  lineItems: { description: string; quantity: number; unit_amount: number }[];
  total: number;
  agreementSections: AgreementSection[];
  alreadySubmitted: boolean;
  submission: { id: string; submittedAt: string; signerName: string } | null;
};

type FormDraft = {
  signerName: string;
  agreed: boolean;
  pagesAndSections: string;
  copyNotes: string;
  brandColors: string;
  domainHosting: string;
  socialLinks: string;
};

const STEPS = [
  { id: "agreement", title: "Agreement" },
  { id: "website", title: "Website" },
  { id: "details", title: "Domain & social" },
  { id: "uploads", title: "Assets" },
  { id: "review", title: "Submit" },
] as const;

const emptyDraft = (): FormDraft => ({
  signerName: "",
  agreed: false,
  pagesAndSections: "",
  copyNotes: "",
  brandColors: "",
  domainHosting: "",
  socialLinks: "",
});

type Props = {
  token: string;
  /** Dev-only: skip validation and jump between steps via ?preview=1 */
  preview?: boolean;
};

export function ClientOnboardingWizard({ token, preview = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [data, setData] = useState<OnboardingData | null>(null);
  const [step, setStep] = useState(0);
  const [d, setD] = useState<FormDraft>(emptyDraft);
  const [logoUrls, setLogoUrls] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`/api/onboarding/${token}`);
        const json = (await res.json()) as OnboardingData & { error?: string };
        if (!res.ok) {
          if (!cancelled) setLoadError(json.error ?? "Could not load onboarding link");
          return;
        }
        if (!cancelled) {
          setData(json);
          if (json.alreadySubmitted && !preview) setSubmitted(true);
        }
      } catch {
        if (!cancelled) setLoadError("Network error loading onboarding link.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token, preview]);

  const update = useCallback(<K extends keyof FormDraft>(key: K, value: FormDraft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
  }, []);

  const stepError = useMemo(() => {
    if (preview) return null;
    if (step === 0) {
      if (!d.agreed) return "Please read and accept the agreement.";
      if (d.signerName.trim().length < 2) return "Enter your full legal name to sign.";
    }
    return null;
  }, [preview, step, d.agreed, d.signerName]);

  const canNext = stepError === null;

  const uploadFile = useCallback(
    async (file: File, kind: "logo" | "image") => {
      setUploading(true);
      setErrMsg("");
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("kind", kind);
        const res = await fetch(`/api/onboarding/${token}/upload`, {
          method: "POST",
          body: form,
        });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          setErrMsg(json.error ?? "Upload failed");
          return;
        }
        if (kind === "logo") {
          setLogoUrls((prev) => [...prev, json.url!]);
        } else {
          setImageUrls((prev) => [...prev, json.url!]);
        }
      } catch {
        setErrMsg("Upload failed — check your connection.");
      } finally {
        setUploading(false);
      }
    },
    [token]
  );

  const submit = useCallback(async () => {
    if (preview) return;
    if (!d.agreed || d.signerName.trim().length < 2) {
      setErrMsg("Agreement acceptance and signature are required.");
      return;
    }
    setStatus("submitting");
    setErrMsg("");
    try {
      const res = await fetch(`/api/onboarding/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: d.signerName.trim(),
          agreed: true,
          payload: {
            pagesAndSections: d.pagesAndSections.trim() || undefined,
            copyNotes: d.copyNotes.trim() || undefined,
            brandColors: d.brandColors.trim() || undefined,
            domainHosting: d.domainHosting.trim() || undefined,
            socialLinks: d.socialLinks.trim() || undefined,
          },
          logoUrls,
          imageUrls,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrMsg(json.error ?? "Submission failed");
        setStatus("idle");
        return;
      }
      setSubmitted(true);
    } catch {
      setErrMsg("Network error — please try again.");
      setStatus("idle");
    }
  }, [d, imageUrls, logoUrls, preview, token]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/70">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />
        Loading your onboarding…
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-rose-400">{loadError || "Invalid link"}</p>
        <Link href="/" className="mt-6 inline-block text-violet-300 hover:text-violet-200">
          Back to home
        </Link>
      </div>
    );
  }

  if (submitted && !preview) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className={marketingIntakeOuterNeonClasses}>
          <div className={`${marketingIntakePanelClasses} text-center`}>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-violet-400" aria-hidden />
            <h1 className="font-heading text-2xl font-bold text-[#FAFAFA]">
              You&apos;re all set, {data.businessName}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              We received your agreement, project details, and uploads. New Legacy AI will review
              everything and email your invoice to{" "}
              <span className="text-violet-300">{data.email}</span> shortly. Work begins once
              payment is received.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const money = (n: number) =>
    new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: data.currency.toUpperCase(),
    }).format(n);

  return (
    <div className="relative z-10 min-h-screen pb-16 pt-16 text-foreground md:pb-24 md:pt-20">
      <div className="container mx-auto max-w-3xl px-4">
        <p className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-sm tracking-wide text-white/60 transition-colors hover:text-violet-300"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Back to home
          </Link>
        </p>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300/80">New Legacy AI</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
            Project <span className="gradient-text-highlight">onboarding</span>
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Prepared for <span className="text-white">{data.businessName}</span> · Total{" "}
            {money(getOnboardingTotal(data.lineItems))}
          </p>
          {preview ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Dev preview — jump to any step with the pills or Continue. Submit is disabled
              {data.alreadySubmitted ? " (this link was already submitted)." : "."}
            </p>
          ) : null}
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => (preview || i <= step ? setStep(i) : undefined)}
              disabled={!preview && i > step}
              className={`rounded-full px-3 py-1 text-[10px] font-heading font-semibold uppercase tracking-[0.14em] transition-colors ${
                i === step
                  ? "bg-white/[0.14] text-white ring-1 ring-violet-400/40"
                  : preview || i < step
                    ? "text-violet-300/90 hover:text-violet-200 cursor-pointer"
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
                <div className="flex items-center gap-2 text-violet-300/90">
                  <FileText className="h-4 w-4" aria-hidden />
                  <p className="text-xs uppercase tracking-[0.16em]">Services agreement</p>
                </div>
                <div className="max-h-[min(420px,50vh)] space-y-5 overflow-y-auto rounded-xl border border-white/[0.08] bg-black/20 p-4 text-sm leading-relaxed text-white/80">
                  {data.agreementSections.map((section) => (
                    <div key={section.title}>
                      <h2 className="font-heading text-sm font-semibold text-[#FAFAFA]">
                        {section.title}
                      </h2>
                      <div className="mt-2 space-y-2">
                        {section.paragraphs.map((p) => (
                          <p key={p.slice(0, 40)}>{p}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Field label="Full legal name (electronic signature)" htmlFor="ob-signer">
                  <input
                    id="ob-signer"
                    className={marketingFormFieldClasses}
                    value={d.signerName}
                    onChange={(e) => update("signerName", e.target.value)}
                    autoComplete="name"
                    placeholder="Type your full name"
                  />
                </Field>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.1] bg-white/[0.03] p-4">
                  <input
                    type="checkbox"
                    checked={d.agreed}
                    onChange={(e) => update("agreed", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-white/20 accent-violet-500"
                  />
                  <span className="text-sm text-white/80">
                    I have read and agree to the Website &amp; Google Business Profile Services
                    Agreement on behalf of {data.businessName}.
                  </span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">
                  Landing page details
                </p>
                <Field label="Pages / sections you want on the landing page" htmlFor="ob-pages">
                  <textarea
                    id="ob-pages"
                    className={marketingFormTextareaClasses}
                    rows={4}
                    placeholder="e.g. Hero, services list, before/after gallery, testimonials, contact CTA…"
                    value={d.pagesAndSections}
                    onChange={(e) => update("pagesAndSections", e.target.value)}
                  />
                </Field>
                <Field label="Copy, messaging, or tone notes" htmlFor="ob-copy">
                  <textarea
                    id="ob-copy"
                    className={marketingFormTextareaClasses}
                    rows={4}
                    value={d.copyNotes}
                    onChange={(e) => update("copyNotes", e.target.value)}
                  />
                </Field>
                <Field label="Brand colors or style preferences" htmlFor="ob-colors">
                  <input
                    id="ob-colors"
                    className={marketingFormFieldClasses}
                    placeholder="e.g. navy & gold, clean and professional, match existing logo…"
                    value={d.brandColors}
                    onChange={(e) => update("brandColors", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">
                  Domain, hosting &amp; social
                </p>
                <Field label="Domain & hosting (existing or needed)" htmlFor="ob-domain">
                  <textarea
                    id="ob-domain"
                    className={marketingFormTextareaClasses}
                    rows={3}
                    placeholder="Domain registrar, hosting login, or whether you need us to set these up…"
                    value={d.domainHosting}
                    onChange={(e) => update("domainHosting", e.target.value)}
                  />
                </Field>
                <Field label="Social media links" htmlFor="ob-social">
                  <textarea
                    id="ob-social"
                    className={marketingFormTextareaClasses}
                    rows={3}
                    placeholder="Facebook, Instagram, LinkedIn URLs…"
                    value={d.socialLinks}
                    onChange={(e) => update("socialLinks", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Upload assets</p>
                <UploadBlock
                  label="Logo files"
                  urls={logoUrls}
                  onRemove={(url) => setLogoUrls((prev) => prev.filter((u) => u !== url))}
                  onSelect={(file) => void uploadFile(file, "logo")}
                  uploading={uploading}
                  accept="image/*"
                />
                <UploadBlock
                  label="Photos & images for the site / Google profile"
                  urls={imageUrls}
                  onRemove={(url) => setImageUrls((prev) => prev.filter((u) => u !== url))}
                  onSelect={(file) => void uploadFile(file, "image")}
                  uploading={uploading}
                  accept="image/*"
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.16em] text-violet-300/85">Review & submit</p>
                <ReviewRow label="Signed by" value={d.signerName} />
                <ReviewRow label="Business" value={data.businessName} />
                <ReviewRow label="Invoice email" value={data.email} />
                <ReviewRow
                  label="Project total"
                  value={money(getOnboardingTotal(data.lineItems))}
                />
                <ReviewRow label="Logos uploaded" value={String(logoUrls.length)} />
                <ReviewRow label="Images uploaded" value={String(imageUrls.length)} />
                <p className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                  After you submit, New Legacy AI will review your details and email a Stripe
                  invoice to {data.email}. Payment is due in full before work begins.
                </p>
              </div>
            )}
          </div>
        </div>

        {stepError ? <p className="mt-3 text-sm text-rose-400">{stepError}</p> : null}
        {errMsg ? <p className="mt-3 text-sm text-red-400">{errMsg}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                disabled={!canNext || status === "submitting" || uploading}
                onClick={() => canNext && setStep((s) => s + 1)}
              >
                Continue
              </NeonButton>
            ) : (
              <NeonButton
                type="button"
                variant="solid"
                size="lg"
                disabled={status === "submitting" || preview}
                onClick={() => void submit()}
              >
                {preview ? "Submit disabled (preview)" : status === "submitting" ? "Submitting…" : "Submit & finish"}
              </NeonButton>
            )}
          </div>
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <Footer basePath="/" />
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.06] py-2">
      <span className="text-white/50">{label}</span>
      <span className="text-right text-[#FAFAFA]">{value || "—"}</span>
    </div>
  );
}

function UploadBlock({
  label,
  urls,
  onRemove,
  onSelect,
  uploading,
  accept,
}: {
  label: string;
  urls: string[];
  onRemove: (url: string) => void;
  onSelect: (file: File) => void;
  uploading: boolean;
  accept: string;
}) {
  return (
    <div className="space-y-3">
      <Label className={marketingFormLabelClasses}>{label}</Label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-8 transition-colors hover:border-violet-400/40 hover:bg-white/[0.05]">
        <Upload className="h-6 w-6 text-violet-300/80" aria-hidden />
        <span className="text-sm text-white/70">
          {uploading ? "Uploading…" : "Click to upload images (max 10 MB each)"}
        </span>
        <input
          type="file"
          accept={accept}
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onSelect(file);
            e.target.value = "";
          }}
        />
      </label>
      {urls.length > 0 ? (
        <ul className="space-y-2">
          {urls.map((url) => (
            <li
              key={url}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-white/70"
            >
              <a href={url} target="_blank" rel="noreferrer" className="truncate hover:text-violet-300">
                {url.split("/").pop()}
              </a>
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="shrink-0 text-white/40 hover:text-rose-400"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
