"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useLeadCapture } from "@/components/marketing/LeadCaptureProvider";
import { MARKETING_NAV_ENTRIES, resolveMarketingNavHref } from "@/lib/marketing-nav";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return !!el.closest(
    'input, textarea, select, [contenteditable="true"], [role="textbox"]'
  );
}

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
    if (isMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (isTypingTarget(e.target)) return;
      e.preventDefault();
      setOpen((o) => !o);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile]);

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
          <span className="marketing-side-nav-vertical-text">MENU</span>
        </button>
      </div>

      {open && isMobile && (
        <button
          type="button"
          className="marketing-side-nav-mobile-close"
          aria-label="Close menu"
          onClick={close}
        >
          <X className="h-6 w-6" strokeWidth={2} />
        </button>
      )}

      {open && (
        <button
          type="button"
          className="marketing-side-nav-backdrop"
          aria-label="Close menu"
          onClick={close}
        />
      )}

      <div
        id="marketing-side-nav-panel"
        className={`marketing-side-nav-panel ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <a href="/" className="marketing-side-nav-wordmark" onClick={close}>
          <span className="font-heading font-bold text-lg leading-tight tracking-[0.06em] text-foreground block">
            NEW LEGACY AI
          </span>
        </a>
        <nav className="marketing-side-nav-links">
          {MARKETING_NAV_ENTRIES.map((entry) => {
            if (entry.kind === "lead") {
              return (
                <button
                  key={entry.id}
                  type="button"
                  className="marketing-side-nav-link marketing-side-nav-cta-secondary"
                  onClick={() => {
                    close();
                    openLeadForm();
                  }}
                >
                  {entry.label}
                </button>
              );
            }
            if (entry.kind === "calendly") {
              return (
                <a
                  key={entry.id}
                  href={BOOK_CONSULTATION_PATH}
                  className="marketing-side-nav-link marketing-side-nav-cta-solid"
                  onClick={close}
                >
                  {entry.label}
                </a>
              );
            }
            const href = resolveMarketingNavHref(pathname, entry);
            if (!href) return null;
            const isSignIn = entry.id === "sign-in";
            return (
              <a
                key={entry.id}
                href={href}
                className={`marketing-side-nav-link ${
                  isSignIn
                    ? "marketing-side-nav-signin"
                    : entry.isGradient
                      ? "gradient-text-highlight"
                      : ""
                }`}
                onClick={close}
                {...(entry.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {entry.label}
              </a>
            );
          })}
        </nav>
        {!isMobile ? (
          <p className="marketing-side-nav-hint text-[10px] uppercase tracking-[0.2em] text-muted opacity-50 mt-8">
            Space to toggle
          </p>
        ) : null}
      </div>
    </>
  );
}
