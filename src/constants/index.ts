export const APP_NAME = "ORLA";

export const siteConfig = {
  name: APP_NAME,
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description: "Votre expérience e-commerce premium",
  locale: {
    default: "fr" as const,
    supported: ["fr", "en", "ar"] as const,
  },
  pagination: {
    defaultPage: 1,
    defaultPerPage: 20,
    maxPerPage: 100,
  },
  currency: {
    default: "DZD",
    locale: "fr-FR",
  },
  upload: {
    maxSizeMb: 10,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
} as const;

export type SiteConfig = typeof siteConfig;
