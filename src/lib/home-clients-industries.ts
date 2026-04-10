import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Home,
  LandPlot,
  LineChart,
  Stethoscope,
} from "lucide-react";

export type HomeClientsIndustryItem = {
  name: string;
  /** Matches `IndustryDetail.id` in `industries-data` */
  industryId: string;
  icon: LucideIcon;
};

/**
 * Home “Clients” strip — each pill links to `/industries?i=…` for the matching explorer tab.
 */
export const HOME_CLIENTS_INDUSTRY_ITEMS: HomeClientsIndustryItem[] = [
  { name: "Healthcare", industryId: "dental-medical", icon: Stethoscope },
  { name: "Real Estate", industryId: "professional", icon: Home },
  { name: "Law Firms", industryId: "professional", icon: Briefcase },
  { name: "Home Services", industryId: "home-services", icon: LandPlot },
  { name: "Financial", industryId: "professional", icon: Building2 },
  { name: "Consulting", industryId: "saas", icon: LineChart },
];
