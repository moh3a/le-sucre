import { getTranslations } from "next-intl/server";
import { DashboardPageClient } from "@/features/customer_dashboard/components/dashboard-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title") };
}

export default function AccountDashboardPage() {
  return <DashboardPageClient />;
}
