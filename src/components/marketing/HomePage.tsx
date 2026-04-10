"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import ServicesScroll from "@/components/marketing/ServicesScroll";
import Clients from "@/components/marketing/Clients";
import WhyUs from "@/components/marketing/WhyUs";
import CaseStudies from "@/components/marketing/CaseStudies";
import StartNow from "@/components/marketing/StartNow";
import Footer from "@/components/marketing/Footer";

const HeroSection = dynamic(
  () => import("@/components/marketing/HeroSection"),
  { ssr: false }
);

export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const scrollToHash = () => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return true;
      }
      return false;
    };
    if (!scrollToHash()) {
      const t = setTimeout(() => scrollToHash(), 150);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <div className="min-h-screen text-foreground">
      <HeroSection />
      {/* Stack above fixed .hero-canvas (z-0) so headings/body below the hero stay visible */}
      <div className="relative z-10">
        <ServicesScroll />
        <Clients />
        <WhyUs />
        <CaseStudies />
        <StartNow />
        <Footer />
      </div>
    </div>
  );
}
