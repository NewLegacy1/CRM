import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pages from the previous site design. Their files are kept; visitors are sent to the new site instead.
  // Temporary redirects, so any of these can be brought back by deleting its line.
  async redirects() {
    return [
      { source: "/case-studies", destination: "/#work", permanent: false },
      { source: "/industries", destination: "/", permanent: false },
      { source: "/crm-intake", destination: "/#contact", permanent: false },
      { source: "/site-intake", destination: "/#contact", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "detailops.ca", pathname: "/**" },
      { protocol: "https", hostname: "www.detailops.ca", pathname: "/**" },
      { protocol: "https", hostname: "showroomautocare.ca", pathname: "/**" },
      { protocol: "https", hostname: "www.showroomautocare.ca", pathname: "/**" },
      { protocol: "https", hostname: "jaythatdrainguy.ca", pathname: "/**" },
      { protocol: "https", hostname: "www.jaythatdrainguy.ca", pathname: "/**" },
    ],
  },
};

export default nextConfig;
