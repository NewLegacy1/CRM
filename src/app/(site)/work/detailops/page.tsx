import type { Metadata } from "next";
import html from "@/components/site/case-detailops.html";

export const metadata: Metadata = {
  title: "DetailOps case study",
  description:
    "Booking and operations software that took auto detailers from DMs and phone tag to a full, paid-up calendar.",
};

export default function DetailOpsCaseStudy() {
  // Static, first-party markup generated from the approved design mock (no user input).
  return <div className="nls" dangerouslySetInnerHTML={{ __html: html }} />;
}
