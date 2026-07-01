import { getTranslations } from "next-intl/server";
import { CustomerCollectionsPageClient } from "@/features/wishlist_management_system/components/customer-collections-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("my_collections") };
}

export default function CustomerCollectionsPage() {
  return <CustomerCollectionsPageClient />;
}
