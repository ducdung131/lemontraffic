import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Allow trusted hosts for Mongoose connection
  serverExternalPackages: ['mongoose'],
};

export default nextConfig;
