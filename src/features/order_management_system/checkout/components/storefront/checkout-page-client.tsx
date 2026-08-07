"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
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
import { useStorefrontCart } from "@/features/order_management_system/carts/hooks/use-storefront-cart";
import { AuthSheet } from "@/features/authentication_and_authorization/auth/components/auth-sheet";

interface CheckoutPageClientProps {
  cartId: string | null;
  locale: string;
}

const IDEMPOTENCY_STORAGE_PREFIX = "checkout_idempotency_";

export function CheckoutPageClient({ cartId, locale }: CheckoutPageClientProps) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [authSheetOpen, setAuthSheetOpen] = useState(false);

  const { data: session, isPending: sessionLoading, error: sessionError } = authClient.useSession();
  const isLoggedIn = !!session;

  const { cart_id: bootstrapped_cart_id } = useStorefrontCart();
  const effective_cart_id = bootstrapped_cart_id ?? cartId;

  const cartQuery = trpc.cart.getCart.useQuery(
    { cart_id: effective_cart_id ?? "", locale },
    { enabled: !!effective_cart_id && isLoggedIn },
  );

  const shippingMethodsQuery = trpc.checkout.shippingMethods.useQuery();
  const paymentMethodsQuery = trpc.checkout.paymentMethods.useQuery();

  const [address, setAddress] = useState<Record<string, string>>({});
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_label: string;
    discount_amount: number;
  } | null>(null);
  const [step, setStep] = useState(0);

  const idempotencyKeyRef = useRef<string | null>(null);
  const getIdempotencyKey = useCallback(() => {
    if (idempotencyKeyRef.current) return idempotencyKeyRef.current;
    const storage_key = `${IDEMPOTENCY_STORAGE_PREFIX}${effective_cart_id ?? "guest"}`;
    const existing = window.sessionStorage.getItem(storage_key);
    const key = existing ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(storage_key, key);
    idempotencyKeyRef.current = key;
    return key;
  }, [effective_cart_id]);

  const shippingMethods = shippingMethodsQuery.data ?? [];
  const shippingCost = shippingMethods.find((method) => method.id === shippingMethod)?.cost ?? 0;

  const previewQuery = trpc.checkout.preview.useQuery(
    {
      cart_id: effective_cart_id ?? "",
      shipping_method: shippingMethod,
      discount_code: appliedPromo?.code,
    },
    { enabled: !!effective_cart_id && isLoggedIn },
  );

  const applyPromo = trpc.promotions.validateCode.useMutation({
    onSuccess: (data) => {
      const promoData = data as {
        applied?: Array<{ label: string }>;
        discount_total?: string;
      };
      const first = promoData.applied?.[0];
      if (!first) {
        toast.error(t("promo_not_applicable"));
        return;
      }
      setAppliedPromo({
        code: promoCode,
        discount_label: first.label,
        discount_amount: Number(promoData.discount_total ?? 0),
      });
      toast.success(t("promo_applied"));
    },
    onError: (err) => toast.error(err.message),
  });

  const placeOrder = trpc.checkout.place.useMutation({
    onSuccess: (result) => {
      if (result) {
        if (effective_cart_id)
          window.sessionStorage.removeItem(`${IDEMPOTENCY_STORAGE_PREFIX}${effective_cart_id}`);
        toast.success(t("order_placed"));
        router.push(`/account/orders/${result.order.id}`);
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const items = useMemo(() => cartQuery.data?.items ?? [], [cartQuery.data?.items]);
  const currency = cartQuery.data?.currency ?? "DZD";
  const totals = previewQuery.data?.totals;
  const subtotal = totals ? Number(totals.subtotal) : 0;
  const discount = totals ? Number(totals.discount_total) : 0;
  const taxTotal = totals ? Number(totals.tax_total) : 0;
  const shippingTotal = totals ? Number(totals.shipping_total) : 0;
  const grandTotal = totals ? Number(totals.grand_total) : 0;

  const formatPrice = useCallback(
    (amount: number) => `${amount.toLocaleString()} ${currency}`,
    [currency],
  );

  const reviewItems = useMemo(
    () =>
      items.map((item) => ({
        product: {
          id: item.product_id,
          slug: item.sku_id,
          name: item.product_name,
          image_url: item.image_url ?? null,
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
    [items, formatPrice],
  );

  const shippingOptions = shippingMethods.map((method) => ({
    id: method.id,
    name: t(method.name_key),
    description: t(method.description_key),
    price: method.cost > 0 ? formatPrice(method.cost) : t("free"),
  }));

  const paymentOptions = (paymentMethodsQuery.data ?? []).map((method) => ({
    id: method.id,
    name: t(method.label_key),
  }));

  function handleAddressChange(name: string, value: string) {
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  function handleApplyPromo(code: string) {
    if (!code.trim() || items.length === 0) return;
    setPromoCode(code);
    applyPromo.mutate({
      code: code.trim(),
      lines: items.map((i) => ({
        product_id: i.product_id,
        sku_id: i.sku_id,
        quantity: i.quantity,
        unit_price: String(i.unit_price),
        line_total: String(i.line_total),
      })),
      shipping_cost: shippingCost,
    });
  }

  function handlePlaceOrder() {
    const fullName = `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim();
    if (!fullName || !address.address || !address.city || !address.phone) return;

    placeOrder.mutate({
      cart_id: effective_cart_id!,
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
      shipping_method: shippingMethod,
      payment_provider: paymentMethod,
      discount_code: appliedPromo?.code,
      idempotency_key: getIdempotencyKey(),
    });
  }

  const addressComplete =
    !!address.first_name &&
    !!address.last_name &&
    !!address.address &&
    !!address.city &&
    !!address.phone;

  const canContinue = step === 0 ? addressComplete : step < 3;

  function handleNext() {
    if (canContinue) setStep((current) => Math.min(current + 1, 3));
  }

  const summaryLines: Array<{ label: string; value: string; highlight?: boolean }> = useMemo(() => {
    const lines: Array<{ label: string; value: string; highlight?: boolean }> = [
      { label: t("subtotal"), value: formatPrice(subtotal) },
    ];
    if (discount > 0) {
      lines.push({
        label: appliedPromo?.discount_label ?? t("promo_discount"),
        value: `-${formatPrice(discount)}`,
        highlight: true,
      });
    }
    lines.push({
      label: t("shipping"),
      value: shippingTotal > 0 ? formatPrice(shippingTotal) : t("free"),
      highlight: true,
    });
    if (taxTotal > 0) {
      lines.push({ label: t("taxes"), value: formatPrice(taxTotal) });
    }
    return lines;
  }, [t, formatPrice, subtotal, discount, shippingTotal, taxTotal, appliedPromo?.discount_label]);

  const isLoading = sessionLoading || (isLoggedIn && cartQuery.isLoading);
  const error = sessionError || (isLoggedIn ? cartQuery.error : null);

  const steps = [
    { key: "shipping", label: t("step_shipping") },
    { key: "method", label: t("step_method") },
    { key: "payment", label: t("step_payment") },
    { key: "review", label: t("step_review") },
  ];

  return (
    <QueryGuard query={{ isLoading, error }} loadingFallback={<CheckoutPageSkeleton />}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

        <AuthSheet open={authSheetOpen} onOpenChange={setAuthSheetOpen} />

        {/* LOGIN / SESSION CARD */}
        <Card className="mb-8 flex items-center justify-between p-4">
          <p className="text-sm">
            {isLoggedIn
              ? (session?.user?.name ?? session?.user?.email ?? t("account"))
              : t("login_guest")}
          </p>
          {isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={() => router.push("/account")}>
              {t("account")}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAuthSheetOpen(true)}>
              {t("login")}
            </Button>
          )}
        </Card>

        {!isLoggedIn ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <h2 className="text-lg font-semibold">{t("login_cta_title")}</h2>
            <p className="text-muted-foreground text-sm">{t("login_cta_desc")}</p>
            <Button onClick={() => setAuthSheetOpen(true)}>{t("login")}</Button>
          </Card>
        ) : items.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <h2 className="text-lg font-semibold">{t("empty_cart_title")}</h2>
            <p className="text-muted-foreground text-sm">{t("empty_cart_desc")}</p>
            <Button onClick={() => router.push("/boutique")}>{t("continue_shopping")}</Button>
          </Card>
        ) : (
          <>
            <CheckoutSteps steps={steps} currentIndex={step} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                {step === 0 && (
                  <CheckoutShippingForm
                    title={t("shipping_address")}
                    fields={[
                      { name: "first_name", placeholder: t("first_name") },
                      { name: "last_name", placeholder: t("last_name") },
                      { name: "address", placeholder: t("address"), fullWidth: true },
                      { name: "city", placeholder: t("city") },
                      { name: "postal_code", placeholder: t("postal_code") },
                      { name: "phone", placeholder: t("phone"), fullWidth: true },
                    ]}
                    values={address}
                    onChange={handleAddressChange}
                  />
                )}

                {step === 1 && (
                  <CheckoutOptionSelector
                    title={t("shipping_method")}
                    name="shipping"
                    options={shippingOptions}
                    selectedId={shippingMethod}
                    isLoading={shippingMethodsQuery.isLoading}
                    error={shippingMethodsQuery.error}
                    onChange={setShippingMethod}
                  />
                )}

                {step === 2 && (
                  <CheckoutOptionSelector
                    title={t("payment_method")}
                    name="payment"
                    options={paymentOptions}
                    selectedId={paymentMethod}
                    isLoading={paymentMethodsQuery.isLoading}
                    error={paymentMethodsQuery.error}
                    onChange={setPaymentMethod}
                  />
                )}

                {step === 3 && (
                  <CheckoutOrderReview
                    title={t("review")}
                    items={reviewItems}
                    ctaLabel={placeOrder.isPending ? "..." : t("place_order")}
                    onCta={handlePlaceOrder}
                    ctaDisabled={placeOrder.isPending}
                  />
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep((current) => Math.max(0, current - 1))}
                    disabled={step === 0}
                  >
                    {t("back")}
                  </Button>
                  {step < 3 ? (
                    <Button onClick={handleNext} disabled={!canContinue}>
                      {t("next")}
                    </Button>
                  ) : null}
                </div>

                {(previewQuery.error || placeOrder.error) && (
                  <Card className="border-destructive text-destructive p-4 text-sm">
                    {(previewQuery.error ?? placeOrder.error)?.message}
                  </Card>
                )}
              </div>

              <CartSummary
                lines={summaryLines}
                total={formatPrice(grandTotal)}
                totalLabel={t("summary")}
                ctaLabel={t("place_order")}
                onCta={handlePlaceOrder}
                ctaDisabled={step !== 3 || placeOrder.isPending}
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
