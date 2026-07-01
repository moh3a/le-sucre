import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {
  params: Promise<{ locale: string; product_slug: string }>;
};

const SPECS = [
  { labelKey: "spec_weight", valueKey: "spec_weight_value" },
  { labelKey: "spec_dimensions", valueKey: "spec_dimensions_value" },
  { labelKey: "spec_material", valueKey: "spec_material_value" },
];

const SIZES = ["S", "M", "L", "XL"];

export async function generateMetadata({ params }: Props): Promise<import("next").Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product_detail" });
  return { title: t("title") };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "product_detail" });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* IMAGE GALLERY - TODO: Implement with embla-carousel */}
        <div className="space-y-4">
          <Card className="aspect-square w-full bg-muted" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="aspect-square w-20 bg-muted" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* PRODUCT TITLE */}
          <h1 className="text-3xl font-bold">{t("example_title")}</h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">{t("example_price")}</span>
            <span className="text-lg text-muted-foreground line-through">{t("example_original_price")}</span>
            <Badge variant="destructive">{t("example_discount")}</Badge>
          </div>

          {/* RATING */}
          <div className="flex items-center gap-2 text-yellow-500">
            {"★".repeat(4)}{"☆".repeat(1)}
            <span className="text-sm text-muted-foreground">({t("reviews_count", { count: 24 })})</span>
          </div>

          {/* VARIANT SELECTOR */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("variant")}</p>
            <div className="flex gap-2">
              {SIZES.map((size) => (
                <Button key={size} variant="outline" size="sm">{size}</Button>
              ))}
            </div>
          </div>

          {/* QUANTITY + ADD TO CART */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon">-</Button>
              <span className="w-10 text-center">1</span>
              <Button variant="ghost" size="icon">+</Button>
            </div>
            <Button className="flex-1">{t("add_to_cart")}</Button>
          </div>

          {/* WISHLIST TOGGLE */}
          <Button variant="outline" className="w-full">
            ♡ {t("add_to_wishlist")}
          </Button>

          {/* SHIPPING INFO */}
          <Card className="p-4 text-sm space-y-2">
            <p>🚚 {t("free_shipping")}</p>
            <p>🔄 {t("returns")}</p>
          </Card>

          <Separator />

          {/* PRODUCT DESCRIPTION */}
          <div>
            <h2 className="text-lg font-semibold">{t("description")}</h2>
            <p className="mt-2 text-muted-foreground">{t("description_placeholder")}</p>
          </div>

          {/* SPECIFICATIONS TABLE */}
          <div>
            <h2 className="text-lg font-semibold">{t("specifications")}</h2>
            <table className="mt-2 w-full text-sm">
              <tbody>
                {SPECS.map((spec) => (
                  <tr key={spec.labelKey} className="border-b">
                    <td className="py-2 font-medium">{t(spec.labelKey)}</td>
                    <td className="py-2">{t(spec.valueKey)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* REVIEWS SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("reviews_section")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t("reviewer_name", { number: i + 1 })}</span>
                <span className="text-yellow-500 text-sm">{"★".repeat(5)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("review_text")}</p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* RELATED PRODUCTS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("related")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="aspect-square w-full bg-muted rounded-md" />
              <p className="font-medium text-sm">{t("related_product_name", { number: i + 1 })}</p>
              <p className="text-sm text-muted-foreground">{t("related_product_price")}</p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* RECENTLY VIEWED */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("recently_viewed")}</h2>
        <p className="text-muted-foreground">{t("recently_viewed_empty")}</p>
      </section>
    </div>
  );
}
