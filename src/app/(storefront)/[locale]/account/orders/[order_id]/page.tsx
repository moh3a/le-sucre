import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Détail de la commande",
};

type Props = { params: Promise<{ locale: string; order_id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { locale, order_id } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      {/* BACK BUTTON */}
      <Button variant="ghost" asChild>
        <Link href="/account/orders">
          <span className="mr-1">&larr;</span>
          {t("back_to_orders", { fallback: "Retour aux commandes" })}
        </Link>
      </Button>

      {/* ORDER HEADER */}
      <section>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xl">
                {t("order_title", { fallback: "Commande" })} {order_id}
              </CardTitle>
              <CardDescription>
                {/* TODO: Replace with actual date */}
                {t("order_date", { fallback: "Date" })}: 15 juin 2026
              </CardDescription>
            </div>
            {/* TODO: Replace with dynamic status */}
            <Badge variant="secondary">
              {t("status_delivered", { fallback: "Livré" })}
            </Badge>
          </CardHeader>
        </Card>
      </section>

      {/* ORDER TIMELINE */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("order_progress", { fallback: "Suivi de commande" })}</CardTitle>
            <CardDescription>
              {t("order_progress_desc", { fallback: "Les différentes étapes de votre commande" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with Stepper component */}
            <div className="flex items-center gap-2">
              {["Confirmée", "Préparée", "Expédiée", "Livrée"].map((step, index) => (
                <div key={step} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full text-sm font-medium ${
                        index <= 3
                          ? "bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 border text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-1 text-xs">{step}</span>
                  </div>
                  {index < 3 && (
                    <div className="bg-border mx-2 h-px flex-1" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ORDER ITEMS */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("order_items", { fallback: "Articles commandés" })}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with actual order items from API */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{t("product", { fallback: "Produit" })}</th>
                    <th className="pb-2 font-medium">{t("quantity", { fallback: "Qté" })}</th>
                    <th className="pb-2 text-right font-medium">{t("price", { fallback: "Prix" })}</th>
                    <th className="pb-2 text-right font-medium">{t("subtotal", { fallback: "Sous-total" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Pâtisserie assortie x6", qty: 2, price: 1200, subtotal: 2400 },
                    { name: "Gâteau au chocolat", qty: 1, price: 1800, subtotal: 1800 },
                  ].map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {/* TODO: Replace with product image */}
                          <div className="bg-muted size-12 rounded-md" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3">{item.qty}</td>
                      <td className="py-3 text-right">{item.price.toLocaleString("fr-FR")} DA</td>
                      <td className="py-3 text-right">{item.subtotal.toLocaleString("fr-FR")} DA</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-3 text-right font-medium">
                      {t("total", { fallback: "Total" })}:
                    </td>
                    <td className="pt-3 text-right font-bold">
                      4 200 DA
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* SHIPPING INFO */}
      <section className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("shipping_info", { fallback: "Adresse de livraison" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {/* TODO: Replace with actual shipping address */}
            <p className="font-medium">Ahmed Benali</p>
            <p>15 Rue Didouche Mourad</p>
            <p>16000 Alger</p>
            <p>Algérie</p>
            <p className="pt-2">+213 5XX XX XX XX</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("shipping_method", { fallback: "Mode de livraison" })}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {/* TODO: Replace with actual shipping method */}
            <p className="font-medium">{t("standard_shipping", { fallback: "Livraison standard" })}</p>
            <p className="text-muted-foreground">
              {t("estimated_delivery", { fallback: "Délai estimé" })}: 3-5 jours ouvrés
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* PAYMENT INFO */}
      <section className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("payment_info", { fallback: "Paiement" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* TODO: Replace with actual payment details */}
            <div className="flex justify-between">
              <span>{t("payment_method", { fallback: "Moyen de paiement" })}</span>
              <span className="font-medium">Carte bancaire (CIB)</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>{t("payment_status", { fallback: "Statut" })}</span>
              <Badge variant="secondary">
                {t("payment_paid", { fallback: "Payé" })}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("total_breakdown", { fallback: "Détail des montants" })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {/* TODO: Replace with actual totals */}
            <div className="flex justify-between">
              <span>{t("subtotal", { fallback: "Sous-total" })}</span>
              <span>4 200 DA</span>
            </div>
            <div className="flex justify-between">
              <span>{t("shipping_cost", { fallback: "Livraison" })}</span>
              <span>500 DA</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t("total", { fallback: "Total" })}</span>
              <span>4 700 DA</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* ACTIONS */}
      <section className="flex flex-wrap gap-3">
        {/* TODO: Wire up reorder action */}
        <Button>{t("reorder", { fallback: "Commander à nouveau" })}</Button>
        <Button variant="outline">
          {t("request_return", { fallback: "Demander un retour" })}
        </Button>
        <Button variant="outline">
          {t("download_invoice", { fallback: "Télécharger la facture" })}
        </Button>
      </section>
    </div>
  );
}
