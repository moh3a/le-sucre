import { getTranslations } from "next-intl/server";
import { SharedCollectionPageClient } from "@/features/wishlist_management_system/components/shared-collection-page-client";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "sharedCollection" });
  return { title: t("title") };
}

export default async function SharedCollectionPage({ params }: Props) {
  const { token } = await params;

  return <SharedCollectionPageClient token={token} />;
}
