/**
 * Static marketing menu definition. Paths are resolved in the shell using
 * `resolveMarketingNavHref` so hash links work from any marketing route.
 */
export type MarketingNavEntry =
  | {
      id: string;
      kind: "link";
      label: string;
      /** In-page section on home (becomes #id or /#id) */
      hash?: string;
      /** Absolute path within the app */
      path?: string;
      /** Opens in new tab */
      external?: string;
      isGradient?: boolean;
    }
  | {
      id: string;
      kind: "lead";
      label: string;
    }
  | {
      id: string;
      kind: "calendly";
      label: string;
      isGradient?: boolean;
    };

export const MARKETING_NAV_ENTRIES: MarketingNavEntry[] = [
  { id: "services", kind: "link", label: "SERVICES", hash: "services" },
  { id: "case-studies", kind: "link", label: "CASE STUDIES", path: "/case-studies" },
  { id: "industries", kind: "link", label: "INDUSTRIES", path: "/industries" },
  { id: "contact", kind: "lead", label: "CONTACT" },
  { id: "book", kind: "calendly", label: "BOOK A CONSULTATION" },
  { id: "sign-in", kind: "link", label: "SIGN IN", path: "/login", isGradient: true },
];

/** Home pathname — hash-only links are valid here. */
export function isMarketingHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function resolveMarketingNavHref(
  pathname: string,
  entry: MarketingNavEntry
): string | undefined {
  if (entry.kind !== "link") return undefined;
  if (entry.external) return entry.external;
  if (entry.path) return entry.path;
  if (entry.hash) {
    const h = `#${entry.hash}`;
    return isMarketingHomePath(pathname) ? h : `/${h}`;
  }
  return undefined;
}
