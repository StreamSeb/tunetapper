import type { NextConfig } from "next";

// Hostnames the dev server may be reached on besides localhost - tailnet or LAN
// names, which are machine-specific and so live in .env.local (gitignored) as a
// comma-separated DEV_ORIGINS. Ignored entirely by production builds.
// See docs/local-dev.md for setup.
const devOrigins = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  images: {
    // Product shots for the studio builder, currently unused: rendering is off
    // behind SHOW_PRODUCT_IMAGES in studio-builder-tool.tsx because these are
    // not licensed for prod. Swap for the Awin datafeed CDN once the publisher
    // account is live, then flip the flag.
    remotePatterns: [
      { protocol: "https", hostname: "www.thomann.de", pathname: "/thumb/**" },
    ],
  },
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
