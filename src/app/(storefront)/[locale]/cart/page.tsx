import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, siteConfig } from "@/constants";

export const metadata = { title: "Panier" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* CART HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("cart.title") || "Panier"}</h1>
          <p className="text-muted-foreground">
            3 {t("cart.items") || "articles"}
          </p>
        </div>
        <Button variant="outline">{t("cart.clear") || "Vider le panier"}</Button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* CART ITEMS LIST */}
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="flex gap-4 p-4">
              <div className="h-24 w-24 flex-shrink-0 rounded-md bg-muted" />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-medium">Produit {i + 1}</h3>
                  <p className="text-sm text-muted-foreground">Réf: PROD-{1000 + i}</p>
                </div>
                <p className="font-semibold">{(i + 1) * 2500} DZD</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button variant="ghost" size="icon" className="text-muted-foreground">✕</Button>
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" className="h-8 w-8">-</Button>
                  <span className="w-8 text-center text-sm">{i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">+</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("cart.summary") || "Récapitulatif"}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.subtotal") || "Sous-total"}</span>
                <span>7 500 DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("cart.shipping") || "Livraison"}</span>
                <span className="text-green-600">{t("cart.free") || "Gratuite"}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("cart.total") || "Total"}</span>
              <span>7 500 DZD</span>
            </div>

            {/* PROMO CODE INPUT */}
            <div className="flex gap-2">
              <Input placeholder={t("cart.promo_placeholder") || "Code promo"} className="flex-1" />
              <Button variant="outline">{t("cart.apply") || "Appliquer"}</Button>
            </div>

            {/* CHECKOUT BUTTON */}
            <Button className="w-full">{t("cart.checkout") || "Commander"}</Button>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      {/* SAVE FOR LATER */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t("cart.saved_for_later") || "Sauvegardés pour plus tard"}</h2>
        <p className="text-muted-foreground">
          {t("cart.saved_for_later_empty") || "Aucun article sauvegardé."}
        </p>
      </section>

      <Separator className="my-12" />

      {/* CROSS-SELL SUGGESTIONS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t("cart.you_might_also_like") || "Vous aimerez aussi"}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-3 space-y-2">
              <div className="aspect-square w-full rounded-md bg-muted" />
              <p className="text-sm font-medium">Article suggéré {i + 1}</p>
              <p className="text-sm text-muted-foreground">1 500 DZD</p>
            </Card>
          ))}
        </div>
      </section>

      {/* EMPTY CART STATE */}
      {false && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="text-6xl">🛒</div>
          <h2 className="text-2xl font-bold">{t("cart.empty_title") || "Votre panier est vide"}</h2>
          <p className="text-muted-foreground">{t("cart.empty_description") || "Découvrez nos produits et ajoutez vos articles favoris."}</p>
          <Button>{t("cart.continue_shopping") || "Continuer mes achats"}</Button>
        </div>
      )}
    </div>
  );
}
