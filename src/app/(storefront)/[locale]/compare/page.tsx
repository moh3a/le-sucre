import { getTranslations } from "next-intl/server";
import { ComparePageClient } from "./compare-page-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slugs?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "compare" });
  return { title: t("title") };
}

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const initialSlugs = sp.slugs?.split(",").filter(Boolean) ?? [];

  return (
    <ComparePageClient
      initialSlugs={initialSlugs}
      locale={locale as "fr" | "en" | "ar"}
    />
  );
}
