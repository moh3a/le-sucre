"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/storefront/section-header";
import { CartItemCard } from "./cart-item-card";
import { CartSummary } from "./cart-summary";
import { CartEmptyState } from "./cart-empty-state";
import { CartPageSkeleton } from "./cart-page-skeleton";

interface CartPageClientProps {
  cartId: string | null;
  locale: string;
}

export function CartPageClient({ cartId, locale }: CartPageClientProps) {
  const t = useTranslations("cart");
  const router = useRouter();
  const utils = trpc.useUtils();

  const cartQuery = trpc.cart.getCart.useQuery(
    { cart_id: cartId ?? "", locale },
    { enabled: !!cartId },
  );
  const updateMut = trpc.cart.updateItem.useMutation({
    onSuccess: () => cartQuery.refetch(),
  });
  const removeMut = trpc.cart.removeItem.useMutation({
    onSuccess: () => cartQuery.refetch(),
  });
  const savedQuery = trpc.wishlistManagement.saveForLater.list.useQuery(
    { page: 1, limit: 50 },
  );
  const trendingQuery = trpc.recommendations.trending.useQuery({
    locale: locale as "fr" | "en" | "ar",
    period: "day",
    limit: 8,
  });

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_label: string;
    discount_amount: number;
  } | null>(null);
  const applyPromo = trpc.promotions.validateCode.useMutation({
    onSuccess: (data: any) => {
      if (data) {
        setAppliedPromo({
          code: promoCode,
          discount_label: data.discount_label ?? "Réduction",
          discount_amount: Number(data.discount_amount ?? 0),
        });
      }
    },
  });

  const items = cartQuery.data?.items ?? [];
  const subtotal = Number(cartQuery.data?.subtotal ?? 0);
  const currency = cartQuery.data?.currency ?? "DZD";
  const shipping = subtotal > 0 ? 0 : 0;
  const discount = appliedPromo?.discount_amount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);

  function formatPrice(amount: number) {
    return `${amount.toLocaleString()} ${currency}`;
  }

  async function handleQuantityChange(itemId: string, quantity: number) {
    if (!cartId) return;
    updateMut.mutate({ cart_id: cartId, item_id: itemId, quantity });
  }

  async function handleRemove(itemId: string) {
    if (!cartId) return;
    removeMut.mutate({ cart_id: cartId, item_id: itemId });
  }

  function handleApplyPromo() {
    if (!promoCode.trim() || items.length === 0) return;
    applyPromo.mutate({
      code: promoCode.trim(),
      lines: items.map((i) => ({
        product_id: i.product_id,
        sku_id: i.sku_id,
        quantity: i.quantity,
        unit_price: String(i.unit_price),
        line_total: String(i.line_total),
      })),
      shipping_cost: shipping,
    });
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  const hasItems = cartId && items.length > 0;
  const showSaved = (savedQuery.data?.items?.length ?? 0) > 0;
  const showRecommendations = trendingQuery.data && trendingQuery.data.length > 0;

  return (
    <QueryGuard
      query={{ isLoading: cartQuery.isLoading, error: cartQuery.error }}
      loadingFallback={<CartPageSkeleton />}
    >
      <div className="mx-auto container px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground">
              {t("items_count", { count: items.length, items: t("items") })}
            </p>
          </div>
        </div>

        {!hasItems ? (
          <CartEmptyState
            title={t("empty_title")}
            description={t("empty_description")}
            ctaLabel={t("continue_shopping")}
            ctaHref="/boutique"
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={{
                    id: item.id,
                    product: {
                      id: item.product_id,
                      slug: item.sku_id,
                      name: item.product_name,
                      image_url: null,
                      currency: item.currency,
                      min_price: item.unit_price,
                      max_price: null,
                      is_featured: false,
                      in_stock: true,
                      brand_name: null,
                    },
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    line_total: formatPrice(Number(item.line_total)),
                  }}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div>
              <CartSummary
                lines={[
                  { label: t("subtotal"), value: formatPrice(subtotal) },
                  ...(discount > 0
                    ? [{ label: appliedPromo!.discount_label, value: `-${formatPrice(discount)}`, highlight: true as const }]
                    : []),
                  { label: t("shipping"), value: t("free"), highlight: true },
                ]}
                total={formatPrice(total)}
                totalLabel={t("total")}
                ctaLabel={t("checkout")}
                onCta={handleCheckout}
                promoCode={{
                  placeholder: t("promo_placeholder"),
                  applyLabel: t("apply"),
                  onApply: handleApplyPromo,
                  isLoading: applyPromo.isPending,
                }}
              />
              {applyPromo.error && (
                <p className="mt-2 text-xs text-destructive">
                  {applyPromo.error.message}
                </p>
              )}
            </div>
          </div>
        )}

        {showSaved && (
          <>
            <Separator className="my-12" />
            <section className="space-y-4">
              <SectionHeader title={t("saved_for_later")} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedQuery.data?.items?.slice(0, 6).map((item: any) => (
                  <Card key={item.id} className="flex items-center gap-3 p-3">
                    <div className="bg-muted size-14 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {item.product?.name ?? item.product_id}
                      </p>
                      <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {showRecommendations && (
          <>
            <Separator className="my-12" />
            <section className="space-y-4">
              <SectionHeader title={t("you_might_also_like")} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {trendingQuery.data?.slice(0, 8).map((product: any) => (
                  <Card key={product.id} className="space-y-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/p/${product.slug}`)}>
                    <div className="bg-muted aspect-square w-full rounded-md" />
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {Number(product.min_price).toLocaleString()} {product.currency ?? "DZD"}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </QueryGuard>
  );
}
