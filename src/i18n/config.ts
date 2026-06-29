export const locales = ["fr", "en", "ar"] as const;
export type AppLocale = (typeof locales)[number];
export const default_locale: AppLocale = "fr";
