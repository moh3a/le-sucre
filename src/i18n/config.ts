import z from "zod";

export const locales = ["fr", "en", "ar"] as const;
export const localesSchema = z.enum(locales);
export type AppLocale = (typeof locales)[number];
export const default_locale: AppLocale = "fr";
