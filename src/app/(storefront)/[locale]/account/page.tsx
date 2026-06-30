import type { Metadata } from "next";

import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Mon compte",
};

type Props = { params: Promise<{ locale: string }> };

const navCards = [
  { href: "/account/orders", key: "nav_orders", icon: "🛒" },
  { href: "/account/addresses", key: "nav_addresses", icon: "📍" },
  { href: "/account/reviews", key: "nav_reviews", icon: "⭐" },
  { href: "/account/wishlists", key: "nav_wishlists", icon: "❤️" },
  { href: "/account/settings", key: "nav_settings", icon: "⚙️" },
  { href: "/account/support", key: "nav_support", icon: "💬" },
];

const recentOrders = [
  { id: "CMD-001", date: "15 juin 2026", status: "Livré", total: "3 500 DA" },
  { id: "CMD-002", date: "2 juin 2026", status: "Expédié", total: "2 100 DA" },
  { id: "CMD-003", date: "28 mai 2026", status: "Confirmé", total: "8 750 DA" },
];

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4">
      {/* ACCOUNT GREETING */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("hello", { fallback: "Bonjour" })} {t("name_placeholder", { fallback: "[Nom]" })} 👋</CardTitle>
            <CardDescription>
              {t("dashboard_description", { fallback: "Bienvenue sur votre espace personnel. Gérez vos commandes, adresses et préférences." })}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* ACCOUNT NAV CARDS */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          {t("quick_actions", { fallback: "Actions rapides" })}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="cursor-pointer transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span>{card.icon}</span>
                    <span>{t(card.key)}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* RECENT ORDERS SUMMARY */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_orders", { fallback: "Dernières commandes" })}</CardTitle>
            <CardDescription>
              {t("recent_orders_desc", { fallback: "Récapitulatif de vos 3 dernières commandes" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">{t("order", { fallback: "Commande" })}</th>
                    <th className="pb-2 font-medium">{t("date", { fallback: "Date" })}</th>
                    <th className="pb-2 font-medium">{t("status", { fallback: "Statut" })}</th>
                    <th className="pb-2 text-right font-medium">{t("total", { fallback: "Total" })}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link href={`/account/orders/${order.id}`} className="text-primary hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-3">{order.date}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            order.status === "Livré"
                              ? "secondary"
                              : order.status === "Expédié"
                                ? "default"
                                : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href="/account/orders">
                  {t("view_all_orders", { fallback: "Voir toutes les commandes" })}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* SAVED ITEMS COUNT */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("saved_items", { fallback: "Articles sauvegardés" })}</CardTitle>
            <CardDescription>
              {t("saved_items_desc", { fallback: "Articles mis de côté pour plus tard" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">
              {t("no_saved_items", { fallback: "Aucun article sauvegardé" })}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* WISHLIST COUNT */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("wishlist", { fallback: "Liste de souhaits" })}</CardTitle>
            <CardDescription>
              {t("wishlist_desc", { fallback: "Produits dans votre liste de souhaits" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">
              {t("no_wishlist_items", { fallback: "Aucun produit dans votre liste de souhaits" })}
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* RECENT ACTIVITY */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_activity", { fallback: "Activité récente" })}</CardTitle>
            <CardDescription>
              {t("recent_activity_desc", { fallback: "Votre historique d'activité récent" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with actual activity timeline */}
            <div className="space-y-4">
              <div className="relative border-l-2 border-muted pl-4">
                <div className="bg-primary absolute -left-[9px] top-1 size-4 rounded-full" />
                <p className="text-sm font-medium">
                  {t("activity_register", { fallback: "Inscription" })}
                </p>
                <p className="text-muted-foreground text-xs">
                  {t("activity_register_desc", { fallback: "Création de votre compte" })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
