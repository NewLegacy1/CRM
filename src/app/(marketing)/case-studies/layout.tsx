import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | New Legacy AI",
  description:
    "Real builds and outcomes — websites, CRMs, and automation for businesses that move fast.",
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
