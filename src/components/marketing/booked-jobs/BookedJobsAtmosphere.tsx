"use client";

import dynamic from "next/dynamic";

const MarketingGalaxyBackdrop = dynamic(
  () => import("@/components/marketing/MarketingGalaxyBackdrop"),
  { ssr: false }
);

export function BookedJobsAtmosphere() {
  return (
    <>
      <div className="marketing-subpage-atmosphere" aria-hidden />
      <MarketingGalaxyBackdrop />
    </>
  );
}
