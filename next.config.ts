import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const with_next_intl = createNextIntlPlugin("./src/i18n/request.ts");

function generate_csp(): string {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https: http://localhost:* ws://localhost:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "media-src 'self' https:",
    "manifest-src 'self'",
  ];
  return policies.join("; ");
}

const security_headers = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Content-Security-Policy", value: generate_csp() },
  { key: "X-Content-Security-Policy", value: generate_csp() },
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
  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) ?? ["localhost:3000"],
    },
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  serverExternalPackages: ["winston", "winston-daily-rotate-file", "sharp"],
};

export default with_next_intl(nextConfig);
