import { getTranslations } from "next-intl/server";
import { BrandsContent } from "./brands-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brands" });
  return { title: t("title") };
}

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params;
  return <BrandsContent />;
}
