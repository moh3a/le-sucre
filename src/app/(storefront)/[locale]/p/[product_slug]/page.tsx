import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/features/product_information_management/products/components/storefront/product-gallery";
import { ProductPrice } from "@/components/storefront/product/product-price";
import { ProductRating } from "@/components/storefront/product/product-rating";
import { ProductQuantitySelector } from "@/components/storefront/product/product-quantity-selector";
import { ProductVariantSelector } from "@/components/storefront/product/product-variant-selector";
import { ProductReviews } from "@/features/product_information_management/products/components/storefront/product-reviews";
import { ProductSpecs } from "@/components/storefront/product/product-specs";

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
        {/* IMAGE GALLERY */}
        <ProductGallery
          images={Array.from({ length: 5 }, (_, i) => `/placeholder-${i + 1}.jpg`)}
          alt={t("example_title")}
        />

        <div className="space-y-6">
          {/* PRODUCT TITLE */}
          <h1 className="text-3xl font-bold">{t("example_title")}</h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <ProductPrice
              price={t("example_price")}
              originalPrice={t("example_original_price")}
              size="lg"
            />
            <Badge variant="destructive">{t("example_discount")}</Badge>
          </div>

          {/* RATING */}
          <ProductRating rating={4} reviewCount={24} size="md" />

          {/* VARIANT SELECTOR */}
          <ProductVariantSelector
            options={SIZES}
            label={t("variant")}
            onChange={() => {}}
          />

          {/* QUANTITY + ADD TO CART */}
          <div className="flex items-center gap-4">
            <ProductQuantitySelector value={1} onChange={() => {}} />
            <Button className="flex-1">{t("add_to_cart")}</Button>
          </div>

          {/* WISHLIST TOGGLE */}
          <Button variant="outline" className="w-full">
            ♡ {t("add_to_wishlist")}
          </Button>

          {/* SHIPPING INFO */}
          <Card className="space-y-2 p-4 text-sm">
            <p>🚚 {t("free_shipping")}</p>
            <p>🔄 {t("returns")}</p>
          </Card>

          <Separator />

          {/* PRODUCT DESCRIPTION */}
          <div>
            <h2 className="text-lg font-semibold">{t("description")}</h2>
            <p className="text-muted-foreground mt-2">{t("description_placeholder")}</p>
          </div>

          {/* SPECIFICATIONS TABLE */}
          <ProductSpecs
            specs={SPECS.map((s) => ({
              label: t(s.labelKey),
              value: t(s.valueKey),
            }))}
            title={t("specifications")}
          />
        </div>
      </div>

      <Separator className="my-12" />

      {/* REVIEWS SECTION */}
      <ProductReviews
        title={t("reviews_section")}
        reviews={Array.from({ length: 3 }).map((_, i) => ({
          id: `review-${i}`,
          author_name: t("reviewer_name", { number: i + 1 }),
          rating: 5,
          content: t("review_text"),
          date: "",
        }))}
      />

      <Separator className="my-12" />

      {/* RELATED PRODUCTS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("related")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="space-y-2 p-4">
              <div className="bg-muted aspect-square w-full rounded-md" />
              <p className="text-sm font-medium">{t("related_product_name", { number: i + 1 })}</p>
              <p className="text-muted-foreground text-sm">{t("related_product_price")}</p>
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
