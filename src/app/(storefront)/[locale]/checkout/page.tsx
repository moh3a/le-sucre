import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { CheckoutPageClient } from "@/features/order_management_system/checkout/components/storefront/checkout-page-client";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

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
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  const cookieStore = await cookies();
  const cartId = cookieStore.get("ls_cart_id")?.value ?? null;

  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("checkout") }]} />
      <CheckoutPageClient cartId={cartId} locale={locale} />
    </>
  );
}
