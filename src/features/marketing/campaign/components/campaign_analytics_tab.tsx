"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Percent,
  Coins,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { StatsGrid, type StatItem } from "@/components/console/stats-grid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AnalyticsTabProps = {
  campaign_id: string;
};

export function CampaignAnalyticsTab({ campaign_id }: AnalyticsTabProps) {
  const t = useTranslations("campaigns");
  const [rangeDays, setRangeDays] = useState(30);

  const toStr = format(new Date(), "yyyy-MM-dd");
  const fromStr = format(subDays(new Date(), rangeDays), "yyyy-MM-dd");

  const { data, isLoading } = trpc.campaigns.analytics.useQuery({
    campaign_id,
    from: fromStr,
    to: toStr,
  });

  // Fallback calculations if data is empty
  const summary = data?.summary ?? {
    total_impressions: 0,
    total_clicks: 0,
    total_banner_clicks: 0,
    total_add_to_cart: 0,
    total_conversions: 0,
    total_revenue: "0",
    total_unique_visitors: 0,
  };

  const timeseries = data?.timeseries ?? [];

  const clickCount = summary.total_clicks + summary.total_banner_clicks;
  const ctr = summary.total_impressions > 0 ? (clickCount / summary.total_impressions) * 100 : 0;
  const cr = clickCount > 0 ? (summary.total_conversions / clickCount) * 100 : 0;

  const stats: StatItem[] = [
    {
      label: t("impressions"),
      value: summary.total_impressions.toLocaleString(),
      description: t("impressions_desc"),
      icon: Eye,
      color: "info",
    },
    {
      label: t("clicks"),
      value: clickCount.toLocaleString(),
      description: `${t("banner")}: ${summary.total_banner_clicks} | ${t("other")}: ${summary.total_clicks}`,
      icon: MousePointerClick,
      color: "warning",
    },
    {
      label: t("ctr"),
      value: `${ctr.toFixed(2)} %`,
      description: t("ctr_desc"),
      icon: Percent,
      color: "success",
    },
    {
      label: t("add_to_cart"),
      value: summary.total_add_to_cart.toLocaleString(),
      description: t("add_to_cart_desc"),
      icon: ShoppingCart,
      color: "info",
    },
    {
      label: t("conversions"),
      value: summary.total_conversions.toLocaleString(),
      description: `${t("conv_rate")}: ${cr.toFixed(2)}%`,
      icon: TrendingUp,
      color: "success",
    },
    {
      label: t("revenue"),
      value: `${Number(summary.total_revenue).toLocaleString()} DZD`,
      description: t("revenue_desc"),
      icon: Coins,
      color: "default",
    },
  ];

  return (
    <QueryGuard query={{ isLoading }}>
      <div className="space-y-6">
        {/* Date filter range */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {t("analytics_period", {
                from: format(subDays(new Date(), rangeDays), "dd MMMM", { locale: fr }),
                to: format(new Date(), "dd MMMM yyyy", { locale: fr }),
              })}
            </span>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={rangeDays === d ? "default" : "outline"}
                size="sm"
                onClick={() => setRangeDays(d)}
                className={
                  rangeDays === d ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                }
              >
                {t("analytics_last_days", { days: d })}
              </Button>
            ))}
          </div>
        </div>

        {/* KPI metrics cards */}
        <StatsGrid loading={isLoading} items={stats} />

        {/* Daily analytics details list */}
        <Card>
          <CardHeader>
            <CardTitle>{t("daily_history_title")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {timeseries.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center text-sm">
                {t("no_analytics_data")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("analytics_day")}</TableHead>
                    <TableHead>{t("analytics_views")}</TableHead>
                    <TableHead>{t("clicks")}</TableHead>
                    <TableHead>{t("ctr")}</TableHead>
                    <TableHead>{t("add_to_cart")}</TableHead>
                    <TableHead>{t("conversions")}</TableHead>
                    <TableHead className="text-right">{t("revenue")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeseries.map((day) => {
                    const dayClicks = (day.clicks ?? 0) + (day.banner_clicks ?? 0);
                    const dayCtr = day.impressions > 0 ? (dayClicks / day.impressions) * 100 : 0;
                    return (
                      <TableRow key={day.id ?? day.day_key}>
                        <TableCell className="font-medium">
                          {format(new Date(day.day_key), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>{(day.impressions ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          {dayClicks.toLocaleString()}
                          <span className="text-muted-foreground block text-[10px]">
                            {t("analytics_banner_clicks")}: {day.banner_clicks ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{dayCtr.toFixed(2)} %</TableCell>
                        <TableCell>{(day.add_to_cart ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{(day.conversions ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {Number(day.revenue ?? 0).toLocaleString()} DZD
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </QueryGuard>
  );
}
