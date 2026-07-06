"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle, LogIn, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { trpc } from "@/components/providers/app-providers";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AccountNavCard } from "@/features/customer_dashboard/components/account-nav-card";
import { RecentOrdersTable } from "@/features/customer_dashboard/components/recent-orders-table";
import { AuthSheet } from "@/features/authentication_and_authorization/auth/components/auth-sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth/client";
import { Separator } from "@/components/ui/separator";

const status_translation_map: Record<string, string> = {
  pending_payment: "status_pending_payment",
  confirmed: "status_confirmed",
  paid: "status_paid",
  processing: "status_processing",
  shipped: "status_shipped",
  delivered: "status_delivered",
  failed_delivery: "status_failed_delivery",
  cancelled: "status_cancelled",
  refunded: "status_refunded",
};

const navCards = [
  { href: "/account/orders", key: "nav_orders" },
  { href: "/account/returns", key: "nav_returns" },
  { href: "/account/favorites", key: "nav_favorites" },
  { href: "/account/collections", key: "nav_collections" },
  { href: "/account/saved", key: "nav_saved" },
  { href: "/account/reviews", key: "nav_reviews" },
  { href: "/account/wishlists", key: "nav_wishlists" },
  { href: "/account/addresses", key: "nav_addresses" },
  { href: "/account/support", key: "nav_support" },
  { href: "/account/settings", key: "nav_settings" },
];

export function DashboardPageClient() {
  const t = useTranslations("account");
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const isAnonymous = session?.user?.isAnonymous ?? false;
  const { data, isLoading, error } = trpc.dashboard.getSummary.useQuery(undefined, {
    enabled: !!session && !isAnonymous,
  });

  if (sessionLoading) {
    return <DashboardLoading />;
  }

  if (isAnonymous) {
    return <AnonymousDashboard authSheetOpen={authSheetOpen} setAuthSheetOpen={setAuthSheetOpen} />;
  }

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <DashboardError error={error} />;
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4">
      {/* ACCOUNT GREETING */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("hello")} {data.user.name ?? t("name_placeholder")}
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
          icon: "",
        }))}
      />

      {/* RECENT ORDERS SUMMARY */}
      {data.recent_orders.length > 0 ? (
        <RecentOrdersTable
          title={t("recent_orders")}
          description={t("recent_orders_desc")}
          orders={data.recent_orders.map((o) => ({
            id: o.order_number,
            date: o.placed_at ?? "",
            statusKey: status_translation_map[o.status] ?? o.status,
            total: `${Number(o.grand_total).toLocaleString()} ${o.currency}`,
          }))}
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
      ) : null}

      <Separator />

      {/* SAVED ITEMS */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("saved_items")}</CardTitle>
            <CardDescription>{t("saved_items_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.saved_items_count}</p>
            {data.saved_items_count === 0 && (
              <p className="text-muted-foreground text-sm">{t("no_saved_items")}</p>
            )}
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
            <p className="text-3xl font-bold">{data.wishlist.total_items}</p>
            {data.wishlist.total_items === 0 && (
              <p className="text-muted-foreground text-sm">{t("no_wishlist_items")}</p>
            )}
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
            {data.recent_activity.length > 0 ? (
              <div className="space-y-4">
                {data.recent_activity.map((entry) => (
                  <ActivityItem key={entry.id} entry={entry} t={t} />
                ))}
              </div>
            ) : (
              <div className="border-muted relative border-l-2 pl-4">
                <div className="bg-primary absolute top-1 left-[-9px] size-4 rounded-full" />
                <p className="text-sm font-medium">{t("activity_register")}</p>
                <p className="text-muted-foreground text-xs">{t("activity_register_desc")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function AnonymousDashboard({
  authSheetOpen,
  setAuthSheetOpen,
}: {
  authSheetOpen: boolean;
  setAuthSheetOpen: (open: boolean) => void;
}) {
  const t = useTranslations("account");
  const tLayout = useTranslations("layout");
  const router = useRouter();
  const isMobile = useIsMobile();

  function handleCtaClick() {
    if (isMobile) {
      router.push("/customer-login");
    } else {
      setAuthSheetOpen(true);
    }
  }

  return (
    <div className="mx-auto container space-y-8">
      {/* CTA BANNER */}
      <section>
        <Card className="border-lemon-lime/50 bg-linear-to-br from-lemon-chiffon/20 to-cream/50">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="bg-background/80 flex h-14 w-14 items-center justify-center rounded-full shadow-sm">
              <User className="text-muted-foreground h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{tLayout("my_account")}</h2>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {tLayout("customer_auth_desc") ||
                  "Connectez-vous ou créez un compte pour gérer vos commandes, listes de souhaits et bien plus"}
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={handleCtaClick}
            >
              <LogIn className="h-5 w-5" />
              {tLayout("sign_in_sign_up") || "Se connecter / S'inscrire"}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ACCOUNT NAV CARDS */}
      <AccountNavCard
        title={t("quick_actions")}
        items={navCards.map((card) => ({
          href: card.href,
          label: t(card.key),
          icon: "",
        }))}
      />

      {/* EMPTY ORDERS PLACEHOLDER */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("recent_orders")}</CardTitle>
            <CardDescription>{t("recent_orders_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t("no_orders")}</p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* SAVED ITEMS */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("saved_items")}</CardTitle>
            <CardDescription>{t("saved_items_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t("no_saved_items")}</p>
          </CardContent>
        </Card>
      </section>

      {/* WISHLIST */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>{t("wishlist")}</CardTitle>
            <CardDescription>{t("wishlist_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{t("no_wishlist_items")}</p>
          </CardContent>
        </Card>
      </section>

      <AuthSheet open={authSheetOpen} onOpenChange={setAuthSheetOpen} />
    </div>
  );
}

function ActivityItem({
  entry,
  t,
}: {
  entry: { id: string; action: string; created_at: string };
  t: (key: string) => string;
}) {
  const activity_translations: Record<string, { title: string; desc: string }> = {
    "auth.register": { title: "activity_register", desc: "activity_register_desc" },
    "order.placed": { title: "activity_order_placed", desc: "activity_order_placed_desc" },
    "profile.updated": { title: "activity_profile_updated", desc: "activity_profile_updated_desc" },
  };

  const known = activity_translations[entry.action];
  const title = known ? t(known.title) : entry.action;
  const desc = known ? t(known.desc) : "";

  return (
    <div className="border-muted relative border-l-2 pl-4">
      <div className="bg-primary absolute top-1 left-[-9px] size-4 rounded-full" />
      <p className="text-sm font-medium">{title}</p>
      {desc && <p className="text-muted-foreground text-xs">{desc}</p>}
      {entry.created_at && (
        <p className="text-muted-foreground mt-1 text-xs">
          {new Date(entry.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-6 w-36" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function DashboardError({ error }: { error: { message: string } }) {
  const t = useTranslations("account");
  return (
    <div className="mx-auto max-w-5xl p-4">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>{t("error")}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  );
}
