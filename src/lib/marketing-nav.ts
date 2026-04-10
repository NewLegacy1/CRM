import { BOOK_CONSULTATION_PATH } from "@/lib/links";

export type MarketingNavEntry =
  | {
      id: string;
      kind: "link";
      label: string;
      hash?: string;
      path?: string;
      external?: string;
      isGradient?: boolean;
    }
  | { id: string; kind: "lead"; label: string };

export const MARKETING_NAV_ENTRIES: MarketingNavEntry[] = [
  { id: "services", kind: "link", label: "SERVICES", hash: "services" },
  { id: "work", kind: "link", label: "CASE STUDIES", path: "/case-studies" },
  { id: "industries", kind: "link", label: "INDUSTRIES", path: "/industries" },
  { id: "about", kind: "link", label: "ABOUT", hash: "why-us" },
  { id: "sign-in", kind: "link", label: "SIGN IN", path: "/login" },
  { id: "contact", kind: "lead", label: "CONTACT" },
  {
    id: "book",
    kind: "link",
    label: "BOOK A CONSULT",
    path: BOOK_CONSULTATION_PATH,
  },
];

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
