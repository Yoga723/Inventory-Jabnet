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
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*", // Match all requests to /api/...
  //       destination: "https://inventory.jabnet.id/api/:path*", // And forward them to your backend
  //     },
  //   ];
  // },
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
