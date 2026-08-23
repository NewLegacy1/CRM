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
  const isAdsLp = pathname.startsWith("/booked-jobs");

  return (
    <LeadCaptureProvider>
      {!isAdsLp ? <MarketingSideNav /> : null}
      {!isHome && !isAdsLp ? (
        <>
          <div className="marketing-subpage-atmosphere" aria-hidden />
          <MarketingGalaxyBackdrop />
        </>
      ) : null}
      {children}
    </LeadCaptureProvider>
  );
}
