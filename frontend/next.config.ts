import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output:"export",
  experimental: {
    serverActions: {
      allowedOrigins: [
        "https://inventory.jabnet.id",
        "http://inventory.jabnet.id",
        "103.194.47.162",
        "localhost:3000",
        "172.16.86.29",
      ],
    },
  },
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
