import { getTranslations } from "next-intl/server";
import { product_service } from "@/features/product_information_management/products/services/product.service";
import { ProductDetailClient } from "./product-detail-client";
import { AppLocale } from "@/i18n/config";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";

type Props = {
  params: Promise<{ locale: string; product_slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, product_slug } = await params;
  try {
    const { product, translation } = await product_service.get_by_slug(product_slug, locale);
    return {
      title: translation?.name ?? product.sku,
      description: translation?.description ?? undefined,
    };
  } catch {
    const t = await getTranslations({ locale, namespace: "product_detail" });
    return { title: t("title") };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, product_slug } = await params;
  const tBc = await getTranslations({ locale, namespace: "breadcrumb" });
  return (
    <>
      <StorefrontBreadcrumbs items={[{ label: tBc("home"), href: "/" }, { label: tBc("detail") }]} />
      <ProductDetailClient slug={product_slug} locale={locale as AppLocale} />
    </>
  );
}
