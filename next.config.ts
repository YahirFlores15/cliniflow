import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.devtunnels.ms",
        "*.up.railway.app",
      ],
    },
  },
};

export default nextConfig;