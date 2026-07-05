import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { CheckoutPageClient } from "@/features/order_management_system/checkout/components/storefront/checkout-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title") };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const cartId = cookieStore.get("ls_cart_id")?.value ?? null;

  return <CheckoutPageClient cartId={cartId} locale={locale} />;
}
