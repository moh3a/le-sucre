"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth/client";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckoutSteps } from "./checkout-steps";
import { CheckoutShippingForm } from "./checkout-shipping-form";
import { CheckoutOptionSelector } from "./checkout-option-selector";
import { CheckoutOrderReview } from "./checkout-order-review";
import { CartSummary } from "@/features/order_management_system/carts/components/storefront/cart-summary";
import { CheckoutPageSkeleton } from "./checkout-page-skeleton";

interface CheckoutPageClientProps {
  cartId: string | null;
  locale: string;
}

const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 1500,
  sameday: 2500,
};

const TAX_RATE = 0.19;

export function CheckoutPageClient({ cartId, locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const router = useRouter();

  const { data: session, isPending: sessionLoading, error: sessionError } = authClient.useSession();
  const isLoggedIn = !!session;

  const cartQuery = trpc.cart.getCart.useQuery(
    { cart_id: cartId ?? "", locale },
    { enabled: !!cartId && isLoggedIn },
  );

  const [address, setAddress] = useState<Record<string, string>>({});
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_label: string;
    discount_amount: number;
  } | null>(null);

  const shippingCost = SHIPPING_COSTS[shippingMethod] ?? 0;

  const previewQuery = trpc.checkout.preview.useQuery(
    {
      cart_id: cartId ?? "",
      shipping_cost: shippingCost,
      tax_rate: TAX_RATE,
      discount_code: appliedPromo?.code,
    },
    { enabled: !!cartId && isLoggedIn },
  );

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

  const placeOrder = trpc.checkout.place.useMutation({
    onSuccess: (order: any) => {
      router.push(`/account/orders/${order.id}`);
    },
  });

  const items = cartQuery.data?.items ?? [];
  const currency = cartQuery.data?.currency ?? "DZD";
  const totals = previewQuery.data?.totals;
  const subtotal = totals ? Number(totals.subtotal) : 0;
  const discount = totals ? Number(totals.discount_total) : 0;
  const taxTotal = totals ? Number(totals.tax_total) : 0;
  const shippingTotal = totals ? Number(totals.shipping_total) : 0;
  const grandTotal = totals ? Number(totals.grand_total) : 0;

  function formatPrice(amount: number) {
    return `${amount.toLocaleString()} ${currency}`;
  }

  const reviewItems = useMemo(() =>
    items.map((item: any) => ({
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
      price: formatPrice(Number(item.line_total)),
    })),
  [items, currency]);

  function handleAddressChange(name: string, value: string) {
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  function handleApplyPromo(code: string) {
    if (!code.trim() || items.length === 0) return;
    setPromoCode(code);
    applyPromo.mutate({
      code: code.trim(),
      lines: items.map((i: any) => ({
        product_id: i.product_id,
        sku_id: i.sku_id,
        quantity: i.quantity,
        unit_price: String(i.unit_price),
        line_total: String(i.line_total),
      })),
      shipping_cost: shippingCost,
    });
  }

  function idempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function handlePlaceOrder() {
    const fullName = `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim();
    if (!fullName || !address.address || !address.city || !address.phone) return;

    placeOrder.mutate({
      cart_id: cartId!,
      shipping_address: {
        full_name: fullName,
        phone: address.phone,
        line1: address.address,
        line2: (address.line2 as string | null | undefined) ?? null,
        city: address.city,
        state: (address.state as string) ?? null,
        postal_code: (address.postal_code as string) ?? null,
        country_code: "DZ",
      },
      shipping_cost: shippingCost,
      tax_rate: TAX_RATE,
      discount_code: appliedPromo?.code,
      idempotency_key: idempotencyKey(),
      payment_provider: paymentMethod,
    });
  }

  const shippingMethods = [
    { id: "standard", name: t("shipping_standard_name"), description: t("shipping_standard_desc"), price: t("shipping_standard_price") },
    { id: "express", name: t("shipping_express_name"), description: t("shipping_express_desc"), price: t("shipping_express_price") },
    { id: "sameday", name: t("shipping_sameday_name"), description: t("shipping_sameday_desc"), price: t("shipping_sameday_price") },
  ];

  const paymentMethods = [
    { id: "cib", name: t("payment_cib") },
    { id: "satim", name: t("payment_satim") },
    { id: "cod", name: t("payment_cod") },
  ];

  const summaryLines: Array<{ label: string; value: string; highlight?: boolean }> = useMemo(() => {
    const lines: Array<{ label: string; value: string; highlight?: boolean }> = [
      { label: t("subtotal"), value: formatPrice(subtotal) },
    ];
    if (discount > 0) {
      lines.push({ label: appliedPromo?.discount_label ?? "Réduction", value: `-${formatPrice(discount)}`, highlight: true });
    }
    lines.push({ label: t("shipping"), value: shippingTotal > 0 ? formatPrice(shippingTotal) : t("free"), highlight: true });
    if (taxTotal > 0) {
      lines.push({ label: t("taxes"), value: formatPrice(taxTotal) });
    }
    return lines;
  }, [subtotal, discount, shippingTotal, taxTotal, appliedPromo, currency]);

  const isLoading = sessionLoading || (isLoggedIn && cartQuery.isLoading);
  const error = sessionError || (isLoggedIn ? cartQuery.error : null);

  return (
    <QueryGuard
      query={{ isLoading, error }}
      loadingFallback={<CheckoutPageSkeleton />}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

        {/* LOGIN / SESSION CARD */}
        <Card className="mb-8 flex items-center justify-between p-4">
          <p className="text-sm">
            {isLoggedIn
              ? (session?.user?.name ?? session?.user?.email ?? "Connecté")
              : t("login_guest")}
          </p>
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={() => router.push("/account")}>
              Mon compte
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push("/auth/login")}>
              {t("login")}
            </Button>
          )}
        </Card>

        {!isLoggedIn ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <h2 className="text-lg font-semibold">Connectez-vous pour continuer</h2>
            <p className="text-muted-foreground text-sm">Vous devez être connecté pour passer commande.</p>
            <Button onClick={() => router.push("/auth/login")}>{t("login")}</Button>
          </Card>
        ) : items.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <h2 className="text-lg font-semibold">Votre panier est vide</h2>
            <p className="text-muted-foreground text-sm">Ajoutez des articles avant de passer commande.</p>
            <Button onClick={() => router.push("/boutique")}>Continuer mes achats</Button>
          </Card>
        ) : (
          <>
            <CheckoutSteps
              steps={[
                { key: "shipping", label: t("step_shipping") },
                { key: "method", label: t("step_method") },
                { key: "payment", label: t("step_payment") },
                { key: "review", label: t("step_review") },
              ]}
              currentIndex={0}
            />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <CheckoutShippingForm
                  title={t("shipping_address")}
                  fields={[
                    { name: "first_name", placeholder: t("first_name") },
                    { name: "last_name", placeholder: t("last_name") },
                    { name: "address", placeholder: t("address") , fullWidth: true },
                    { name: "city", placeholder: t("city") },
                    { name: "postal_code", placeholder: t("postal_code") },
                    { name: "phone", placeholder: t("phone"), fullWidth: true },
                  ]}
                  values={address}
                  onChange={handleAddressChange}
                />

                <CheckoutOptionSelector
                  title={t("shipping_method")}
                  name="shipping"
                  options={shippingMethods}
                  selectedId={shippingMethod}
                  onChange={setShippingMethod}
                />

                <CheckoutOptionSelector
                  title={t("payment_method")}
                  name="payment"
                  options={paymentMethods}
                  selectedId={paymentMethod}
                  onChange={setPaymentMethod}
                />

                <CheckoutOrderReview
                  title={t("review")}
                  items={reviewItems}
                  ctaLabel={placeOrder.isPending ? "..." : t("place_order")}
                  onCta={handlePlaceOrder}
                  ctaDisabled={!address.first_name || !address.last_name || !address.address || !address.city || !address.phone || placeOrder.isPending}
                />

                {placeOrder.error && (
                  <Card className="border-destructive p-4 text-sm text-destructive">
                    {placeOrder.error.message}
                  </Card>
                )}
              </div>

              <CartSummary
                lines={summaryLines}
                total={formatPrice(grandTotal)}
                totalLabel={t("summary")}
                ctaLabel={t("place_order")}
                onCta={handlePlaceOrder}
                ctaDisabled={!address.first_name || !address.last_name || !address.address || !address.city || !address.phone || placeOrder.isPending}
                promoCode={{
                  placeholder: t("promo_placeholder"),
                  applyLabel: t("apply"),
                  onApply: handleApplyPromo,
                  isLoading: applyPromo.isPending,
                }}
              />
            </div>
          </>
        )}
      </div>
    </QueryGuard>
  );
}
