import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: {
    default: "New Legacy AI | Websites, Google & Custom Software That Win You Business",
    template: "%s | New Legacy AI",
  },
  description:
    "Remote across Canada & the US. Local growth systems — Google Business Profile, websites, lead capture — for owner-operators, and custom software for growing firms.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingShell>{children}</MarketingShell>;
}
