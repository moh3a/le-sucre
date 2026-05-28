import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const with_next_intl = createNextIntlPlugin("./src/i18n/request.ts");

const security_headers = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: security_headers }];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/media/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
};

export default with_next_intl(nextConfig);
