import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CustomerOrderTracking } from "@/features/operations_workflows/components/customer-order-tracking";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });
  return { title: t("my_orders") };
}

export default function OrdersPage() {
  const t = useTranslations("layout");

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{t("my_orders")}</h1>
      <CustomerOrderTracking orderId="sample" />
    </div>
  );
}
