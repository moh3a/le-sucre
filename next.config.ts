import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const with_next_intl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/media/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
  },
};

export default with_next_intl(nextConfig);
