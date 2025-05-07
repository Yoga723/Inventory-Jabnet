import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // disableStaticImages: true,
    // unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
