"use client";

import { useEffect } from "react";
import Hero from "@/components/marketing/Hero";
import ServicesScroll from "@/components/marketing/ServicesScroll";
import Clients from "@/components/marketing/Clients";
import WhyUs from "@/components/marketing/WhyUs";
import CaseStudies from "@/components/marketing/CaseStudies";
import StartNow from "@/components/marketing/StartNow";
import Footer from "@/components/marketing/Footer";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

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
    <div className="marketing-page-bg min-h-screen text-[var(--pure-white)]">
      <Hero />
      <ContainerScroll>
        <ServicesScroll />
      </ContainerScroll>
      <ContainerScroll>
        <Clients />
      </ContainerScroll>
      <ContainerScroll>
        <WhyUs />
      </ContainerScroll>
      <ContainerScroll>
        <CaseStudies />
      </ContainerScroll>
      <ContainerScroll>
        <StartNow />
      </ContainerScroll>
      <Footer />
    </div>
  );
}
