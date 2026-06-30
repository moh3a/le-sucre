import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") ?? "";

  const supported = ["fr", "ar", "en"] as const;

  const preferred = acceptLanguage
    .split(",")
    .map((entry) => {
      const [locale, q = "q=1"] = entry.trim().split(";");
      const quality = parseFloat(q.replace("q=", "")) || 1;
      return { locale: locale.split("-")[0].toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality)
    .find(({ locale }) => (supported as readonly string[]).includes(locale));

  redirect(`/${preferred?.locale ?? "en"}`);
}
