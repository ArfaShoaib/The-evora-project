import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vqpwbjnvcrcnfscrzajl.supabase.co",
      },
    ],
  },
};

export default nextConfig;
