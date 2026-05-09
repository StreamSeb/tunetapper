import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tools-key-analyzer",
        destination: "/tools/key-analyzer",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
