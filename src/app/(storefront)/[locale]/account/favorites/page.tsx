import { getTranslations } from "next-intl/server";
import { CustomerFavoritesPageClient } from "@/features/wishlist_management_system/components/customer-favorites-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "wishlist" });
  return { title: t("my_favorites") };
}

export default function CustomerFavoritesPage() {
  return <CustomerFavoritesPageClient />;
}
