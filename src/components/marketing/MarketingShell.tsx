"use client";

import { usePathname } from "next/navigation";
import { LeadCaptureProvider } from "@/components/marketing/LeadCaptureProvider";
import MarketingSideNav from "@/components/marketing/MarketingSideNav";
import { isMarketingHomePath } from "@/lib/marketing-nav";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const showBackdrop = !isMarketingHomePath(pathname);

  return (
    <LeadCaptureProvider>
      {showBackdrop ? (
        <div className="marketing-galaxy-placeholder" aria-hidden />
      ) : null}
      <MarketingSideNav />
      <div className="relative z-[1] min-h-0">{children}</div>
    </LeadCaptureProvider>
  );
}
