import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output:"export",
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
