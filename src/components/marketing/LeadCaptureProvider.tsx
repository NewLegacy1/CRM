"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadSchema,
  LEAD_SERVICE_OPTIONS,
  type LeadInput,
} from "@/lib/validators/lead";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { NeonButton } from "@/components/ui/neon-button";
import {
  marketingFormFieldClasses,
  marketingFormLabelClasses,
  marketingFormTextareaClasses,
} from "@/lib/marketing-form-classes";
import { cn } from "@/lib/utils";

export type OpenLeadFormOptions = {
  preselectServices?: string[];
  prefillMessage?: string;
};

type LeadCaptureCtx = {
  openLeadForm: (options?: OpenLeadFormOptions) => void;
};

const LeadCaptureContext = React.createContext<LeadCaptureCtx | null>(null);

export function useLeadCapture() {
  const ctx = React.useContext(LeadCaptureContext);
  if (!ctx)
    throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  return ctx;
}

const SUCCESS_AUTO_DISMISS_MS = 3200;

export function LeadCaptureProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);
  const [successName, setSuccessName] = React.useState<string | null>(null);
  const openRef = React.useRef(open);
  const scrollYBeforeOpen = React.useRef(0);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const form = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      phone: "",
      websiteUrl: "",
      servicesInterested: [],
      message: "",
      preferredContact: "email",
      sourcePath: pathname,
    },
  });

  const handleOpenChange = React.useCallback((next: boolean) => {
    if (openRef.current && !next && typeof window !== "undefined") {
      const y = scrollYBeforeOpen.current;
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0, behavior: "auto" });
      });
    }
    setOpen(next);
    if (!next) {
      setSubmissionSuccess(false);
      setSuccessName(null);
      setFeedback(null);
    }
  }, []);

  const openLeadForm = React.useCallback(
    (options?: OpenLeadFormOptions) => {
      setFeedback(null);
      setSubmissionSuccess(false);
      setSuccessName(null);
      if (typeof window !== "undefined") {
        scrollYBeforeOpen.current = window.scrollY;
      }
      form.reset({
        name: "",
        businessName: "",
        email: "",
        phone: "",
        websiteUrl: "",
        servicesInterested: options?.preselectServices ?? [],
        message: options?.prefillMessage ?? "",
        preferredContact: "email",
        sourcePath: pathname,
      });
      setOpen(true);
    },
    [form, pathname]
  );

  React.useEffect(() => {
    if (!submissionSuccess || !open) return;
    const id = window.setTimeout(() => handleOpenChange(false), SUCCESS_AUTO_DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [submissionSuccess, open, handleOpenChange]);

  async function onSubmit(data: LeadInput) {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sourcePath: pathname }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setFeedback(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      const first = data.name.trim().split(/\s+/)[0]?.trim() ?? "";
      setSuccessName(first.length > 0 ? first : null);
      setSubmissionSuccess(true);
      form.reset();
    } catch {
      setFeedback("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const watchedServices = form.watch("servicesInterested");
  const preferredContact = form.watch("preferredContact");

  return (
    <LeadCaptureContext.Provider value={{ openLeadForm }}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[min(90dvh,880px)] max-w-xl w-full overflow-y-auto overscroll-contain border-0 bg-transparent p-0 shadow-none [touch-action:pan-y]">
          <div className="relative rounded-[1.25rem] border-galaxy-neon">
            <div className="relative rounded-[calc(1.25rem-1px)] card-galaxy-glass p-6 pt-12 sm:p-8">
              <DialogClose onClick={() => handleOpenChange(false)} />
              {submissionSuccess ? (
                <div className="flex flex-col items-center gap-6 pb-2 pt-2 text-center sm:pt-0">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 ring-1 ring-emerald-400/35"
                    aria-hidden
                  >
                    <CheckCircle2 className="h-9 w-9 text-emerald-400" strokeWidth={1.75} />
                  </div>
                  <div className="mb-4 w-full space-y-3 text-center sm:text-center">
                    <DialogTitle className="font-heading text-xl text-[#FAFAFA] sm:text-2xl">
                      {successName ? (
                        <>
                          Thanks, {successName}!
                        </>
                      ) : (
                        "Thanks — you're all set!"
                      )}
                    </DialogTitle>
                    <p className="text-sm leading-relaxed text-white/70">
                      We&apos;ve received your message and will follow up shortly.
                    </p>
                  </div>
                  <NeonButton
                    type="button"
                    variant="solid"
                    size="lg"
                    className="w-full max-w-sm"
                    onClick={() => handleOpenChange(false)}
                  >
                    Continue browsing
                  </NeonButton>
                  <p className="text-xs text-white/40">
                    This window will close on its own in a few seconds.
                  </p>
                </div>
              ) : (
                <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl text-[#FAFAFA] sm:text-2xl">
                  GET IN <span className="gradient-text-highlight">TOUCH</span>
                </DialogTitle>
                <p className="text-sm leading-relaxed text-white/65">
                  Tell us what you&apos;re building — we&apos;ll follow up shortly.
                </p>
              </DialogHeader>
              <form
                className="mt-6 space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lead-name" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                      Name *
                    </label>
                    <input
                      id="lead-name"
                      className={marketingFormFieldClasses}
                      autoComplete="name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-400">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lead-email" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                      Email *
                    </label>
                    <input
                      id="lead-email"
                      type="email"
                      className={marketingFormFieldClasses}
                      autoComplete="email"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-400">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="lead-biz" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                      Business
                    </label>
                    <input
                      id="lead-biz"
                      className={marketingFormFieldClasses}
                      {...form.register("businessName")}
                    />
                  </div>
                  <div>
                    <label htmlFor="lead-phone" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                      Phone
                    </label>
                    <input
                      id="lead-phone"
                      type="tel"
                      className={marketingFormFieldClasses}
                      autoComplete="tel"
                      {...form.register("phone")}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lead-web" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                    Website
                  </label>
                  <input
                    id="lead-web"
                    type="url"
                    placeholder="https://"
                    className={marketingFormFieldClasses}
                    {...form.register("websiteUrl")}
                  />
                </div>

                <div>
                  <p className={cn(marketingFormLabelClasses, "mb-2")}>Preferred contact</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "email" as const, label: "Email" },
                        { value: "phone" as const, label: "Phone" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setValue("preferredContact", opt.value)}
                        className={cn(
                          "rounded-[0.875rem] border px-4 py-2 text-xs font-heading font-semibold uppercase tracking-[0.12em] transition-colors",
                          preferredContact === opt.value
                            ? "border-violet-400/45 bg-white/[0.12] text-white ring-1 ring-violet-400/35"
                            : "border-white/[0.12] bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.07]"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={cn(marketingFormLabelClasses, "mb-2")}>Interested in</p>
                  <div className="flex flex-wrap gap-2">
                    {LEAD_SERVICE_OPTIONS.map((opt) => {
                      const checked = watchedServices.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            const cur = form.getValues("servicesInterested");
                            if (cur.includes(opt)) {
                              form.setValue(
                                "servicesInterested",
                                cur.filter((s) => s !== opt)
                              );
                            } else {
                              form.setValue("servicesInterested", [...cur, opt]);
                            }
                          }}
                          className={cn(
                            "rounded-[0.875rem] border px-3 py-2 text-left text-xs font-medium leading-snug transition-colors sm:text-[13px]",
                            checked
                              ? "border-violet-400/45 bg-white/[0.1] text-white ring-1 ring-violet-400/35"
                              : "border-white/[0.1] bg-white/[0.03] text-white/75 hover:border-white/18 hover:bg-white/[0.06]"
                          )}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="lead-msg" className={cn(marketingFormLabelClasses, "mb-2 block")}>
                    Message
                  </label>
                  <textarea
                    id="lead-msg"
                    className={marketingFormTextareaClasses}
                    rows={4}
                    {...form.register("message")}
                  />
                </div>

                {feedback ? (
                  <p className="text-sm text-rose-400">{feedback}</p>
                ) : null}

                <NeonButton
                  type="submit"
                  variant="solid"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send message"}
                </NeonButton>
              </form>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </LeadCaptureContext.Provider>
  );
}
