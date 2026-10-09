import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/teams',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
