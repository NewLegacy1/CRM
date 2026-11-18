import type { Metadata } from "next";
import html from "@/components/site/home.html";

export const metadata: Metadata = {
  title: { absolute: "New Legacy | Websites, Custom Software and Practical AI" },
};

export default function HomePage() {
  // Static, first-party markup generated from the approved design mock (no user input).
  return <div className="nls" dangerouslySetInnerHTML={{ __html: html }} />;
}
