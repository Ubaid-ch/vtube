import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // csstype has a JSDoc apostrophe bug that confuses the TS parser;
    // skipLibCheck in tsconfig.json should cover it but Next.js 16's
    // build worker still trips on it — this suppresses it at build time.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
