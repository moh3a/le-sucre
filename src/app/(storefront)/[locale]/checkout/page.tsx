import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckoutSteps } from "@/features/order_management_system/checkout/components/storefront/checkout-steps";
import { CheckoutShippingForm } from "@/features/order_management_system/checkout/components/storefront/checkout-shipping-form";
import { CheckoutOptionSelector } from "@/features/order_management_system/checkout/components/storefront/checkout-option-selector";
import { CheckoutOrderReview } from "@/features/order_management_system/checkout/components/storefront/checkout-order-review";
import { CartSummary } from "@/features/order_management_system/carts/components/storefront/cart-summary";
import { Input } from "@/components/ui/input";

type Props = {
  params: Promise<{ locale: string }>;
};

const shippingMethods = [
  { id: "standard", nameKey: "shipping_standard_name", descKey: "shipping_standard_desc", priceKey: "shipping_standard_price" },
  { id: "express", nameKey: "shipping_express_name", descKey: "shipping_express_desc", priceKey: "shipping_express_price" },
  { id: "sameday", nameKey: "shipping_sameday_name", descKey: "shipping_sameday_desc", priceKey: "shipping_sameday_price" },
] as const;

const paymentMethods = [
  { id: "cib", nameKey: "payment_cib" },
  { id: "satim", nameKey: "payment_satim" },
  { id: "cod", nameKey: "payment_cod" },
] as const;

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title") };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

      {/* LOGIN / GUEST TOGGLE */}
      <Card className="mb-8 flex items-center justify-between p-4">
        <p className="text-sm">{t("login_guest")}</p>
        <Button variant="outline" size="sm">
          {t("login")}
        </Button>
      </Card>

      {/* STEPS INDICATOR */}
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
          {/* STEP 1: SHIPPING ADDRESS */}
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
          />

          {/* STEP 2: SHIPPING METHOD */}
          <CheckoutOptionSelector
            title={t("shipping_method")}
            name="shipping"
            options={shippingMethods.map((m) => ({
              id: m.id,
              name: t(m.nameKey),
              description: t(m.descKey),
              price: t(m.priceKey),
            }))}
            onChange={() => {}}
          />

          {/* STEP 3: PAYMENT METHOD */}
          <CheckoutOptionSelector
            title={t("payment_method")}
            name="payment"
            options={paymentMethods.map((m) => ({
              id: m.id,
              name: t(m.nameKey),
            }))}
            onChange={() => {}}
          />

          {/* STEP 4: ORDER REVIEW */}
          <CheckoutOrderReview
            title={t("review")}
            items={Array.from({ length: 2 }).map((_, i) => ({
              product: {
                id: `review-prod-${i}`,
                slug: `product-${i}`,
                name: t("product_item", { count: i + 1 }),
                image_url: null,
                currency: "DZD",
                min_price: "2500",
                max_price: null,
                is_featured: false,
                in_stock: true,
                brand_name: null,
              },
              quantity: 1,
              price: "2 500 DZD",
            }))}
            ctaLabel={t("place_order")}
          />
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <CartSummary
          lines={[
            { label: t("subtotal"), value: "5 000 DZD" },
            { label: t("shipping"), value: t("free") },
            { label: t("taxes"), value: "500 DZD" },
          ]}
          total="5 500 DZD"
          totalLabel={t("total")}
          ctaLabel={t("place_order")}
          promoCode={{
            placeholder: t("promo_placeholder"),
            applyLabel: t("apply"),
          }}
        />
      </div>
    </div>
  );
}
