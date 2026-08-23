"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookedJobsForm } from "@/components/marketing/booked-jobs/BookedJobsForm";
import { marketingCtaPrimaryLinkClasses } from "@/lib/marketing-cta-classes";

type FormProps = {
  headlineVariant?: string;
  defaultTrade?: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
};

const BookedJobsFormContext = createContext<{ openForm: () => void } | null>(null);

export function BookedJobsInteract({
  children,
  form,
}: {
  children: ReactNode;
  form: FormProps;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ openForm: () => setOpen(true) }), []);

  return (
    <BookedJobsFormContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[86dvh] max-w-md border-white/[0.08] bg-zinc-950/90">
          <DialogClose onClick={() => setOpen(false)} />
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-[#FAFAFA] sm:text-2xl">
              See where the money is leaving
            </DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-white/60">
            PDF in about five minutes. We call you. No calendar.
          </p>
          <BookedJobsForm
            headlineVariant={form.headlineVariant}
            defaultTrade={form.defaultTrade}
            utm={form.utm}
          />
        </DialogContent>
      </Dialog>
    </BookedJobsFormContext.Provider>
  );
}

export function BookedJobsCta({
  children = "See the leak",
}: {
  children?: ReactNode;
}) {
  const ctx = useContext(BookedJobsFormContext);
  if (!ctx) return null;

  return (
    <button
      type="button"
      onClick={ctx.openForm}
      className={`${marketingCtaPrimaryLinkClasses} w-auto px-6 py-2.5`}
    >
      <span className="neon-cta-line-top" aria-hidden />
      <span className="relative z-[2]">{children}</span>
      <span className="neon-cta-line-bottom" aria-hidden />
    </button>
  );
}

export function BookedJobsStickyBar() {
  const ctx = useContext(BookedJobsFormContext);
  if (!ctx) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#09090b]/90 px-4 py-3 backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={ctx.openForm}
        className={`${marketingCtaPrimaryLinkClasses} w-full py-2.5`}
      >
        <span className="neon-cta-line-top" aria-hidden />
        <span className="relative z-[2]">See the leak</span>
        <span className="neon-cta-line-bottom" aria-hidden />
      </button>
    </div>
  );
}
