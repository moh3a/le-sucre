import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AccountNavCard } from "@/components/storefront/account/account-nav-card";
import { RecentOrdersTable } from "@/components/storefront/account/recent-orders-table";

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
      <AccountNavCard
        title={t("quick_actions")}
        items={navCards.map((card) => ({
          href: card.href,
          label: t(card.key),
          icon: card.icon,
        }))}
      />

      {/* RECENT ORDERS SUMMARY */}
      <RecentOrdersTable
        title={t("recent_orders")}
        description={t("recent_orders_desc")}
        orders={RECENT_ORDERS.map((o) => ({ ...o }))}
        statusLabel={(key) => t(key)}
        viewAllLabel={t("view_all_orders")}
        viewAllHref="/account/orders"
        columnLabels={{
          order: t("order"),
          date: t("date"),
          status: t("status"),
          total: t("total"),
        }}
      />

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
