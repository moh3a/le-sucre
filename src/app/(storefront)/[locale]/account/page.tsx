import { getTranslations } from "next-intl/server";
import { DashboardPageClient } from "@/features/customer_dashboard/components/dashboard-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title") };
}

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("my_account") }]} />
      <DashboardPageClient />
    </>
  );
}
