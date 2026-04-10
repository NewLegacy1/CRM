"use client";

import Link from "next/link";
import { BOOK_CONSULTATION_PATH } from "@/lib/links";

export default function Footer({ basePath }: { basePath?: string }) {
  const homeHref = basePath ? "/#home" : "#home";
  const servicesHref = basePath ? "/#services" : "#services";
  const industriesHref = "/industries";
  const caseStudiesHref = "/case-studies";
  const useLink = !!basePath;

  function navLink(href: string, label: string) {
    const cls = "text-muted hover:text-accent transition-colors";
    if (useLink || href.startsWith("/"))
      return (
        <Link href={href} className={cls}>
          {label}
        </Link>
      );
    return (
      <a href={href} className={cls}>
        {label}
      </a>
    );
  }

  return (
    <footer className="relative border-t border-white/[0.06] px-4 py-14 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold tracking-tight">
            NEW LEGACY
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">
            Custom websites, CRMs + automations, and growth operations — built
            to keep your business scalable and easy to run.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            Navigation
          </h4>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>{navLink(homeHref, "Home")}</li>
            <li>{navLink(servicesHref, "Services")}</li>
            <li>{navLink(industriesHref, "Industries")}</li>
            <li>
              <Link
                href={caseStudiesHref}
                className="text-muted hover:text-accent transition-colors"
              >
                Case studies
              </Link>
            </li>
            <li>
              <Link
                href={BOOK_CONSULTATION_PATH}
                className="text-muted hover:text-accent transition-colors"
              >
                Book consultation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            Contact
          </h4>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a
                href="mailto:contact@newlegacyai.ca"
                className="text-muted hover:text-accent transition-colors"
              >
                contact@newlegacyai.ca
              </a>
            </li>
            <li>
              <a
                href="tel:+19059754877"
                className="text-muted hover:text-accent transition-colors"
              >
                905-975-4877
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/[0.06] pt-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} New Legacy AI. All rights reserved.
      </div>
    </footer>
  );
}
