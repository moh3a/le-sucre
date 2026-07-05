import { getTranslations } from "next-intl/server";
import { SettingsPageClient } from "@/features/customer_dashboard/components/settings-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("settings_title") };
}

export default function AccountSettingsPage() {
  return <SettingsPageClient />;
}
