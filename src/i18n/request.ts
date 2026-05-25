import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { default_locale, locales, type AppLocale } from "./config";

export default getRequestConfig(async () => {
  const header_store = await headers();
  const pathname = header_store.get("x-pathname") ?? "";
  const cookie_store = await cookies();
  const cookie_locale = cookie_store.get("locale")?.value as AppLocale | undefined;

  const locale: AppLocale = pathname.startsWith("/console")
    ? "fr"
    : cookie_locale && locales.includes(cookie_locale)
      ? cookie_locale
      : default_locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
