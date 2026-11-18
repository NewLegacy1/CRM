import type { Metadata } from "next";
import { Funnel_Display, Geist, Manrope } from "next/font/google";
import Script from "next/script";
import "@/components/site/site.css";

const funnel = Funnel_Display({ subsets: ["latin"], variable: "--font-funnel" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: {
    default: "New Legacy | Websites, Custom Software and Practical AI",
    template: "%s | New Legacy",
  },
  description:
    "New Legacy designs and builds booking systems, storefronts, internal tools and practical AI around how your business works.",
};

/**
 * The marketing site's own shell: no MarketingShell, its own fonts and styles.
 * Pages render static markup; /site/site.js adds the motion and interactions after load.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`nls-root ${funnel.variable} ${geist.variable} ${manrope.variable}`} style={{ display: "contents" }}>
      {children}
      <Script src="/site/site.js" strategy="afterInteractive" />
    </div>
  );
}
