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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export function LeadCaptureProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);

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

  const openLeadForm = React.useCallback((options?: OpenLeadFormOptions) => {
    setFeedback(null);
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
  }, [form, pathname]);

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
      setOpen(false);
      form.reset();
    } catch {
      setFeedback("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LeadCaptureContext.Provider value={{ openLeadForm }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle>Contact New Legacy</DialogTitle>
            <p className="text-sm text-zinc-400">
              Tell us what you&apos;re building — we&apos;ll follow up shortly.
            </p>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Name *</label>
              <Input {...form.register("name")} autoComplete="name" />
              {form.formState.errors.name && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Email *</label>
              <Input
                type="email"
                {...form.register("email")}
                autoComplete="email"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-zinc-400">
                  Business
                </label>
                <Input {...form.register("businessName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Phone</label>
                <Input {...form.register("phone")} autoComplete="tel" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Website</label>
              <Input {...form.register("websiteUrl")} placeholder="https://" />
            </div>
            <div>
              <p className="mb-2 text-xs text-zinc-400">Interested in</p>
              <div className="flex flex-wrap gap-2">
                {LEAD_SERVICE_OPTIONS.map((opt) => {
                  const checked = form.watch("servicesInterested").includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-xs text-zinc-300"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
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
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Message</label>
              <textarea
                className="flex min-h-[88px] w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...form.register("message")}
              />
            </div>
            {feedback && (
              <p className="text-sm text-amber-400">{feedback}</p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </LeadCaptureContext.Provider>
  );
}
