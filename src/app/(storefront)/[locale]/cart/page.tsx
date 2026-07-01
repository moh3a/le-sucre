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
            <Card key={i} className="flex gap-4 p-4">
              <div className="bg-muted h-24 w-24 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-medium">{t("product_item", { count: i + 1 })}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t("item_ref", { ref: `PROD-${1000 + i}` })}
                  </p>
                </div>
                <p className="font-semibold">{(i + 1) * 2500} DZD</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  aria-label={t("remove_icon")}
                >
                  {t("remove_icon")}
                </Button>
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("quantity_decrease")}
                  >
                    {t("quantity_decrease")}
                  </Button>
                  <span className="w-8 text-center text-sm">{i + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("quantity_increase")}
                  >
                    {t("quantity_increase")}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold">{t("summary")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span>7 500 DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span className="text-green-600">{t("free")}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("total")}</span>
              <span>7 500 DZD</span>
            </div>

            {/* PROMO CODE INPUT */}
            <div className="flex gap-2">
              <Input placeholder={t("promo_placeholder")} className="flex-1" />
              <Button variant="outline">{t("apply")}</Button>
            </div>

            {/* CHECKOUT BUTTON */}
            <Button className="w-full">{t("checkout")}</Button>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      {/* SAVE FOR LATER */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t("saved_for_later")}</h2>
        <p className="text-muted-foreground">{t("saved_for_later_empty")}</p>
      </section>

      <Separator className="my-12" />

      {/* CROSS-SELL SUGGESTIONS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t("you_might_also_like")}</h2>
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
        <div className="flex flex-col items-center justify-center space-y-4 py-20">
          <div className="text-6xl" aria-hidden="true">
            {t("empty_icon")}
          </div>
          <h2 className="text-2xl font-bold">{t("empty_title")}</h2>
          <p className="text-muted-foreground">{t("empty_description")}</p>
          <Button>{t("continue_shopping")}</Button>
        </div>
      )}
    </div>
  );
}
