import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow large MP4 uploads via API route / server actions
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
