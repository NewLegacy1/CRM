import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
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
