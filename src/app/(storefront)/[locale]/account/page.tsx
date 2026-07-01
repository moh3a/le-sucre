import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title") };
}

const navCards = [
  { href: "/account/orders", key: "nav_orders", icon: "🛒" },
  { href: "/account/addresses", key: "nav_addresses", icon: "📍" },
  { href: "/account/reviews", key: "nav_reviews", icon: "⭐" },
  { href: "/account/wishlists", key: "nav_wishlists", icon: "❤️" },
  { href: "/account/settings", key: "nav_settings", icon: "⚙️" },
  { href: "/account/support", key: "nav_support", icon: "💬" },
];

const RECENT_ORDERS = [
  { id: "CMD-001", date: "15 juin 2026", statusKey: "status_delivered", total: "3 500 DA" },
  { id: "CMD-002", date: "2 juin 2026", statusKey: "status_shipped", total: "2 100 DA" },
  { id: "CMD-003", date: "28 mai 2026", statusKey: "status_confirmed", total: "8 750 DA" },
] as const;

export default async function AccountDashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4">
      {/* ACCOUNT GREETING */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("hello")} {t("name_placeholder")} 👋
            </CardTitle>
            <CardDescription>{t("dashboard_description")}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* ACCOUNT NAV CARDS */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("quick_actions")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card className="hover:border-primary cursor-pointer transition-colors">
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
            <CardTitle>{t("recent_orders")}</CardTitle>
            <CardDescription>{t("recent_orders_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pb-2 font-medium">{t("order")}</th>
                    <th className="pb-2 font-medium">{t("date")}</th>
                    <th className="pb-2 font-medium">{t("status")}</th>
                    <th className="pb-2 text-right font-medium">{t("total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-primary hover:underline"
                        >
                          {order.id}
                        </Link>
                      </td>
                      <td className="py-3">{order.date}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            order.statusKey === "status_delivered"
                              ? "secondary"
                              : order.statusKey === "status_shipped"
                                ? "default"
                                : "outline"
                          }
                        >
                          {t(order.statusKey)}
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
                <Link href="/account/orders">{t("view_all_orders")}</Link>
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
            <CardTitle>{t("saved_items")}</CardTitle>
            <CardDescription>{t("saved_items_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">{t("no_saved_items")}</p>
          </CardContent>
        </Card>
      </section>

      {/* WISHLIST COUNT */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("wishlist")}</CardTitle>
            <CardDescription>{t("wishlist_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-muted-foreground text-sm">{t("no_wishlist_items")}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* RECENT ACTIVITY */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_activity")}</CardTitle>
            <CardDescription>{t("recent_activity_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with actual activity timeline */}
            <div className="space-y-4">
              <div className="border-muted relative border-l-2 pl-4">
                <div className="bg-primary absolute top-1 left-[-9px] size-4 rounded-full" />
                <p className="text-sm font-medium">{t("activity_register")}</p>
                <p className="text-muted-foreground text-xs">{t("activity_register_desc")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
