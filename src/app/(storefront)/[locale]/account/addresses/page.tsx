import { getTranslations } from "next-intl/server";
import { AddressesPageClient } from "@/features/authentication_and_authorization/profile/components/addresses-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("addresses_title") };
}

export default function AddressesPage() {
  return <AddressesPageClient />;
}
