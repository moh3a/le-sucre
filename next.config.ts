import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const with_next_intl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
};

export default with_next_intl(nextConfig);
