import { getTranslations } from "next-intl/server";
import { CustomerSupportPageClient } from "@/features/order_management_system/customers/operations/components/customer-support-page-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return { title: t("title") };
}

export default function SupportPage() {
  return <CustomerSupportPageClient />;
}
