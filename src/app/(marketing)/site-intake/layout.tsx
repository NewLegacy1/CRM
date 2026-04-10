import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website intake",
  description:
    "Tell us about your website project — goals, timeline, and how you work — so we can scope the right build.",
};

export default function SiteIntakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
