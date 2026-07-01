import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("title") };
}

const shippingMethods = [
  "shipping_standard",
  "shipping_express",
  "shipping_sameday",
] as const;

const paymentMethods = [
  "payment_cib",
  "payment_satim",
  "payment_cod",
] as const;

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
      <div className="mb-8 flex items-center justify-center gap-2">
        {(["step_shipping", "step_method", "step_payment", "step_review"] as const).map(
          (stepKey, i) => (
            <div key={stepKey} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  i === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i === 0 ? t("step_check") : i + 1}
              </div>
              <span
                className={`text-sm ${i === 0 ? "font-medium" : "text-muted-foreground"}`}
              >
                {t(stepKey)}
              </span>
              {i < 3 && <Separator className="w-8" />}
            </div>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* STEP 1: SHIPPING ADDRESS */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("shipping_address")}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input placeholder={t("first_name")} />
              <Input placeholder={t("last_name")} />
              <Input placeholder={t("address")} className="sm:col-span-2" />
              <Input placeholder={t("city")} />
              <Input placeholder={t("postal_code")} />
              <Input placeholder={t("phone")} className="sm:col-span-2" />
            </div>
          </Card>

          {/* STEP 2: SHIPPING METHOD */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("shipping_method")}</h2>
            <div className="space-y-3">
              {shippingMethods.map((method, i) => (
                <label
                  key={method}
                  className="hover:bg-muted has-checked:border-primary flex cursor-pointer items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      defaultChecked={i === 0}
                      className="accent-primary"
                    />
                    <div>
                      <p className="font-medium">{t(`${method}_name`)}</p>
                      <p className="text-muted-foreground text-sm">
                        {t(`${method}_desc`)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{t(`${method}_price`)}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* STEP 3: PAYMENT METHOD */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("payment_method")}</h2>
            <div className="space-y-3">
              {paymentMethods.map((method, i) => (
                <label
                  key={method}
                  className="hover:bg-muted has-checked:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4"
                >
                  <input
                    type="radio"
                    name="payment"
                    defaultChecked={i === 0}
                    className="accent-primary"
                  />
                  <span className="font-medium">{t(method)}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* STEP 4: ORDER REVIEW */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("review")}</h2>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="bg-muted h-16 w-16 shrink-0 rounded-md" />
                <div className="flex-1">
                  <p className="font-medium">{t("product_item", { count: i + 1 })}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("quantity", { count: 1 })}
                  </p>
                </div>
                <p className="font-semibold">2 500 DZD</p>
              </div>
            ))}
            <Separator />
            <Button className="w-full">{t("place_order")}</Button>
          </Card>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("summary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span>5 000 DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="text-green-600">{t("free")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("taxes")}</span>
                <span>500 DZD</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("total")}</span>
              <span>5 500 DZD</span>
            </div>
            <div className="flex gap-2">
              <Input placeholder={t("promo_placeholder")} className="flex-1" />
              <Button variant="outline">{t("apply")}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
