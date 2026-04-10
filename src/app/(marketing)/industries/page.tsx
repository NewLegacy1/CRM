import type { Metadata } from "next";
import IndustriesExplorer from "@/components/marketing/IndustriesExplorer";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Industries | New Legacy AI",
  description:
    "See how we build websites, automation, and AI for restaurants, practices, trades, home services, automotive, professional firms, and SaaS.",
};

export default function IndustriesPage() {
  return (
    <div className="relative z-10 min-h-screen text-foreground pt-16 md:pt-20 pb-12">
      <IndustriesExplorer />

      <div className="mt-24 md:mt-28">
        <Footer basePath="/" />
      </div>
    </div>
  );
}
