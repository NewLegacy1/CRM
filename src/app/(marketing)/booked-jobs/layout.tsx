import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookedJobsAtmosphere } from "@/components/marketing/booked-jobs/BookedJobsAtmosphere";
import "@/app/booked-jobs.css";

export const metadata: Metadata = {
  title: "See where you’re losing jobs on Google",
  description:
    "Ontario HVAC, plumbers, electricians, and roofers. A 14-day Google + missed-call system. We get the lead to you. You close.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function BookedJobsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BookedJobsAtmosphere />
      {children}
    </>
  );
}
