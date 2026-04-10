import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRM & automations intake",
  description:
    "Share how your business runs today and what you want automated — we’ll map CRM, workflows, and integrations.",
};

export default function CrmIntakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
