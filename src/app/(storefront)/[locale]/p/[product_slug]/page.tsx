import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/constants";

export const metadata = { title: "Produit" };

type Props = {
  params: Promise<{ locale: string; product_slug: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { locale, product_slug } = await params;
  const t = await getTranslations({ locale });

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
          <h1 className="text-3xl font-bold">{t("product_detail.title") || "Produit exemple — {product_slug}"}</h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">12 500 DZD</span>
            <span className="text-lg text-muted-foreground line-through">15 000 DZD</span>
            <Badge variant="destructive">-17%</Badge>
          </div>

          {/* RATING */}
          <div className="flex items-center gap-2 text-yellow-500">
            {"★".repeat(4)}{"☆".repeat(1)}
            <span className="text-sm text-muted-foreground">(24 {t("product_detail.reviews") || "avis"})</span>
          </div>

          {/* VARIANT SELECTOR - TODO: size, color etc */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("product_detail.variant") || "Variante"}</p>
            <div className="flex gap-2">
              {["S", "M", "L", "XL"].map((size) => (
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
            <Button className="flex-1">{t("product_detail.add_to_cart") || "Ajouter au panier"}</Button>
          </div>

          {/* WISHLIST TOGGLE */}
          <Button variant="outline" className="w-full">
            ♡ {t("product_detail.add_to_wishlist") || "Ajouter aux favoris"}
          </Button>

          {/* SHIPPING INFO */}
          <Card className="p-4 text-sm space-y-2">
            <p>🚚 {t("product_detail.free_shipping") || "Livraison gratuite à partir de 5 000 DZD"}</p>
            <p>🔄 {t("product_detail.returns") || "Retours sous 14 jours"}</p>
          </Card>

          <Separator />

          {/* PRODUCT DESCRIPTION */}
          <div>
            <h2 className="text-lg font-semibold">{t("product_detail.description") || "Description"}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("product_detail.description_placeholder") ||
                "Description détaillée du produit. Cette section sera alimentée depuis le CMS."}
            </p>
          </div>

          {/* SPECIFICATIONS TABLE */}
          <div>
            <h2 className="text-lg font-semibold">{t("product_detail.specifications") || "Caractéristiques"}</h2>
            <table className="mt-2 w-full text-sm">
              <tbody>
                <tr className="border-b"><td className="py-2 font-medium">Poids</td><td className="py-2">250 g</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Dimensions</td><td className="py-2">20 × 15 × 5 cm</td></tr>
                <tr className="border-b"><td className="py-2 font-medium">Matière</td><td className="py-2">Coton bio</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Separator className="my-12" />

      {/* REVIEWS SECTION */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("product_detail.reviews_section") || "Avis clients"}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Client {i + 1}</span>
                <span className="text-yellow-500 text-sm">{"★".repeat(5)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Ce produit est exactement ce que je recherchais. Qualité au rendez-vous !
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* RELATED PRODUCTS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("product_detail.related") || "Produits similaires"}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <div className="aspect-square w-full bg-muted rounded-md" />
              <p className="font-medium text-sm">Produit connexe {i + 1}</p>
              <p className="text-sm text-muted-foreground">2 500 DZD</p>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* RECENTLY VIEWED */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("product_detail.recently_viewed") || "Derniers consultés"}</h2>
        <p className="text-muted-foreground">{t("product_detail.recently_viewed_empty") || "Aucun produit consulté récemment."}</p>
      </section>
    </div>
  );
}
