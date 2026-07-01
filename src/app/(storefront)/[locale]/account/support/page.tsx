import { getTranslations } from "next-intl/server";
import { CustomerSupportTicketForm } from "@/features/operations_workflows/components/customer-order-tracking";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return { title: t("title") };
}

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("heading")}</h1>
      <CustomerSupportTicketForm />
    </div>
  );
}
