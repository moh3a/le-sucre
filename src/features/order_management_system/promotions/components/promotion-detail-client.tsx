"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  BadgePercent,
  Calendar,
  DollarSign,
  ExternalLink,
  Hash,
  Layers,
  Pencil,
  ShoppingCart,
  Tag,
  Ticket,
  Zap,
} from "lucide-react";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { ConsolePageShell } from "@/components/console/console-page-shell";
import { StatsGrid } from "@/components/console/stats-grid";
import type { StatItem } from "@/components/console/stats-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { PromotionEditDialog } from "./promotion-edit-dialog";

type PromotionDetailClientProps = { promotion_id: string };

const promotion_detail_tab_schema = z.enum([
  "overview",
  "codes",
  "flash_sales",
  "bundles",
  "orders",
  "usage",
]);

const STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  draft: "secondary",
  scheduled: "outline",
  paused: "destructive",
  expired: "outline",
};

const TYPE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  promo_code: "default",
  automatic: "secondary",
  flash_sale: "destructive",
  bundle: "outline",
  customer: "secondary",
};

function OverviewTab({
  promotion,
  rules,
  t,
}: {
  promotion: NonNullable<ReturnType<typeof trpc.promotions.byId.useQuery>["data"]>;
  rules: NonNullable<ReturnType<typeof trpc.promotions.byId.useQuery>["data"]>["rules"];
  t: (key: string) => string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("overview_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground text-sm">{t("name_label")}</dt>
              <dd className="font-medium">{promotion.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("slug_label")}</dt>
              <dd className="font-mono text-sm">{promotion.slug}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("type_label")}</dt>
              <dd>
                <Badge variant={TYPE_BADGE_VARIANTS[promotion.promotion_type] ?? "outline"}>
                  {t(`type_${promotion.promotion_type}`)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("status_label")}</dt>
              <dd>
                <Badge variant={STATUS_BADGE_VARIANTS[promotion.status] ?? "outline"}>
                  {t(`status_${promotion.status}`)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("priority_label")}</dt>
              <dd>{promotion.priority}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("stackable_label")}</dt>
              <dd>{promotion.is_stackable ? t("yes") : t("no")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("starts_at_label")}</dt>
              <dd>{promotion.starts_at ? formatDate(promotion.starts_at) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("ends_at_label")}</dt>
              <dd>{promotion.ends_at ? formatDate(promotion.ends_at) : "—"}</dd>
            </div>
            {promotion.description && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-sm">{t("description_label")}</dt>
                <dd className="mt-1 text-sm">{promotion.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground text-sm">{t("created_at_label")}</dt>
              <dd>{formatDate(promotion.created_at)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-sm">{t("updated_at_label")}</dt>
              <dd>{formatDate(promotion.updated_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("rules_title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">{t("rules_empty")}</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-muted/50 flex flex-wrap items-center gap-4 rounded-md px-4 py-3 text-sm"
                >
                  <Badge variant="outline" className="shrink-0">
                    {t(`scope_${rule.scope_type}`)}
                  </Badge>
                  <Badge variant="secondary" className="shrink-0">
                    {t(`discount_${rule.discount_type}`)}
                  </Badge>
                  <span className="font-medium tabular-nums">
                    {rule.discount_type === "percent" ? `${rule.discount_value}%` : `${Number(rule.discount_value).toLocaleString("fr-FR")} DZD`}
                  </span>
                  {rule.min_subtotal && (
                    <span className="text-muted-foreground text-xs">
                      {t("rule_min_subtotal")}: {Number(rule.min_subtotal).toLocaleString("fr-FR")} DZD
                    </span>
                  )}
                  {rule.min_quantity && (
                    <span className="text-muted-foreground text-xs">
                      {t("rule_min_quantity")}: {rule.min_quantity}
                    </span>
                  )}
                  {rule.max_discount_amount && (
                    <span className="text-muted-foreground text-xs">
                      {t("rule_max_discount")}: {Number(rule.max_discount_amount).toLocaleString("fr-FR")} DZD
                    </span>
                  )}
                  {rule.buy_quantity != null && rule.get_quantity != null && (
                    <span className="text-muted-foreground text-xs">
                      {t("rule_buy_quantity")}: {rule.buy_quantity} → {t("rule_get_quantity")}: {rule.get_quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CodesTab({
  promotion_id,
  t,
}: {
  promotion_id: string;
  t: (key: string) => string;
}) {
  const { data: codes, isLoading } = trpc.promotions.promoCodes.useQuery({ promotion_id });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (!codes || codes.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Ticket className="mb-2 h-10 w-10" />
        <p>{t("codes_empty")}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("codes_title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">{t("code_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_usage_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_global_limit_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_per_customer_limit_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_active_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_starts_at_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("code_ends_at_column")}</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono font-medium">{code.code}</td>
                  <td className="px-3 py-2 tabular-nums">{code.usage_count}{code.usage_limit ? ` / ${code.usage_limit}` : ""}</td>
                  <td className="px-3 py-2 tabular-nums">{code.usage_limit ? code.usage_limit.toLocaleString("fr-FR") : t("unlimited")}</td>
                  <td className="px-3 py-2 tabular-nums">{code.per_customer_limit ?? 1}</td>
                  <td className="px-3 py-2">
                    <Badge variant={code.is_active ? "default" : "outline"}>
                      {code.is_active ? t("yes") : t("no")}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{code.starts_at ? formatDate(code.starts_at) : "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{code.ends_at ? formatDate(code.ends_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function FlashSalesTab({
  promotion_id,
  t,
}: {
  promotion_id: string;
  t: (key: string) => string;
}) {
  const { data: sales, isLoading } = trpc.promotions.flashSales.useQuery({ promotion_id });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Zap className="mb-2 h-10 w-10" />
        <p>{t("flash_sales_empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <Card key={sale.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{sale.title}</CardTitle>
              <Badge variant={sale.status === "active" ? "default" : "secondary"}>
                {t(`status_${sale.status}`)}
              </Badge>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(sale.starts_at)} — {formatDate(sale.ends_at)}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-3.5 w-3.5" />
                {sale.sold_total_units ?? 0}{sale.max_total_units ? ` / ${sale.max_total_units}` : ""} {t("flash_sale_sold_column")}
              </span>
            </div>
          </CardHeader>
          {sale.items && sale.items.length > 0 && (
            <CardContent>
              <h4 className="mb-2 text-sm font-medium">{t("flash_sale_items_title")}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">{t("flash_sale_sku_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("flash_sale_product_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("flash_sale_flash_price_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("flash_sale_max_qty_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("flash_sale_sold_qty_column")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2 font-mono text-xs">{item.sku_id.slice(0, 16)}…</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.product_id.slice(0, 16)}…</td>
                        <td className="px-3 py-2 font-medium tabular-nums">{Number(item.flash_price).toLocaleString("fr-FR")} DZD</td>
                        <td className="px-3 py-2 tabular-nums">{item.max_quantity}</td>
                        <td className="px-3 py-2 tabular-nums">{item.sold_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function BundlesTab({
  promotion_id,
  t,
}: {
  promotion_id: string;
  t: (key: string) => string;
}) {
  const { data: bundles, isLoading } = trpc.promotions.bundles.useQuery({ promotion_id });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  if (!bundles || bundles.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Layers className="mb-2 h-10 w-10" />
        <p>{t("bundles_empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bundles.map((bundle) => (
        <Card key={bundle.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{bundle.name}</CardTitle>
              <Badge variant="outline">{bundle.bundle_type}</Badge>
            </div>
            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              {bundle.bundle_price && (
                <span className="tabular-nums">{Number(bundle.bundle_price).toLocaleString("fr-FR")} DZD</span>
              )}
              {bundle.discount_percent && (
                <span className="tabular-nums">{bundle.discount_percent}%</span>
              )}
              {bundle.buy_quantity != null && bundle.get_quantity != null && (
                <span>Buy {bundle.buy_quantity} Get {bundle.get_quantity}</span>
              )}
            </div>
          </CardHeader>
          {bundle.items && bundle.items.length > 0 && (
            <CardContent>
              <h4 className="mb-2 text-sm font-medium">{t("bundle_items_title")}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium">{t("bundle_item_product_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("bundle_item_sku_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("bundle_item_quantity_column")}</th>
                      <th className="px-3 py-2 text-left font-medium">{t("bundle_item_required_column")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bundle.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2 font-mono text-xs">{item.product_id ? `${item.product_id.slice(0, 16)}…` : "—"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{item.sku_id ? `${item.sku_id.slice(0, 16)}…` : "—"}</td>
                        <td className="px-3 py-2 tabular-nums">{item.quantity}</td>
                        <td className="px-3 py-2">
                          <Badge variant={item.is_required ? "default" : "outline"}>
                            {item.is_required ? t("yes") : t("no")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

const ORDER_STATUS_BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

function OrdersTab({
  promotion_id,
  t,
}: {
  promotion_id: string;
  t: (key: string) => string;
}) {
  const [page, set_page] = useState(1);
  const { data, isLoading } = trpc.promotions.ordersByPromotion.useQuery({
    promotion_id,
    page,
    limit: 20,
  });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <ShoppingCart className="mb-2 h-10 w-10" />
        <p>{t("orders_empty")}</p>
      </div>
    );
  }

  const { items, meta } = data;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">{t("order_number_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("order_status_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("order_payment_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("order_total_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_code_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_discount_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("order_placed_at_column")}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.redemption_id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 font-mono font-medium">{row.order_number}</td>
                  <td className="px-3 py-2">
                    <Badge variant={ORDER_STATUS_BADGE_VARIANTS[row.status] ?? "outline"}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={row.payment_status === "paid" ? "default" : "secondary"}>
                      {row.payment_status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 font-medium tabular-nums">
                    {Number(row.grand_total).toLocaleString("fr-FR")} {row.currency}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.code ? row.code.toUpperCase() : "—"}</td>
                  <td className="px-3 py-2 font-medium tabular-nums text-green-600">
                    -{Number(row.discount_amount).toLocaleString("fr-FR")} DZD
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {row.placed_at ? formatDate(row.placed_at) : formatDate(row.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={`/console/orders/${row.order_id}`}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("usage_page_of", { current: String(meta.page), total: String(meta.totalPages) })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => set_page((p) => p - 1)}
                className="bg-secondary text-foreground disabled:text-muted-foreground rounded-md px-3 py-1 text-sm disabled:opacity-50"
              >
                ←
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => set_page((p) => p + 1)}
                className="bg-secondary text-foreground disabled:text-muted-foreground rounded-md px-3 py-1 text-sm disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UsageTab({
  promotion_id,
  t,
}: {
  promotion_id: string;
  t: (key: string) => string;
}) {
  const [page, set_page] = useState(1);
  const { data, isLoading } = trpc.promotions.redemptions.useQuery({
    promotion_id,
    page,
    limit: 20,
  });

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
        <Ticket className="mb-2 h-10 w-10" />
        <p>{t("usage_empty")}</p>
      </div>
    );
  }

  const { items, meta } = data;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">{t("usage_date_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_user_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_code_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_order_column")}</th>
                <th className="px-3 py-2 text-left font-medium">{t("usage_discount_column")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 text-muted-foreground">{formatDate(row.created_at)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.user_id ? `${row.user_id.slice(0, 12)}…` : "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.code ? row.code.toUpperCase() : "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.order_id ? `${row.order_id.slice(0, 12)}…` : "—"}</td>
                  <td className="px-3 py-2 font-medium tabular-nums text-green-600">
                    -{Number(row.discount_amount).toLocaleString("fr-FR")} DZD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t("usage_page_of", { current: String(meta.page), total: String(meta.totalPages) })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => set_page((p) => p - 1)}
                className="bg-secondary text-foreground disabled:text-muted-foreground rounded-md px-3 py-1 text-sm disabled:opacity-50"
              >
                ←
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => set_page((p) => p + 1)}
                className="bg-secondary text-foreground disabled:text-muted-foreground rounded-md px-3 py-1 text-sm disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PromotionDetailClient({ promotion_id }: PromotionDetailClientProps) {
  const t = useTranslations("promotion_detail");
  const router = useRouter();
  const search_params = useSearchParams();
  const [edit_open, set_edit_open] = useState(false);

  const parsed = promotion_detail_tab_schema.safeParse(search_params.get("tab"));
  const active_tab = parsed.success ? parsed.data : "overview";

  const on_tab_change = useCallback(
    (value: string) => {
      const params = new URLSearchParams(search_params.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, search_params],
  );

  const { data: promotion, isLoading: promo_loading } = trpc.promotions.byId.useQuery({ id: promotion_id });
  const { data: stats, isLoading: stats_loading } = trpc.promotions.detailStats.useQuery({ promotion_id });

  const is_loading = promo_loading || stats_loading;

  return (
    <QueryGuard
      query={{ isLoading: is_loading }}
      loadingFallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      {promotion && stats && (
        <ConsolePageShell
          back_href="/console/promotions"
          title={promotion.name}
          subtitle={`${t(`type_${promotion.promotion_type}`)} · ${t(`status_${promotion.status}`)}`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => set_edit_open(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("edit_button")}
              </Button>
              <Badge variant={STATUS_BADGE_VARIANTS[promotion.status] ?? "outline"}>
                {t(`status_${promotion.status}`)}
              </Badge>
            </div>
          }
          stats={
            <StatsGrid
              items={[
                { label: t("stats_redemptions"), value: stats.total_redemptions, icon: Ticket, color: "default" },
                {
                  label: t("stats_total_discount"),
                  value: `${Number(stats.total_discount_amount).toLocaleString("fr-FR")} DZD`,
                  icon: DollarSign,
                  color: "success",
                },
                { label: t("stats_promo_codes_count"), value: stats.total_promo_codes, icon: Hash, color: "info" },
                { label: t("stats_bundles_count"), value: stats.total_bundles, icon: Layers, color: "default" },
              ] satisfies StatItem[]}
            />
          }
        >
          <Tabs value={active_tab} onValueChange={on_tab_change}>
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <Tag className="size-4" />
                {t("overview_tab")}
              </TabsTrigger>
              <TabsTrigger value="codes" className="gap-2">
                <Ticket className="size-4" />
                {t("codes_tab")}
              </TabsTrigger>
              <TabsTrigger value="flash_sales" className="gap-2">
                <Zap className="size-4" />
                {t("flash_sales_tab")}
              </TabsTrigger>
              <TabsTrigger value="bundles" className="gap-2">
                <Layers className="size-4" />
                {t("bundles_tab")}
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="size-4" />
                {t("orders_tab")}
              </TabsTrigger>
              <TabsTrigger value="usage" className="gap-2">
                <BadgePercent className="size-4" />
                {t("usage_tab")}
              </TabsTrigger>
            </TabsList>

            <Separator className="my-4" />

            <TabsContent value="overview" className="mt-0">
              <OverviewTab promotion={promotion} rules={promotion.rules} t={t} />
            </TabsContent>

            <TabsContent value="codes" className="mt-0">
              <CodesTab promotion_id={promotion_id} t={t} />
            </TabsContent>

            <TabsContent value="flash_sales" className="mt-0">
              <FlashSalesTab promotion_id={promotion_id} t={t} />
            </TabsContent>

            <TabsContent value="bundles" className="mt-0">
              <BundlesTab promotion_id={promotion_id} t={t} />
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <OrdersTab promotion_id={promotion_id} t={t} />
            </TabsContent>

            <TabsContent value="usage" className="mt-0">
              <UsageTab promotion_id={promotion_id} t={t} />
            </TabsContent>
          </Tabs>
        </ConsolePageShell>
      )}
      <PromotionEditDialog
        open={edit_open}
        on_open_change={set_edit_open}
        promotion={promotion ?? null}
      />
    </QueryGuard>
  );
}
