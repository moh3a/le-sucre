import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { APP_NAME, siteConfig } from "@/constants";

export const metadata = { title: "Commander" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("checkout.title") || "Commander"}</h1>

      {/* LOGIN / GUEST TOGGLE */}
      <Card className="p-4 mb-8 flex items-center justify-between">
        <p className="text-sm">{t("checkout.login_guest") || "Vous avez déjà un compte ?"}</p>
        <Button variant="outline" size="sm">{t("checkout.login") || "Se connecter"}</Button>
      </Card>

      {/* STEPS INDICATOR */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { label: t("checkout.step_shipping") || "Livraison", done: true },
          { label: t("checkout.step_method") || "Méthode", done: false },
          { label: t("checkout.step_payment") || "Paiement", done: false },
          { label: t("checkout.step_review") || "Confirmation", done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step.done
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${step.done ? "font-medium" : "text-muted-foreground"}`}>
              {step.label}
            </span>
            {i < 3 && <Separator className="w-8" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* STEP 1: SHIPPING ADDRESS */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.shipping_address") || "Adresse de livraison"}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input placeholder={t("checkout.first_name") || "Prénom"} />
              <Input placeholder={t("checkout.last_name") || "Nom"} />
              <Input placeholder={t("checkout.address") || "Adresse"} className="sm:col-span-2" />
              <Input placeholder={t("checkout.city") || "Ville"} />
              <Input placeholder={t("checkout.postal_code") || "Code postal"} />
              <Input placeholder={t("checkout.phone") || "Téléphone"} className="sm:col-span-2" />
            </div>
          </Card>

          {/* STEP 2: SHIPPING METHOD */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.shipping_method") || "Mode de livraison"}</h2>
            <div className="space-y-3">
              {[
                { name: "Livraison standard", desc: "5-7 jours ouvrés", price: "Gratuit" },
                { name: "Livraison express", desc: "2-3 jours ouvrés", price: "1 500 DZD" },
                { name: "Livraison le jour même", desc: "Uniquement Alger", price: "2 500 DZD" },
              ].map((method, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-muted has-[:checked]:border-primary"
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" defaultChecked={i === 0} className="accent-primary" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.desc}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{method.price}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* STEP 3: PAYMENT METHOD */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.payment_method") || "Moyen de paiement"}</h2>
            <div className="space-y-3">
              {["Carte bancaire (CIB)", "SATIM", "À la livraison"].map((method, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:bg-muted has-[:checked]:border-primary"
                >
                  <input type="radio" name="payment" defaultChecked={i === 0} className="accent-primary" />
                  <span className="font-medium">{method}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* STEP 4: ORDER REVIEW */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.review") || "Récapitulatif de la commande"}</h2>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted" />
                <div className="flex-1">
                  <p className="font-medium">Produit {i + 1}</p>
                  <p className="text-sm text-muted-foreground">Qté: 1</p>
                </div>
                <p className="font-semibold">2 500 DZD</p>
              </div>
            ))}
            <Separator />
            <Button className="w-full">{t("checkout.place_order") || "Confirmer la commande"}</Button>
          </Card>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">{t("checkout.summary") || "Récapitulatif"}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.subtotal") || "Sous-total"}</span>
                <span>5 000 DZD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.shipping") || "Livraison"}</span>
                <span className="text-green-600">{t("checkout.free") || "Gratuite"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.taxes") || "TVA"}</span>
                <span>500 DZD</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t("checkout.total") || "Total"}</span>
              <span>5 500 DZD</span>
            </div>
            <div className="flex gap-2">
              <Input placeholder={t("checkout.promo_placeholder") || "Code promo"} className="flex-1" />
              <Button variant="outline">{t("checkout.apply") || "Appliquer"}</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
