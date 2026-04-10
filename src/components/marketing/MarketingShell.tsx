"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LeadCaptureProvider } from "@/components/marketing/LeadCaptureProvider";
import MarketingSideNav from "@/components/marketing/MarketingSideNav";

const MarketingGalaxyBackdrop = dynamic(
  () => import("@/components/marketing/MarketingGalaxyBackdrop"),
  { ssr: false }
);

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";

  return (
    <LeadCaptureProvider>
      <MarketingSideNav />
      {!isHome && <MarketingGalaxyBackdrop />}
      {children}
    </LeadCaptureProvider>
  );
}
