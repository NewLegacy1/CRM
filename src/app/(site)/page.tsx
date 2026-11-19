import type { Metadata } from "next";
import { preload } from "react-dom";
import html from "@/components/site/home.html";

export const metadata: Metadata = {
  title: { absolute: "New Legacy | Websites, Custom Software and Practical AI" },
};

export default function HomePage() {
  // The entrance paints these two plates from CSS; preloading stops them arriving after the first frame.
  preload("/site/deep-space.webp", { as: "image", fetchPriority: "high" });
  preload("/site/horizon.webp", { as: "image" });
  // Static, first-party markup generated from the approved design mock (no user input).
  return <div className="nls" dangerouslySetInnerHTML={{ __html: html }} />;
}
