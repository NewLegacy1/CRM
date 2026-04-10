import { INDUSTRIES } from "@/lib/industries-data";

/** Query key for deep-linking to an industry tab, e.g. `/industries?i=dental-medical` */
export const INDUSTRY_QUERY_PARAM = "i";

export function getIndustryIndexFromQueryParam(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const normalized = value.trim().toLowerCase();
  const i = INDUSTRIES.findIndex((ind) => ind.id === normalized);
  return i >= 0 ? i : 0;
}

export function getIndustryIdAtIndex(index: number): string {
  const safe = Math.max(0, Math.min(index, INDUSTRIES.length - 1));
  return INDUSTRIES[safe]!.id;
}
