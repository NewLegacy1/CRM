"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useLeadCapture } from "@/components/marketing/LeadCaptureProvider";
import {
  MARKETING_NAV_ENTRIES,
  resolveMarketingNavHref,
} from "@/lib/marketing-nav";

const MOBILE_NAV_MQ = "(max-width: 767px)";

function useMarketingMobileNav(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_NAV_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export default function MarketingSideNav() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const isMobile = useMarketingMobileNav();
  const { openLeadForm } = useLeadCapture();
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, close]);

  return (
    <>
      <div
        className={`marketing-side-nav-rail ${open && isMobile ? "marketing-side-nav-rail--trigger-hidden" : ""}`}
        aria-hidden={open && isMobile}
      >
        <button
          type="button"
          className="marketing-side-nav-trigger"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="marketing-side-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          <span className="marketing-side-nav-burger" aria-hidden>
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="marketing-side-nav-panel"
          className="marketing-side-nav-panel"
          role="dialog"
          aria-modal="true"
        >
          <div className="marketing-side-nav-panel-inner">
            <button
              type="button"
              className="marketing-side-nav-close"
              onClick={close}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {MARKETING_NAV_ENTRIES.map((entry) => {
              if (entry.kind === "lead") {
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className="marketing-side-nav-link text-left"
                    onClick={() => {
                      openLeadForm();
                      close();
                    }}
                  >
                    {entry.label}
                  </button>
                );
              }
              const href = resolveMarketingNavHref(pathname, entry);
              if (!href) return null;
              if (entry.path && href.startsWith("/")) {
                return (
                  <Link
                    key={entry.id}
                    href={href}
                    className="marketing-side-nav-link"
                    onClick={close}
                  >
                    {entry.label}
                  </Link>
                );
              }
              return (
                <a
                  key={entry.id}
                  href={href}
                  className="marketing-side-nav-link"
                  onClick={close}
                >
                  {entry.label}
                </a>
              );
            })}
          </div>
          <button
            type="button"
            className="flex-1 cursor-default bg-transparent"
            aria-hidden
            tabIndex={-1}
            onClick={close}
          />
        </div>
      )}
    </>
  );
}
