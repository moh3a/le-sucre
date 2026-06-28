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

  const kpis = [
    {
      title: t("impressions"),
      value: summary.total_impressions.toLocaleString(),
      desc: t("impressions_desc"),
      icon: Eye,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: t("clicks"),
      value: clickCount.toLocaleString(),
      desc: `${t("banner")}: ${summary.total_banner_clicks} | ${t("other")}: ${summary.total_clicks}`,
      icon: MousePointerClick,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: t("ctr"),
      value: `${ctr.toFixed(2)} %`,
      desc: t("ctr_desc"),
      icon: Percent,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: t("add_to_cart"),
      value: summary.total_add_to_cart.toLocaleString(),
      desc: t("add_to_cart_desc"),
      icon: ShoppingCart,
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      title: t("conversions"),
      value: summary.total_conversions.toLocaleString(),
      desc: `${t("conv_rate")}: ${cr.toFixed(2)}%`,
      icon: TrendingUp,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: t("revenue"),
      value: `${Number(summary.total_revenue).toLocaleString()} DZD`,
      desc: t("revenue_desc"),
      icon: Coins,
      color: "text-[#c8d152] bg-[#c8d152]/10",
    },
  ];

  return (
    <QueryGuard query={{ isLoading }}>
    <div className="space-y-6">
      {/* Date filter range */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          <span>
            Données du {format(subDays(new Date(), rangeDays), "dd MMMM", { locale: fr })} au{" "}
            {format(new Date(), "dd MMMM yyyy", { locale: fr })}
          </span>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={rangeDays === d ? "default" : "outline"}
              size="sm"
              onClick={() => setRangeDays(d)}
              className={rangeDays === d ? "bg-[#c8d152] text-[#4d4c20] hover:bg-[#c8d152]/90" : ""}
            >
              Derniers {d} jours
            </Button>
          ))}
        </div>
      </div>

      {/* KPI metrics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="border shadow">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-muted-foreground text-[10px]">{kpi.desc}</p>
              </div>
              <div className={`rounded-lg p-3 ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  <TableHead>Jour</TableHead>
                  <TableHead>Vues (Imp.)</TableHead>
                  <TableHead>Clics</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Ajouts Panier</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead className="text-right">Revenu</TableHead>
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
                          bannière: {day.banner_clicks ?? 0}
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
