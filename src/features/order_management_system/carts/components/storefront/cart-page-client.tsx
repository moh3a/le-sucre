"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useUndoAction } from "@/hooks/use-undo-action";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Card } from "@/components/ui/card";
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
  const { execute_with_undo } = useUndoAction();

  const cartQuery = trpc.cart.getCart.useQuery(
    { cart_id: cartId ?? "", locale },
    { enabled: !!cartId },
  );
  const updateMut = trpc.cart.updateItem.useMutation({
    onSuccess: () => {
      utils.cart.getCart.invalidate();
      toast.success(t("item_updated"));
    },
  });
  const removeMut = trpc.cart.removeItem.useMutation();
  const savedQuery = trpc.wishlistManagement.saveForLater.list.useQuery({ page: 1, limit: 50 });
  const trendingQuery = trpc.recommendations.trending.useQuery({
    locale: locale as "fr" | "en" | "ar",
    period: "day",
    limit: 8,
  });

  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_label: string;
    discount_amount: number;
  } | null>(null);
  const applyPromo = trpc.promotions.validateCode.useMutation({
    onSuccess: (data) => {
      if (!data) return;
      const discount = (data as { applied?: Array<{ label: string; amount: number }> })
        .applied?.[0];
      setAppliedPromo({
        code: "",
        discount_label: discount?.label ?? "Réduction",
        discount_amount: Number(discount?.amount ?? 0),
      });
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

  function handleRemove(itemId: string) {
    if (!cartId) return;
    const item = items.find((i) => i.id === itemId);
    execute_with_undo({
      description: item?.product_name ?? "Article",
      execute: async () => {
        await removeMut.mutateAsync({ cart_id: cartId, item_id: itemId });
        await utils.cart.getCart.invalidate();
      },
      rollback: () => {
        utils.cart.getCart.invalidate();
      },
      undoTimeoutMs: 8_000,
    });
  }

  function handleApplyPromo(code: string) {
    if (!code.trim() || items.length === 0) return;
    applyPromo.mutate({
      code: code.trim(),
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
  const savedItems = savedQuery.data?.items ?? [];
  const trendingItems = trendingQuery.data ?? [];
  const showSaved = hasItems && savedItems.length > 0;
  const showRecommendations = hasItems && trendingItems.length > 0;

  return (
    <QueryGuard
      query={{ isLoading: cartQuery.isLoading, error: cartQuery.error }}
      loadingFallback={<CartPageSkeleton />}
    >
      <div className="container mx-auto px-4 py-8">
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
                    ? [
                        {
                          label: appliedPromo!.discount_label,
                          value: `-${formatPrice(discount)}`,
                          highlight: true as const,
                        },
                      ]
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
                <p className="text-destructive mt-2 text-xs">{applyPromo.error.message}</p>
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
                {savedItems.slice(0, 6).map((item) => (
                  <Card key={item.id} className="flex items-center gap-3 p-3">
                    <div className="bg-muted size-14 shrink-0 rounded-md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.product_id}</p>
                      <p className="text-muted-foreground text-xs">Qté: {item.quantity}</p>
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
                {trendingItems.slice(0, 8).map((product) => (
                  <Card
                    key={product.id}
                    className="hover:bg-muted/50 cursor-pointer space-y-2 p-3 transition-colors"
                    onClick={() => router.push(`/p/${product.slug}`)}
                  >
                    <div className="bg-muted aspect-square w-full rounded-md" />
                    <p className="truncate text-sm font-medium">{product.name}</p>
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
