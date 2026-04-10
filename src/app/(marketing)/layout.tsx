import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: {
    default: "New Legacy AI | Custom AI Agents for Business Automation",
    template: "%s | New Legacy AI",
  },
  description:
    "Custom websites, CRMs + automations, and growth operations — built to keep your business scalable and easy to run.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingShell>{children}</MarketingShell>;
}
