"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { LeadCaptureProvider } from "@/components/marketing/LeadCaptureProvider";
import MarketingSideNav from "@/components/marketing/MarketingSideNav";
import { isMarketingHomePath } from "@/lib/marketing-nav";

const MarketingGalaxyBackdrop = dynamic(
  () => import("@/components/marketing/MarketingGalaxyBackdrop"),
  { ssr: false }
);

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const showBackdrop = !isMarketingHomePath(pathname);

  return (
    <LeadCaptureProvider>
      {showBackdrop ? <MarketingGalaxyBackdrop /> : null}
      <MarketingSideNav />
      <div className="relative z-[1] min-h-0">{children}</div>
    </LeadCaptureProvider>
  );
}
