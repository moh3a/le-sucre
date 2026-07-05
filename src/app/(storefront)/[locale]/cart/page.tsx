import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { CartPageClient } from "@/features/order_management_system/carts/components/storefront/cart-page-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return { title: t("title") };
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const cartId = cookieStore.get("ls_cart_id")?.value ?? null;

  return <CartPageClient cartId={cartId} locale={locale} />;
}
