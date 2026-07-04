import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartEmptyState } from "@/features/order_management_system/carts/components/storefront/cart-empty-state";
import { CartItemCard } from "@/features/order_management_system/carts/components/storefront/cart-item-card";
import { CartSummary } from "@/features/order_management_system/carts/components/storefront/cart-summary";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/storefront/section-header";

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
  const t = await getTranslations({ locale, namespace: "cart" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* CART HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("items_count", { count: 3, items: t("items") })}
          </p>
        </div>
        <Button variant="outline">{t("clear")}</Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* CART ITEMS LIST */}
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <CartItemCard
              key={i}
              item={{
                id: `item-${i}`,
                product: {
                  id: `prod-${i}`,
                  slug: `product-${i}`,
                  name: t("product_item", { count: i + 1 }),
                  image_url: null,
                  currency: "DZD",
                  min_price: String((i + 1) * 2500),
                  max_price: null,
                  is_featured: false,
                  in_stock: true,
                  brand_name: null,
                },
                quantity: i + 1,
                unit_price: String((i + 1) * 2500),
                line_total: `${(i + 1) * 2500} DZD`,
              }}
            />
          ))}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <CartSummary
          lines={[
            { label: t("subtotal"), value: "7 500 DZD" },
            { label: t("shipping"), value: t("free"), highlight: true },
          ]}
          total="7 500 DZD"
          totalLabel={t("total")}
          ctaLabel={t("checkout")}
          promoCode={{
            placeholder: t("promo_placeholder"),
            applyLabel: t("apply"),
          }}
        />
      </div>

      <Separator className="my-12" />

      {/* SAVE FOR LATER */}
      <section className="space-y-4">
        <SectionHeader title={t("saved_for_later")} />
        <p className="text-muted-foreground">{t("saved_for_later_empty")}</p>
      </section>

      <Separator className="my-12" />

      {/* CROSS-SELL SUGGESTIONS */}
      <section className="space-y-4">
        <SectionHeader title={t("you_might_also_like")} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-3">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">{t("suggested_item", { count: i + 1 })}</p>
              <p className="text-muted-foreground text-sm">1 500 DZD</p>
            </Card>
          ))}
        </div>
      </section>

      {/* EMPTY CART STATE */}
      {false && (
        <CartEmptyState
          title={t("empty_title")}
          description={t("empty_description")}
          ctaLabel={t("continue_shopping")}
        />
      )}
    </div>
  );
}
