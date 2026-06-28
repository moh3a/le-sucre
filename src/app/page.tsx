import { getTranslations } from "next-intl/server";

export const metadata = { title: "Accueil" };

export default async function Home() {
  const t = await getTranslations("home");
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="text-lg">{t("subtitle")}</p>
    </div>
  );
}
