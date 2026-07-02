import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  localeCookie: {
    name: "locale",
    sameSite: "lax",
  },
});
