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
  async headers() {
    return [
      {
        // Everything except /embed/* refuses to be framed
        source: "/((?!embed/).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        // Embeds are explicitly frameable anywhere
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
